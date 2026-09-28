from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models import ElectionResult, CandidateResult, ParliamentaryConstituency, Party

def run_swing_simulation(db: Session, swings: Dict[str, float]) -> Dict[str, Any]:
    """
    Mathematically calculates hypothetical constituency flips based on uniform percentage point vote share swing.
    swings: e.g. {'BJP': -2.5, 'SP': 3.0, 'INC': 1.0, 'BSP': -1.5}
    """
    # Get 2024 results
    results = db.query(ElectionResult).all()
    baseline_tally = {}
    simulated_tally = {}
    flips = []
    
    for r in results:
        pc_name = r.pc.name
        original_winner_party = r.winner_party.code if r.winner_party else "OTHER"
        baseline_tally[original_winner_party] = baseline_tally.get(original_winner_party, 0) + 1
        
        # Candidate votes
        c_results = db.query(CandidateResult).filter(CandidateResult.election_result_id == r.id).all()
        sim_scores = []
        for cr in c_results:
            p_code = cr.party.code
            swing = swings.get(p_code, 0.0)
            adjusted_pct = max(0.0, cr.vote_pct_valid + swing)
            sim_scores.append({
                "candidate_name": cr.candidate.name,
                "party_code": p_code,
                "original_votes": cr.total_votes,
                "original_pct": cr.vote_pct_valid,
                "simulated_pct": adjusted_pct,
                "estimated_votes": int(r.valid_votes * (adjusted_pct / 100.0))
            })
            
        sim_scores.sort(key=lambda x: x["simulated_pct"], reverse=True)
        if sim_scores:
            new_winner = sim_scores[0]
            new_runner = sim_scores[1] if len(sim_scores) > 1 else None
            new_winner_party = new_winner["party_code"]
            simulated_tally[new_winner_party] = simulated_tally.get(new_winner_party, 0) + 1
            
            if new_winner_party != original_winner_party:
                new_margin = (new_winner["estimated_votes"] - new_runner["estimated_votes"]) if new_runner else new_winner["estimated_votes"]
                flips.append({
                    "pc_id": r.pc.id,
                    "pc_no": r.pc.pc_no,
                    "pc_name": pc_name,
                    "original_winner": r.winner_candidate.name if r.winner_candidate else "",
                    "original_party": original_winner_party,
                    "original_margin": r.margin,
                    "new_winner": new_winner["candidate_name"],
                    "new_party": new_winner_party,
                    "simulated_margin": new_margin,
                    "simulated_winner_pct": round(new_winner["simulated_pct"], 2)
                })

    return {
        "disclaimer": "SIMULATION — NOT AN ELECTION PREDICTION. Purely mathematical scenario based on user-defined swing parameters.",
        "methodology": "Uniform vote share swing added to candidate baseline % over valid votes. Seats recalculated by highest simulated vote share.",
        "swings_applied": swings,
        "baseline_tally": baseline_tally,
        "simulated_tally": simulated_tally,
        "total_seats": len(results),
        "total_flips": len(flips),
        "flipped_constituencies": flips
    }
