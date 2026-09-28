from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import Dict
from app.database import get_db
from app.models import ElectionResult, ParliamentaryConstituency, Party
from app.services.simulation import run_swing_simulation

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/close-contests")
def get_close_contests(
    max_margin: int = Query(25000, description="Upper threshold for winning margin"),
    db: Session = Depends(get_db)
):
    results = db.query(ElectionResult).filter(ElectionResult.margin <= max_margin).order_by(ElectionResult.margin.asc()).all()
    
    items = []
    for r in results:
        items.append({
            "pc_id": r.pc.id,
            "pc_no": r.pc.pc_no,
            "pc_name": r.pc.name,
            "winner_name": r.winner_candidate.name,
            "winner_party": r.winner_party.code,
            "winner_party_color": r.winner_party.color_hex,
            "runner_up_name": r.runner_up_candidate.name,
            "runner_up_party": r.runner_up_party.code,
            "runner_up_party_color": r.runner_up_party.color_hex,
            "margin": r.margin,
            "turnout_pct": r.turnout_pct,
            "total_votes_polled": r.total_votes_polled
        })
        
    return {"threshold": max_margin, "count": len(items), "contests": items}

@router.get("/largest-victories")
def get_largest_victories(limit: int = Query(10), db: Session = Depends(get_db)):
    results = db.query(ElectionResult).order_by(ElectionResult.margin.desc()).limit(limit).all()
    items = []
    for r in results:
        items.append({
            "pc_id": r.pc.id,
            "pc_no": r.pc.pc_no,
            "pc_name": r.pc.name,
            "winner_name": r.winner_candidate.name,
            "winner_party": r.winner_party.code,
            "margin": r.margin,
            "turnout_pct": r.turnout_pct,
            "vote_share_pct": r.candidate_results[0].vote_pct_valid if r.candidate_results else 0.0
        })
    return {"count": len(items), "victories": items}

@router.get("/turnout-distribution")
def get_turnout_distribution(db: Session = Depends(get_db)):
    results = db.query(ElectionResult).order_by(ElectionResult.turnout_pct.desc()).all()
    data = []
    for r in results:
        data.append({
            "pc_no": r.pc.pc_no,
            "pc_name": r.pc.name,
            "turnout_pct": r.turnout_pct,
            "electors": r.total_electors,
            "votes_polled": r.total_votes_polled,
            "winner_party": r.winner_party.code
        })
    return {"count": len(data), "distribution": data}

@router.post("/simulate-swing")
def simulate_swing(swings: Dict[str, float] = Body(...), db: Session = Depends(get_db)):
    return run_swing_simulation(db, swings)
