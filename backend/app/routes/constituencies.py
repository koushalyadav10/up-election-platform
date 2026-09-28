from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import (
    ParliamentaryConstituency, 
    ElectionResult, 
    CandidateResult, 
    AssemblyConstituency, 
    PCACMapping, 
    District, 
    Party, 
    Candidate,
    Election
)

router = APIRouter(prefix="/api/constituencies", tags=["Constituencies"])

@router.get("")
def list_constituencies(
    year: Optional[int] = Query(2024, description="Election year (2024, 2019, 2014)"),
    election_type: Optional[str] = Query("Lok Sabha", description="Chamber"),
    party: Optional[str] = Query(None, description="Filter by winner party code"),
    search: Optional[str] = Query(None, description="Search PC or District name"),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.year == year, Election.election_type == election_type).first()
    if not election:
        election = db.query(Election).filter(Election.election_type == "Lok Sabha").order_by(Election.year.desc()).first()
        
    query = db.query(ElectionResult).filter(ElectionResult.election_id == election.id).join(ParliamentaryConstituency)
    
    if party:
        query = query.join(Party, ElectionResult.winner_party_id == Party.id).filter(Party.code == party.upper())
        
    results = query.order_by(ParliamentaryConstituency.pc_no.asc()).all()
    
    items = []
    for r in results:
        pc = r.pc
        if search:
            s = search.lower()
            if s not in pc.name.lower():
                continue
                
        ac_count = db.query(PCACMapping).filter(PCACMapping.pc_id == pc.id).count()
        
        items.append({
            "id": pc.id,
            "pc_no": pc.pc_no,
            "name": pc.name,
            "category": pc.category,
            "election_year": election.year,
            "election_type": election.election_type,
            "assembly_segments_count": ac_count,
            "winner": {
                "name": r.winner_candidate.name if r.winner_candidate else "N/A",
                "party": r.winner_party.code if r.winner_party else "OTHER",
                "party_name": r.winner_party.name if r.winner_party else "Other",
                "color": r.winner_party.color_hex if r.winner_party else "#626762",
                "votes": r.candidate_results[0].total_votes if r.candidate_results else 0,
                "vote_pct": r.candidate_results[0].vote_pct_valid if r.candidate_results else 0.0
            },
            "runner_up": {
                "name": r.runner_up_candidate.name if r.runner_up_candidate else "N/A",
                "party": r.runner_up_party.code if r.runner_up_party else "OTHER",
                "votes": r.candidate_results[1].total_votes if len(r.candidate_results) > 1 else 0,
                "vote_pct": r.candidate_results[1].vote_pct_valid if len(r.candidate_results) > 1 else 0.0
            },
            "margin": r.margin,
            "turnout_pct": r.turnout_pct,
            "total_electors": r.total_electors,
            "total_votes_polled": r.total_votes_polled,
            "valid_votes": r.valid_votes,
            "data_quality": r.data_quality_score or "Official / Verified"
        })
        
    return {
        "total": len(items), 
        "election_year": election.year, 
        "election_type": election.election_type,
        "items": items
    }

