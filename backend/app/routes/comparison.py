from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from collections import Counter
from app.database import get_db
from app.models import (
    Election, 
    ElectionResult, 
    ParliamentaryConstituency, 
    AssemblyConstituency, 
    ACHistoricalIntelligence,
    PCACMapping
)
from app.services.competitiveness import calculate_competitiveness_score
from app.services.change_detector import detect_electoral_changes

router = APIRouter(prefix="/api", tags=["Comparison Labs"])

class ConstituencyCompareRequest(BaseModel):
    chamber: str = "Assembly" # "Assembly" or "Parliamentary"
    ids: List[int] # AC numbers or PC ids

@router.get("/elections/compare")
def compare_elections(
    year1: int = Query(2022, description="Baseline year"),
    type1: str = Query("Vidhan Sabha", description="Baseline chamber"),
    year2: int = Query(2024, description="Comparison year"),
    type2: str = Query("Lok Sabha", description="Comparison chamber"),
    db: Session = Depends(get_db)
):
    """
    ELECTION COMPARISON LAB
    Compares two election cycles across all 403 assembly segments:
      - e.g. 2022 Vidhan Sabha vs 2024 Lok Sabha Assembly Segment Leads
      - e.g. 2017 Vidhan Sabha vs 2022 Vidhan Sabha
    Produces "What Changed?" analytics, party shifts, and flipped seat breakdown.
    """
    records = db.query(ACHistoricalIntelligence).order_by(ACHistoricalIntelligence.ac_no.asc()).all()
    
    items = []
    flips = []
    retained = []
    party_shift_1 = Counter()
    party_shift_2 = Counter()
    
    for r in records:
        if year1 == 2017 and year2 == 2022:
            w1_party = r.winner_2017_party or "OTHER"
            w1_cand = r.winner_2017_candidate or "N/A"
            w1_margin = r.margin_2017 or 0
            w2_party = r.winner_2022_party or "OTHER"
            w2_cand = r.winner_2022_candidate or "N/A"
            w2_margin = r.margin_2022 or 0
        elif year1 == 2022 and year2 == 2024:
            w1_party = r.winner_2022_party or "OTHER"
            w1_cand = r.winner_2022_candidate or "N/A"
            w1_margin = r.margin_2022 or 0
            w2_party = r.lead_2024_party or "OTHER"
            w2_cand = r.lead_2024_candidate or "N/A"
            w2_margin = r.margin_2024 or 0
        else: # Default 2019 vs 2024
            w1_party = r.lead_2019_party or "OTHER"
            w1_cand = r.lead_2019_candidate or "N/A"
            w1_margin = r.margin_2019 or 0
            w2_party = r.lead_2024_party or "OTHER"
            w2_cand = r.lead_2024_candidate or "N/A"
            w2_margin = r.margin_2024 or 0

        party_shift_1[w1_party] += 1
        party_shift_2[w2_party] += 1

        is_flip = (w1_party != w2_party)
        margin_delta = w2_margin - w1_margin
        
        seat_entry = {
            "ac_no": r.ac_no,
            "ac_name": r.ac_name,
            "district": r.district,
            "region": r.region,
            "baseline": {
                "party": w1_party,
                "candidate": w1_cand,
                "margin": w1_margin
            },
            "comparison": {
                "party": w2_party,
                "candidate": w2_cand,
                "margin": w2_margin
            },
            "status": "FLIPPED" if is_flip else "RETAINED",
            "margin_delta": margin_delta,
            "swing_summary": f"From {w1_party} (+{w1_margin:,}) to {w2_party} (+{w2_margin:,})" if is_flip else f"{w1_party} held with {margin_delta:+,} margin shift"
        }
        
        if is_flip:
            flips.append(seat_entry)
        else:
            retained.append(seat_entry)
            
        items.append(seat_entry)

    # What Changed Takeaways
    party_deltas = {}
    all_parties = set(list(party_shift_1.keys()) + list(party_shift_2.keys()))
    for p in all_parties:
        count1 = party_shift_1.get(p, 0)
        count2 = party_shift_2.get(p, 0)
        party_deltas[p] = {
            "baseline_seats": count1,
            "comparison_seats": count2,
            "net_change": count2 - count1
        }

    takeaways = []
    top_gainers = sorted(party_deltas.items(), key=lambda x: x[1]["net_change"], reverse=True)
    top_decliners = sorted(party_deltas.items(), key=lambda x: x[1]["net_change"])
    
    if top_gainers and top_gainers[0][1]["net_change"] > 0:
        p_gain = top_gainers[0]
        takeaways.append(f"{p_gain[0]} recorded the largest seat expansion with a net gain of +{p_gain[1]['net_change']} seats (from {p_gain[1]['baseline_seats']} to {p_gain[1]['comparison_seats']}).")
        
    if top_decliners and top_decliners[0][1]["net_change"] < 0:
        p_dec = top_decliners[0]
        takeaways.append(f"{p_dec[0]} saw the steepest seat contraction with a net decline of {p_dec[1]['net_change']} seats (from {p_dec[1]['baseline_seats']} to {p_dec[1]['comparison_seats']}).")

    takeaways.append(f"A total of {len(flips)} seats ({round(len(flips)/len(records)*100, 1)}%) changed party hands between {year1} and {year2}, while {len(retained)} seats ({round(len(retained)/len(records)*100, 1)}%) were retained by the incumbent party.")

    return {
        "baseline_election": f"{year1} {type1}",
        "comparison_election": f"{year2} {type2}",
        "total_seats_compared": len(records),
        "flipped_seats_count": len(flips),
        "retained_seats_count": len(retained),
        "flip_rate_pct": round(len(flips) / len(records) * 100, 1),
        "party_deltas": party_deltas,
        "what_changed_takeaways": takeaways,
        "flipped_seats": flips,
        "all_seats": items
    }

