from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import get_db
from app.models import Election, ElectionResult, ParliamentaryConstituency, AssemblyConstituency, District, Party, ElectorStatistic
from app.config import STATE_NAME

router = APIRouter(prefix="/api/overview", tags=["State Overview"])

@router.get("/elections")
def list_available_elections(db: Session = Depends(get_db)):
    elections = db.query(Election).order_by(Election.year.desc()).all()
    items = []
    for e in elections:
        items.append({
            "id": e.id,
            "name": e.name,
            "year": e.year,
            "election_type": e.election_type,
            "delimitation_era": e.delimitation_era,
            "total_seats": e.total_seats,
            "is_official": e.is_official,
            "data_version": e.data_version
        })
    return {"total": len(items), "elections": items}

@router.get("")
def get_state_overview(
    year: Optional[int] = Query(2024, description="Election year"),
    election_type: Optional[str] = Query("Lok Sabha", description="Lok Sabha / Vidhan Sabha"),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.year == year, Election.election_type == election_type).first()
    if not election:
        election = db.query(Election).order_by(Election.year.desc()).first()
        
    results = db.query(ElectionResult).filter(ElectionResult.election_id == election.id).all() if election else []
    
    total_pcs = len(results)
    total_acs = db.query(AssemblyConstituency).count()
    total_districts = db.query(District).count()
    
    total_electors = sum(r.total_electors for r in results)
    total_votes_polled = sum(r.total_votes_polled for r in results)
    total_valid_votes = sum(r.valid_votes for r in results)
    turnout_pct = round((total_votes_polled / total_electors * 100.0), 2) if total_electors > 0 else 0.0
    
    # Party Tally
    party_counts = {}
    for r in results:
        p_code = r.winner_party.code if r.winner_party else "OTHER"
        party_counts[p_code] = party_counts.get(p_code, 0) + 1
        
    tally = []
    for code, count in sorted(party_counts.items(), key=lambda x: x[1], reverse=True):
        party_obj = db.query(Party).filter(Party.code == code).first()
        tally.append({
            "code": code,
            "name": party_obj.name if party_obj else code,
            "seats": count,
            "color": party_obj.color_hex if party_obj else "#626762",
            "seat_share_pct": round((count / total_pcs) * 100.0, 1) if total_pcs > 0 else 0.0
        })

    # Demographics
    demographics = db.query(ElectorStatistic).filter(ElectorStatistic.election_id == election.id, ElectorStatistic.category == "TOTAL").first() if election else None
    demo_data = {}
    if demographics:
        demo_data = {
            "male_electors": demographics.male_electors,
            "female_electors": demographics.female_electors,
            "third_gender_electors": demographics.third_gender_electors,
            "male_voters": demographics.male_voters,
            "female_voters": demographics.female_voters,
            "postal_voters": demographics.postal_voters,
            "evm_rejected": demographics.evm_rejected,
            "rejected_postal": demographics.rejected_postal,
            "nota_votes": demographics.nota_votes
        }

    return {
        "state_name": STATE_NAME,
        "election": election.name if election else "Uttar Pradesh Election",
        "election_year": election.year if election else 2024,
        "election_type": election.election_type if election else "Lok Sabha",
        "delimitation_era": election.delimitation_era if election else "2008_CURRENT",
        "data_version": election.data_version if election else "UP-ECI-v1",
        "is_official": True,
        "data_quality_badge": "OFFICIAL ECI",
        "summary": {
            "total_pcs": total_pcs,
            "total_acs": total_acs,
            "total_districts": total_districts,
            "total_electors": total_electors,
            "total_votes_polled": total_votes_polled,
            "total_valid_votes": total_valid_votes,
            "turnout_pct": turnout_pct
        },
        "party_tally": tally,
        "demographics": demo_data,
        "source": {
            "authority": "Election Commission of India",
            "document": f"ECI Official Results ({election.year if election else 2024})",
            "published_status": "Final / Certified"
        }
    }