@router.get("/{pc_id}")
def get_constituency_detail(
    pc_id: int, 
    year: Optional[int] = Query(None, description="Filter detail by specific election year (e.g. 2024, 2019, 2014)"),
    db: Session = Depends(get_db)
):
    pc = db.query(ParliamentaryConstituency).filter(ParliamentaryConstituency.id == pc_id).first()
    if not pc:
        raise HTTPException(status_code=404, detail="Constituency not found")
        
    query = db.query(ElectionResult).filter(
        ElectionResult.pc_id == pc_id,
        ElectionResult.ac_id.is_(None)
    ).join(Election).filter(Election.election_type == "Lok Sabha")
    
    if year:
        res = query.filter(Election.year == year).first()
    else:
        # Default to latest Lok Sabha election (2024)
        res = query.order_by(Election.year.desc()).first()
        
    if not res:
        res = db.query(ElectionResult).filter(
            ElectionResult.pc_id == pc_id,
            ElectionResult.ac_id.is_(None)
        ).first()
        
    if not res:
        raise HTTPException(status_code=404, detail="Lok Sabha election results not found for this Parliamentary Constituency")
        
    # Safe metrics fallback
    turnout = res.turnout_pct if res.turnout_pct is not None else 0.0
    valid_votes = res.valid_votes if res.valid_votes is not None and res.valid_votes > 0 else 1
    margin = res.margin if res.margin is not None else 0
    electors = res.total_electors if res.total_electors is not None else 0
    polled = res.total_votes_polled if res.total_votes_polled is not None else 0

    # Candidates for this election result
    c_res = db.query(CandidateResult).filter(CandidateResult.election_result_id == res.id).order_by(CandidateResult.rank.asc(), CandidateResult.total_votes.desc()).all()
    candidates_list = []
    for c in c_res:
        candidates_list.append({
            "rank": c.rank,
            "candidate_id": c.candidate_id,
            "name": c.candidate.name if c.candidate else "Unknown",
            "party": c.party.code if c.party else "IND",
            "party_name": c.party.name if c.party else "Independent",
            "symbol": c.party.symbol if c.party else None,
            "color": c.party.color_hex if c.party else "#64748B",
            "gender": c.candidate.gender if c.candidate else None,
            "age": c.candidate.age if c.candidate else None,
            "category": c.candidate.category if c.candidate else None,
            "general_votes": c.general_votes or 0,
            "postal_votes": c.postal_votes or 0,
            "total_votes": c.total_votes or 0,
            "vote_pct_valid": c.vote_pct_valid or 0.0,
            "vote_pct_electors": c.vote_pct_electors or 0.0,
            "is_winner": c.is_winner
        })

    # Assembly Segments with dynamic prior Vidhan Sabha actuals and Lok Sabha segment leads
    from app.models import ACHistoricalIntelligence
    selected_result_year = res.election.year if res.election else (year or 2024)
    is_2019 = (selected_result_year == 2019)
    
    mappings = db.query(PCACMapping).filter(PCACMapping.pc_id == pc_id).all()
    segments = []
    for m in mappings:
        ac = m.ac
        ac_intel = db.query(ACHistoricalIntelligence).filter(ACHistoricalIntelligence.ac_no == ac.ac_no).first()
        
        # Determine dynamic historical MLA & LS lead fields
        if is_2019:
            mla_yr = 2017
            mla_party = ac_intel.winner_2017_party if ac_intel else "N/A"
            mla_candidate = ac_intel.winner_2017_candidate if ac_intel else "N/A"
            mla_margin = ac_intel.margin_2017 if ac_intel else 0
            
            ls_lead_yr = 2019
            ls_party = ac_intel.lead_2019_party if ac_intel else "N/A"
            ls_candidate = ac_intel.lead_2019_candidate if ac_intel else "N/A"
            ls_margin = ac_intel.margin_2019 if ac_intel else 0
        else:
            mla_yr = 2022
            mla_party = ac_intel.winner_2022_party if ac_intel else "N/A"
            mla_candidate = ac_intel.winner_2022_candidate if ac_intel else "N/A"
            mla_margin = ac_intel.margin_2022 if ac_intel else 0
            
            ls_lead_yr = 2024
            ls_party = ac_intel.lead_2024_party if ac_intel else "N/A"
            ls_candidate = ac_intel.lead_2024_candidate if ac_intel else "N/A"
            ls_margin = ac_intel.margin_2024 if ac_intel else 0

        segments.append({
            "ac_id": ac.id,
            "ac_no": ac.ac_no,
            "name": ac.name,
            "category": ac.category,
            "district": ac.district.name if ac.district else "Uttar Pradesh",
            "election_year": selected_result_year,
            "mla_year": mla_yr,
            "mla_party": mla_party,
            "mla_candidate": mla_candidate,
            "mla_margin": mla_margin,
            "ls_lead_year": ls_lead_yr,
            "ls_lead_party": ls_party,
            "ls_lead_candidate": ls_candidate,
            "ls_lead_margin": ls_margin,
            # Backwards compatibility keys
            "winner_2022": mla_party,
            "winner_2022_candidate": mla_candidate,
            "margin_2022": mla_margin,
            "lead_2024": ls_party,
            "lead_2024_candidate": ls_candidate,
            "margin_2024": ls_margin,
            "strategic_category": ac_intel.strategic_category if ac_intel else "COMPETITIVE"
        })

    # Multi-election historical trend for this PC (strictly Lok Sabha elections: 2024, 2019, 2014)
    all_pc_results = db.query(ElectionResult).filter(
        ElectionResult.pc_id == pc_id,
        ElectionResult.ac_id.is_(None)
    ).join(Election).filter(
        Election.election_type == "Lok Sabha"
    ).order_by(Election.year.desc()).all()
    
    historical_list = []
    for h in all_pc_results:
        historical_list.append({
            "year": h.election.year,
            "election": f"{h.election.year} Lok Sabha",
            "winner_party": h.winner_party.code if h.winner_party else "OTHER",
            "winner_name": h.winner_candidate.name if h.winner_candidate else "N/A",
            "runner_up_party": h.runner_up_party.code if h.runner_up_party else "OTHER",
            "runner_up_name": h.runner_up_candidate.name if h.runner_up_candidate else "N/A",
            "margin": h.margin,
            "turnout": h.turnout_pct,
            "is_current": (h.id == res.id)
        })

    # DNA Indices
    hhi = sum((c["total_votes"] / valid_votes * 100) ** 2 for c in candidates_list[:5])
    competition = "Bi-Polar Heavy" if len(candidates_list) >= 2 and (candidates_list[0]["vote_pct_valid"] + candidates_list[1]["vote_pct_valid"] > 75) else "Multi-Cornered"

    return {
        "pc": {
            "id": pc.id,
            "pc_no": pc.pc_no,
            "name": pc.name,
            "category": pc.category,
            "state": "Uttar Pradesh",
            "delimitation_era": pc.delimitation_era
        },
        "summary": {
            "election_year": res.election.year if res.election else 2024,
            "election_type": res.election.election_type if res.election else "Lok Sabha",
            "winner_name": res.winner_candidate.name if res.winner_candidate else (candidates_list[0]["name"] if candidates_list else "N/A"),
            "winner_party": res.winner_party.code if res.winner_party else (candidates_list[0]["party"] if candidates_list else "OTHER"),
            "winner_votes": candidates_list[0]["total_votes"] if candidates_list else 0,
            "winner_vote_pct": candidates_list[0]["vote_pct_valid"] if candidates_list else 0.0,
            "runner_up_name": res.runner_up_candidate.name if res.runner_up_candidate else (candidates_list[1]["name"] if len(candidates_list) > 1 else None),
            "runner_up_party": res.runner_up_party.code if res.runner_up_party else (candidates_list[1]["party"] if len(candidates_list) > 1 else None),
            "runner_up_votes": candidates_list[1]["total_votes"] if len(candidates_list) > 1 else 0,
            "margin": margin,
            "turnout_pct": turnout,
            "total_electors": electors,
            "total_votes_polled": polled,
            "valid_votes": valid_votes
        },
        "dna": {
            "vote_concentration_hhi": round(hhi, 1),
            "competition_index": competition,
            "margin_buffer_pct": round((margin / valid_votes) * 100, 2),
            "turnout_category": "High (>60%)" if turnout > 60 else "Moderate (50-60%)" if turnout >= 50 else "Low (<50%)",
            "methodology": "Computed from certified ECI EVM + Postal counts"
        },
        "assembly_segments": segments,
        "candidates": candidates_list,
        "historical": historical_list,
        "source": {
            "authority": "Election Commission of India",
            "document": f"ECI Official Detailed Result ({res.election.year if res.election else 2024})",
            "data_version": res.election.data_version if res.election else "UP-ECI-v1",
            "status": "Official / Certified"
        }
    }

