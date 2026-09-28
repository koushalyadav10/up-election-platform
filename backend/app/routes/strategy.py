from app.services.competitiveness import calculate_competitiveness_score
from app.services.change_detector import detect_electoral_changes
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import ACHistoricalIntelligence

router = APIRouter(prefix="/api/strategy", tags=["Road to 2027 Strategy"])

class SwingSimulationRequest(BaseModel):
    sp_swing_pct: float = 0.0
    bjp_swing_pct: float = 0.0
    bsp_transfer_to_sp_pct: float = 0.0
    region_filter: Optional[str] = None

@router.get("/summary")
def get_strategy_summary(db: Session = Depends(get_db)):
    records = db.query(ACHistoricalIntelligence).all()
    total_acs = len(records)
    
    leads_2024 = {}
    actuals_2022 = {}
    actuals_2017 = {}
    regions_data = {}
    
    cat_counts = {
        "FORTRESS": 0,
        "PRIME_FLIP": 0,
        "ALLIANCE_FLIP": 0,
        "DEFENSIVE_ALERT": 0,
        "NEAR_MISS_TARGET": 0,
        "OPPONENT_STRONGHOLD": 0,
        "COMPETITIVE_OTHER": 0
    }
    
    battleground_count = 0
    near_miss_count = 0
    
    for r in records:
        lp = r.lead_2024_party or "OTHER"
        leads_2024[lp] = leads_2024.get(lp, 0) + 1
        
        w22 = r.winner_2022_party or "OTHER"
        actuals_2022[w22] = actuals_2022.get(w22, 0) + 1
        
        w17 = r.winner_2017_party or "OTHER"
        actuals_2017[w17] = actuals_2017.get(w17, 0) + 1
        
        cat = r.strategic_category or "COMPETITIVE_OTHER"
        if cat in cat_counts:
            cat_counts[cat] += 1
        else:
            cat_counts["COMPETITIVE_OTHER"] += 1
            
        if r.is_battleground:
            battleground_count += 1
        if r.is_near_miss:
            near_miss_count += 1
            
        reg = r.region or "Other"
        if reg not in regions_data:
            regions_data[reg] = {
                "region": reg,
                "total_seats": 0,
                "sp_2022": 0,
                "bjp_2022": 0,
                "sp_2024_leads": 0,
                "inc_2024_leads": 0,
                "bjp_2024_leads": 0,
                "battlegrounds": 0,
                "prime_flips": 0
            }
        regions_data[reg]["total_seats"] += 1
        if w22 == "SP":
            regions_data[reg]["sp_2022"] += 1
        elif w22 == "BJP":
            regions_data[reg]["bjp_2022"] += 1
            
        if lp == "SP":
            regions_data[reg]["sp_2024_leads"] += 1
        elif lp == "INC":
            regions_data[reg]["inc_2024_leads"] += 1
        elif lp == "BJP":
            regions_data[reg]["bjp_2024_leads"] += 1
            
        if r.is_battleground:
            regions_data[reg]["battlegrounds"] += 1
        if r.is_prime_flip:
            regions_data[reg]["prime_flips"] += 1

    india_leads = leads_2024.get("SP", 0) + leads_2024.get("INC", 0) + leads_2024.get("AITC", 0)
    nda_leads = leads_2024.get("BJP", 0) + leads_2024.get("RLD", 0) + leads_2024.get("ADAL", 0)
    
    category_meta = [
        {
            "key": "FORTRESS",
            "label": "SP Fortress Seats",
            "count": cat_counts["FORTRESS"],
            "color": "#16a34a",
            "description": "Won by SP in 2022 and retained lead in 2024 LS. Core foundational base."
        },
        {
            "key": "PRIME_FLIP",
            "label": "Prime 2024 Flips",
            "count": cat_counts["PRIME_FLIP"],
            "color": "#059669",
            "description": "Lost to BJP/NDA in 2022, but flipped to SP lead in 2024 LS. High expansion value."
        },
        {
            "key": "ALLIANCE_FLIP",
            "label": "Alliance Flips (INC/AITC)",
            "count": cat_counts["ALLIANCE_FLIP"],
            "color": "#2563eb",
            "description": "Flipped to INDIA alliance partners (INC/AITC) in 2024 LS."
        },
        {
            "key": "NEAR_MISS_TARGET",
            "label": "Near-Miss Targets (<10k)",
            "count": near_miss_count,
            "color": "#d97706",
            "description": "NDA led in 2024 by under 10,000 votes. Prime crossover targets for 2027."
        },
        {
            "key": "DEFENSIVE_ALERT",
            "label": "Defensive Watchlist",
            "count": cat_counts["DEFENSIVE_ALERT"],
            "color": "#dc2626",
            "description": "Won by SP in 2022, but slipped behind NDA in 2024 LS. Urgent ground defense required."
        },
        {
            "key": "BATTLEGROUND",
            "label": "Razor Battlegrounds (<5k)",
            "count": battleground_count,
            "color": "#ea580c",
            "description": "Decided by razor-thin margin (<5,000 votes) in 2024 LS. Critical booth focus."
        }
    ]

    return {
        "title": "Road to 2027: UP Vidhan Sabha Strategic Blueprint",
        "total_acs": total_acs,
        "majority_mark": 202,
        "india_leads_2024": india_leads,
        "nda_leads_2024": nda_leads,
        "sp_leads_2024": leads_2024.get("SP", 0),
        "inc_leads_2024": leads_2024.get("INC", 0),
        "bjp_leads_2024": leads_2024.get("BJP", 0),
        "sp_actuals_2022": actuals_2022.get("SP", 0),
        "bjp_actuals_2022": actuals_2022.get("BJP", 0),
        "expansion_delta": leads_2024.get("SP", 0) - actuals_2022.get("SP", 0),
        "leads_2024_breakdown": leads_2024,
        "actuals_2022_breakdown": actuals_2022,
        "actuals_2017_breakdown": actuals_2017,
        "categories": category_meta,
        "regions": list(regions_data.values()),
        "source": "Election Commission of India (ECI) Certified Data"
    }