@router.post("/constituencies/compare")
def compare_constituencies(
    req: ConstituencyCompareRequest,
    db: Session = Depends(get_db)
):
    """
    AC / PC COMPARISON LAB
    Compares 2 to 5 constituencies side-by-side across:
      - Winner & runner-up
      - Vote totals & margin
      - Competitiveness score & breakdown
      - Multi-election historical changes
    """
    if len(req.ids) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 constituency IDs to compare.")
    if len(req.ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 constituencies can be compared simultaneously.")

    results = []
    
    if req.chamber == "Assembly":
        records = db.query(ACHistoricalIntelligence).filter(
            ACHistoricalIntelligence.ac_no.in_(req.ids)
        ).all()
        
        for r in records:
            comp = calculate_competitiveness_score(
                margin_pct=r.margin_pct_2024 or 5.0,
                winner_votes=r.lead_2024_votes or 70000,
                runner_up_votes=r.runner_2024_votes or 60000,
                party_turnover_count=1 if r.winner_2022_party != r.lead_2024_party else 0,
                historical_margins=[r.margin_2017 or 10000, r.margin_2019 or 10000, r.margin_2022 or 10000, r.margin_2024 or 10000]
            )
            
            results.append({
                "id": r.ac_no,
                "name": r.ac_name,
                "district": r.district,
                "region": r.region,
                "category": r.category or "GEN",
                "parent_pc": f"{r.pc_name} (#{r.pc_no})",
                "latest_election": {
                    "cycle": "2024 Lok Sabha Lead",
                    "winner_party": r.lead_2024_party,
                    "winner_candidate": r.lead_2024_candidate,
                    "runner_up_party": r.runner_2024_party,
                    "runner_up_candidate": r.runner_2024_candidate,
                    "margin": r.margin_2024,
                    "margin_pct": r.margin_pct_2024,
                    "total_votes": r.total_votes_2024
                },
                "assembly_2022": {
                    "winner_party": r.winner_2022_party,
                    "winner_candidate": r.winner_2022_candidate,
                    "margin": r.margin_2022
                },
                "assembly_2017": {
                    "winner_party": r.winner_2017_party,
                    "winner_candidate": r.winner_2017_candidate,
                    "margin": r.margin_2017
                },
                "competitiveness": comp
            })
    else: # Parliamentary
        from app.query_guards import get_pc_results_query
        pc_results = get_pc_results_query(db, year=2024).filter(
            ParliamentaryConstituency.id.in_(req.ids)
        ).join(ParliamentaryConstituency).all()
        
        for r in pc_results:
            pc = r.pc
            results.append({
                "id": pc.id,
                "name": pc.name,
                "category": pc.category,
                "parent_pc": "Parliamentary Seat",
                "latest_election": {
                    "cycle": "2024 Lok Sabha",
                    "winner_party": r.winner_party.code if r.winner_party else "OTHER",
                    "winner_candidate": r.winner_candidate.name if r.winner_candidate else "N/A",
                    "runner_up_party": r.runner_up_party.code if r.runner_up_party else "OTHER",
                    "runner_up_candidate": r.runner_up_candidate.name if r.runner_up_candidate else "N/A",
                    "margin": r.margin,
                    "margin_pct": round((r.margin / r.valid_votes) * 100, 2) if r.valid_votes else 0.0,
                    "turnout_pct": r.turnout_pct,
                    "total_electors": r.total_electors,
                    "valid_votes": r.valid_votes
                }
            })
            
    return {
        "chamber": req.chamber,
        "constituencies_count": len(results),
        "comparison_items": results
    }