@router.get("/matrix")
def get_strategy_matrix(
    category: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    lead_party: Optional[str] = Query(None),
    winner_2022: Optional[str] = Query(None),
    is_battleground: Optional[bool] = Query(None),
    is_near_miss: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(ACHistoricalIntelligence)
    
    if category:
        if category == "BATTLEGROUND":
            query = query.filter(ACHistoricalIntelligence.is_battleground == True)
        elif category == "NEAR_MISS":
            query = query.filter(ACHistoricalIntelligence.is_near_miss == True)
        else:
            query = query.filter(ACHistoricalIntelligence.strategic_category == category)
            
    if region:
        query = query.filter(ACHistoricalIntelligence.region == region)
    if district:
        query = query.filter(ACHistoricalIntelligence.district.ilike(f"%{district}%"))
    if lead_party:
        if lead_party == "INDIA":
            query = query.filter(ACHistoricalIntelligence.lead_2024_party.in_(["SP", "INC", "AITC"]))
        elif lead_party == "NDA":
            query = query.filter(ACHistoricalIntelligence.lead_2024_party.in_(["BJP", "RLD", "ADAL", "NINSHAD", "SBSP"]))
        else:
            query = query.filter(ACHistoricalIntelligence.lead_2024_party == lead_party)
            
    if winner_2022:
        query = query.filter(ACHistoricalIntelligence.winner_2022_party == winner_2022)
    if is_battleground is not None:
        query = query.filter(ACHistoricalIntelligence.is_battleground == is_battleground)
    if is_near_miss is not None:
        query = query.filter(ACHistoricalIntelligence.is_near_miss == is_near_miss)
    if search:
        query = query.filter(or_(
            ACHistoricalIntelligence.ac_name.ilike(f"%{search}%"),
            ACHistoricalIntelligence.district.ilike(f"%{search}%"),
            ACHistoricalIntelligence.pc_name.ilike(f"%{search}%"),
            ACHistoricalIntelligence.lead_2024_candidate.ilike(f"%{search}%"),
            ACHistoricalIntelligence.winner_2022_candidate.ilike(f"%{search}%")
        ))
        
    records = query.order_by(ACHistoricalIntelligence.ac_no.asc()).all()
    
    items = []
    for r in records:
        margin = r.margin_2024 or 0
        total_votes = r.total_votes_2024 or 1
        swing_needed = round((margin / (2 * total_votes)) * 100.0, 2)
        
        items.append({
            "id": r.id,
            "ac_no": r.ac_no,
            "ac_name": r.ac_name,
            "category": r.category,
            "district": r.district,
            "region": r.region,
            "pc_no": r.pc_no,
            "pc_name": r.pc_name,
            "winner_2017_party": r.winner_2017_party,
            "winner_2017_candidate": r.winner_2017_candidate,
            "margin_2017": r.margin_2017,
            "lead_2019_party": r.lead_2019_party,
            "lead_2019_candidate": r.lead_2019_candidate,
            "margin_2019": r.margin_2019,
            "winner_2022_party": r.winner_2022_party,
            "winner_2022_candidate": r.winner_2022_candidate,
            "margin_2022": r.margin_2022,
            "runner_2022_party": r.runner_2022_party,
            "lead_2024_party": r.lead_2024_party,
            "lead_2024_candidate": r.lead_2024_candidate,
            "lead_2024_votes": r.lead_2024_votes,
            "runner_2024_party": r.runner_2024_party,
            "runner_2024_candidate": r.runner_2024_candidate,
            "runner_2024_votes": r.runner_2024_votes,
            "margin_2024": r.margin_2024,
            "margin_pct_2024": r.margin_pct_2024,
            "total_votes_2024": r.total_votes_2024,
            "strategic_category": r.strategic_category,
            "is_battleground": r.is_battleground,
            "is_prime_flip": r.is_prime_flip,
            "is_fortress": r.is_fortress,
            "is_defensive_alert": r.is_defensive_alert,
            "is_near_miss": r.is_near_miss,
            "target_priority": r.target_priority,
            "swing_needed_pct": swing_needed,
            "recommendation_note": r.recommendation_note
        })
        
    return {
        "total": len(items),
        "items": items
    }

@router.post("/simulate-swing")
def simulate_swing(
    req: SwingSimulationRequest,
    db: Session = Depends(get_db)
):
    records = db.query(ACHistoricalIntelligence).all()
    
    projected_tallies = {}
    flipped_seats = []
    vulnerable_seats = []
    
    sp_swing_frac = req.sp_swing_pct / 100.0
    bjp_swing_frac = req.bjp_swing_pct / 100.0
    bsp_transfer_frac = req.bsp_transfer_to_sp_pct / 100.0
    
    for r in records:
        if req.region_filter and r.region != req.region_filter:
            winner = r.lead_2024_party or "OTHER"
            projected_tallies[winner] = projected_tallies.get(winner, 0) + 1
            continue
            
        tot = r.total_votes_2024 or 150000
        sp_v = r.sp_votes_2024 or 0
        bjp_v = r.bjp_votes_2024 or 0
        inc_v = r.inc_votes_2024 or 0
        bsp_v = r.bsp_votes_2024 or 0
        rld_v = r.rld_votes_2024 or 0
        
        transfer_v = bsp_v * bsp_transfer_frac
        sp_v += transfer_v
        bsp_v -= transfer_v
        
        sp_v += tot * sp_swing_frac
        bjp_v += tot * bjp_swing_frac
        
        party_votes = {
            "SP": max(0, sp_v),
            "BJP": max(0, bjp_v),
            "INC": max(0, inc_v),
            "BSP": max(0, bsp_v),
            "RLD": max(0, rld_v)
        }
        
        if r.lead_2024_party and r.lead_2024_party not in party_votes:
            party_votes[r.lead_2024_party] = r.lead_2024_votes or 0
        if r.runner_2024_party and r.runner_2024_party not in party_votes:
            party_votes[r.runner_2024_party] = r.runner_2024_votes or 0
            
        sorted_p = sorted(party_votes.items(), key=lambda x: x[1], reverse=True)
        proj_winner = sorted_p[0][0]
        proj_lead_votes = sorted_p[0][1]
        proj_runner_votes = sorted_p[1][1] if len(sorted_p) > 1 else 0
        proj_margin = proj_lead_votes - proj_runner_votes
        
        projected_tallies[proj_winner] = projected_tallies.get(proj_winner, 0) + 1
        
        orig_winner = r.lead_2024_party
        if proj_winner != orig_winner:
            flipped_seats.append({
                "ac_no": r.ac_no,
                "ac_name": r.ac_name,
                "district": r.district,
                "region": r.region,
                "original_2024_lead": orig_winner,
                "original_margin": r.margin_2024,
                "simulated_winner": proj_winner,
                "simulated_margin": int(proj_margin)
            })
            
        if proj_margin < 3000:
            vulnerable_seats.append({
                "ac_no": r.ac_no,
                "ac_name": r.ac_name,
                "district": r.district,
                "projected_winner": proj_winner,
                "projected_margin": int(proj_margin)
            })
            
    india_total = projected_tallies.get("SP", 0) + projected_tallies.get("INC", 0) + projected_tallies.get("AITC", 0)
    nda_total = projected_tallies.get("BJP", 0) + projected_tallies.get("RLD", 0) + projected_tallies.get("ADAL", 0)
    
    return {
        "simulation_parameters": {
            "sp_swing_pct": req.sp_swing_pct,
            "bjp_swing_pct": req.bjp_swing_pct,
            "bsp_transfer_to_sp_pct": req.bsp_transfer_to_sp_pct,
            "region_filter": req.region_filter
        },
        "majority_mark": 202,
        "india_projected_total": india_total,
        "nda_projected_total": nda_total,
        "majority_reached": india_total >= 202,
        "buffer_above_majority": india_total - 202,
        "projected_tallies": projected_tallies,
        "flipped_seats_count": len(flipped_seats),
        "flipped_seats": flipped_seats[:50],
        "vulnerable_seats_count": len(vulnerable_seats),
        "vulnerable_seats": vulnerable_seats[:30]
    }


def compute_electoral_intelligence(r: ACHistoricalIntelligence):
    """
    NEUTRAL ELECTORAL INTELLIGENCE & DEMOGRAPHIC CONTEXT
    Non-partisan political science analysis:
      - Formula-driven competitiveness index
      - Factual election changes
      - Census aggregate context (No voter targeting by caste/religion)
    """
    margin_24 = r.margin_2024 or 0
    total_votes = r.total_votes_2024 or 150000
    margin_pct = r.margin_pct_2024 or round((margin_24 / total_votes) * 100.0, 2)
    
    comp = calculate_competitiveness_score(
        margin_pct=margin_pct,
        winner_votes=r.lead_2024_votes or 70000,
        runner_up_votes=r.runner_2024_votes or 60000,
        party_turnover_count=1 if r.winner_2022_party != r.lead_2024_party else 0,
        historical_margins=[r.margin_2017 or 10000, r.margin_2019 or 10000, r.margin_2022 or 10000, r.margin_2024 or 10000]
    )
    
    changes = detect_electoral_changes(
        baseline_election="2022 Vidhan Sabha",
        comparison_election="2024 Lok Sabha Lead",
        baseline_data={"winner_party": r.winner_2022_party, "winner_candidate": r.winner_2022_candidate, "margin": r.margin_2022},
        comparison_data={"winner_party": r.lead_2024_party, "winner_candidate": r.lead_2024_candidate, "margin": r.margin_2024}
    )
    
    # Public aggregate census context (Descriptive only)
    demographic_context = {
        "administrative_region": r.region or "Uttar Pradesh",
        "district": r.district or "N/A",
        "electoral_category": r.category or "GEN",
        "electorate_context": f"Assembly segment #{r.ac_no} located within {r.district} District ({r.region or 'UP'})."
    }

    strategic_summary = (
        f"In {r.ac_name} ({r.district}), {r.lead_2024_party} led by {margin_24:,} votes in 2024. "
        f"Constituency competitiveness is classified as {comp['classification']} ({comp['overall_score']}/100)."
    )

    return {
        "competitiveness": comp,
        "electoral_changes": changes["summary_statements"],
        "demographic_context": demographic_context,
        "strategic_summary": strategic_summary,
        # Backward compatibility layer for UI components
        "pda_coalition": {
            "obc_profile": "Aggregate regional backward class rural/urban distribution.",
            "dalit_profile": "Public aggregate Scheduled Caste population context.",
            "minority_profile": "Regional demographic distribution per Census data.",
            "synergy_score": f"Competitiveness: {comp['overall_score']}/100",
            "pda_status": comp["classification"]
        },
        "candidate_caste_recommendation": f"Data-driven focus on high-competitiveness booths and voter turnout enhancement ({comp['classification']})."
    }

def compute_pda_caste_intelligence(r: ACHistoricalIntelligence):
    return compute_electoral_intelligence(r)


@router.get("/ac/{ac_no}")
def get_ac_strategy_detail(
    ac_no: int,
    db: Session = Depends(get_db)
):
    r = db.query(ACHistoricalIntelligence).filter(ACHistoricalIntelligence.ac_no == ac_no).first()
    if not r:
        return {"error": f"AC No {ac_no} not found"}
        
    margin = r.margin_2024 or 0
    total_votes = r.total_votes_2024 or 1
    swing_needed = round((margin / (2 * total_votes)) * 100.0, 2)
    
    return {
        "ac_no": r.ac_no,
        "ac_name": r.ac_name,
        "category": r.category,
        "district": r.district,
        "region": r.region,
        "pc_no": r.pc_no,
        "pc_name": r.pc_name,
        "timeline": [
            {
                "election": "2017 Vidhan Sabha",
                "winner_party": r.winner_2017_party,
                "winner_candidate": r.winner_2017_candidate,
                "margin": r.margin_2017
            },
            {
                "election": "2019 Lok Sabha (Segment Lead)",
                "winner_party": r.lead_2019_party,
                "winner_candidate": r.lead_2019_candidate,
                "margin": r.margin_2019
            },
            {
                "election": "2022 Vidhan Sabha",
                "winner_party": r.winner_2022_party,
                "winner_candidate": r.winner_2022_candidate,
                "margin": r.margin_2022,
                "runner_up_party": r.runner_2022_party,
                "valid_votes": r.valid_votes_2022
            },
            {
                "election": "2024 Lok Sabha (Segment Lead)",
                "winner_party": r.lead_2024_party,
                "winner_candidate": r.lead_2024_candidate,
                "winner_votes": r.lead_2024_votes,
                "runner_up_party": r.runner_2024_party,
                "runner_up_candidate": r.runner_2024_candidate,
                "runner_up_votes": r.runner_2024_votes,
                "margin": r.margin_2024,
                "margin_pct": r.margin_pct_2024,
                "total_votes": r.total_votes_2024
            }
        ],
        "vote_distribution_2024": {
            "SP": r.sp_votes_2024 or 0,
            "BJP": r.bjp_votes_2024 or 0,
            "INC": r.inc_votes_2024 or 0,
            "BSP": r.bsp_votes_2024 or 0,
            "RLD": r.rld_votes_2024 or 0
        },
        "strategic_profile": {
            "category": r.strategic_category,
            "is_battleground": r.is_battleground,
            "is_prime_flip": r.is_prime_flip,
            "is_fortress": r.is_fortress,
            "is_defensive_alert": r.is_defensive_alert,
            "is_near_miss": r.is_near_miss,
            "target_priority": r.target_priority,
            "swing_needed_pct": swing_needed,
            "recommendation": r.recommendation_note
        },
        "pda_caste_intelligence": compute_pda_caste_intelligence(r)
    }
