from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import Optional
from app.database import get_db
from app.models import Party, Election, ElectionResult, CandidateResult, ParliamentaryConstituency, AssemblyConstituency

router = APIRouter(prefix="/api/parties", tags=["Parties"])

@router.get("")
def list_parties_intelligence(
    year: int = Query(2024, description="Election year"),
    election_type: str = Query("Lok Sabha", description="Chamber"),
    db: Session = Depends(get_db)
):
    election = db.query(Election).filter(Election.year == year, Election.election_type == election_type).first()
    if not election:
        election = db.query(Election).filter(Election.election_type == "Lok Sabha").order_by(Election.year.desc()).first()
        
    # Total valid votes in this election
    if election.election_type == "Lok Sabha":
        total_valid = db.query(func.sum(ElectionResult.valid_votes)).filter(
            ElectionResult.election_id == election.id,
            ElectionResult.ac_id.is_(None)
        ).scalar() or 1
    else:
        total_valid = db.query(func.sum(ElectionResult.valid_votes)).filter(
            ElectionResult.election_id == election.id,
            ElectionResult.ac_id.is_not(None)
        ).scalar() or 1

    # Get all parties that contested in this election
    candidate_subq = db.query(
        CandidateResult.party_id,
        func.count(CandidateResult.id).label("contested"),
        func.sum(case((CandidateResult.is_winner == True, 1), else_=0)).label("won"),
        func.sum(CandidateResult.total_votes).label("votes")
    ).join(ElectionResult).filter(
        ElectionResult.election_id == election.id
    )
    
    if election.election_type == "Lok Sabha":
        candidate_subq = candidate_subq.filter(ElectionResult.ac_id.is_(None))
    else:
        candidate_subq = candidate_subq.filter(ElectionResult.ac_id.is_not(None))
        
    party_results = candidate_subq.group_by(CandidateResult.party_id).all()
    
    party_stats = []
    for pr in party_results:
        p = db.query(Party).filter(Party.id == pr.party_id).first()
        if not p:
            continue
            
        contested = pr.contested
        won = pr.won or 0
        votes = pr.votes or 0
        vote_share = round((votes / total_valid) * 100.0, 2)
        
        # Filter: Only include recognized / notable UP parties (Won seats OR >= 0.25% vote share OR contested >= 5 seats)
        if won == 0 and vote_share < 0.25 and contested < 5:
            continue
            
        # Calculate winning margins and closest loss
        c_runs = db.query(CandidateResult).join(ElectionResult).filter(
            ElectionResult.election_id == election.id,
            CandidateResult.party_id == p.id
        )
        if election.election_type == "Lok Sabha":
            c_runs = c_runs.filter(ElectionResult.ac_id.is_(None))
        else:
            c_runs = c_runs.filter(ElectionResult.ac_id.is_not(None))
            
        c_runs = c_runs.all()
        winning_margins = []
        closest_loss_margin = 99999999
        closest_loss_seat = None
        
        for c in c_runs:
            res = c.election_result
            if c.is_winner:
                winning_margins.append(res.margin)
            elif c.rank == 2:
                if res.margin < closest_loss_margin:
                    closest_loss_margin = res.margin
                    closest_loss_seat = res.pc.name if res.pc else (res.ac.name if res.ac else "N/A")
                    
        avg_margin = int(sum(winning_margins) / len(winning_margins)) if winning_margins else 0
        
        party_stats.append({
            "id": p.id,
            "code": p.code,
            "name": p.name,
            "party_type": p.party_type,
            "color": p.color_hex,
            "election_year": election.year,
            "election_type": election.election_type,
            "seats_contested": contested,
            "seats_won": won,
            "strike_rate_pct": round((won / contested * 100.0), 1) if contested > 0 else 0.0,
            "total_votes": votes,
            "vote_share_pct": vote_share,
            "avg_winning_margin": avg_margin,
            "closest_loss": {
                "constituency": closest_loss_seat,
                "margin": closest_loss_margin if closest_loss_seat and closest_loss_margin < 9999999 else None
            }
        })
        
    # Sort: seats won desc, then vote share desc
    party_stats.sort(key=lambda x: (x["seats_won"], x["vote_share_pct"]), reverse=True)
    
    return {
        "total": len(party_stats),
        "election_year": election.year,
        "election_type": election.election_type,
        "parties": party_stats
    }

@router.get("/{party_code}/seats")
def get_party_seats(
    party_code: str,
    year: int = Query(2024),
    election_type: str = Query("Lok Sabha"),
    db: Session = Depends(get_db)
):
    party = db.query(Party).filter(Party.code == party_code.upper()).first()
    if not party:
        raise HTTPException(status_code=404, detail=f"Party {party_code} not found")
        
    election = db.query(Election).filter(Election.year == year, Election.election_type == election_type).first()
    if not election:
        election = db.query(Election).filter(Election.election_type == "Lok Sabha").order_by(Election.year.desc()).first()

    # Query all candidate runs for this party in this election
    q = db.query(CandidateResult).join(ElectionResult).filter(
        ElectionResult.election_id == election.id,
        CandidateResult.party_id == party.id
    )
    if election.election_type == "Lok Sabha":
        q = q.filter(ElectionResult.ac_id.is_(None))
    else:
        q = q.filter(ElectionResult.ac_id.is_not(None))
        
    runs = q.all()
    
    won_seats = []
    runner_up_seats = []
    
    for c in runs:
        res = c.election_result
        margin_pct = round((res.margin / (res.valid_votes or 1)) * 100.0, 2) if res.margin and res.valid_votes else 0.0
        opp_cand = res.runner_up_candidate.name if c.is_winner else (res.winner_candidate.name if res.winner_candidate else "N/A")
        opp_party = res.runner_up_party.code if c.is_winner else (res.winner_party.code if res.winner_party else "OTHER")
        
        seat_info = {
            "pc_id": res.pc.id if res.pc else None,
            "pc_no": res.pc.pc_no if res.pc else None,
            "pc_name": res.pc.name if res.pc else (res.ac.name if res.ac else "N/A"),
            "seat_name": res.pc.name if res.pc else (res.ac.name if res.ac else "N/A"),
            "category": res.pc.category if res.pc else (res.ac.category if res.ac else "GEN"),
            "candidate": c.candidate.name if c.candidate else "N/A",
            "candidate_name": c.candidate.name if c.candidate else "N/A",
            "votes": c.total_votes,
            "vote_pct": c.vote_pct_valid,
            "margin": res.margin or 0,
            "margin_pct": margin_pct,
            "turnout_pct": res.turnout_pct,
            "opponent_candidate": opp_cand,
            "opponent_party": opp_party,
            "runner_up_candidate": res.runner_up_candidate.name if res.runner_up_candidate else "N/A",
            "runner_up_party": res.runner_up_party.code if res.runner_up_party else "OTHER",
            "runner_up_color": res.runner_up_party.color_hex if res.runner_up_party else "#64748B"
        }
        if c.is_winner:
            won_seats.append(seat_info)
        elif c.rank == 2:
            runner_up_seats.append(seat_info)
            
    won_seats.sort(key=lambda x: x["pc_no"] if x["pc_no"] else 0)
    runner_up_seats.sort(key=lambda x: x["margin"])
    
    return {
        "party_code": party.code,
        "party_name": party.name,
        "color": party.color_hex,
        "election_year": election.year,
        "election_type": election.election_type,
        "total_won": len(won_seats),
        "total_runner_up": len(runner_up_seats),
        "won_seats": won_seats,
        "runner_up_seats": runner_up_seats
    }


@router.get("/{party_code}/performance")
def get_party_performance(party_code: str, db: Session = Depends(get_db)):
    """
    CRITICAL PARTY INTELLIGENCE API
    Returns comprehensive multi-election timeline and constituency performance:
      - 2014 -> 2019 -> 2024 (Lok Sabha)
      - 2017 -> 2022 (Vidhan Sabha)
      - Seats won, runner-up count, third-place count, vote totals, avg margin
      - Full constituency performance table
    """
    party = db.query(Party).filter(Party.code == party_code.upper()).first()
    if not party:
        raise HTTPException(status_code=404, detail=f"Party {party_code} not found")

    from app.query_guards import get_pc_results_query, get_ac_results_query

    # 1. Lok Sabha Timeline (2014, 2019, 2024)
    ls_timeline = []
    for yr in [2014, 2019, 2024]:
        q = get_pc_results_query(db, year=yr)
        runs = db.query(CandidateResult).join(ElectionResult).filter(
            ElectionResult.id.in_(q.with_entities(ElectionResult.id)),
            CandidateResult.party_id == party.id
        ).all()
        
        won = sum(1 for c in runs if c.is_winner)
        runner_up = sum(1 for c in runs if c.rank == 2)
        third = sum(1 for c in runs if c.rank == 3)
        tot_v = sum(c.total_votes for c in runs)
        
        # Avg winning margin
        win_margins = [c.election_result.margin for c in runs if c.is_winner and c.election_result.margin]
        avg_margin = int(sum(win_margins) / len(win_margins)) if win_margins else 0
        
        # Total votes in election to compute overall state vote share
        all_valid = db.query(func.sum(ElectionResult.valid_votes)).filter(
            ElectionResult.id.in_(q.with_entities(ElectionResult.id))
        ).scalar() or 1
        vote_share = round((tot_v / all_valid) * 100.0, 2)
        
        ls_timeline.append({
            "year": yr,
            "election": f"{yr} Lok Sabha",
            "seats_contested": len(runs),
            "seats_won": won,
            "runner_up_count": runner_up,
            "third_place_count": third,
            "total_votes": tot_v,
            "vote_share_pct": vote_share,
            "avg_winning_margin": avg_margin
        })

    # 2. Vidhan Sabha Timeline (2017, 2022)
    vs_timeline = []
    for yr in [2017, 2022]:
        q = get_ac_results_query(db, year=yr)
        runs = db.query(CandidateResult).join(ElectionResult).filter(
            ElectionResult.id.in_(q.with_entities(ElectionResult.id)),
            CandidateResult.party_id == party.id
        ).all()
        
        won = sum(1 for c in runs if c.is_winner)
        runner_up = sum(1 for c in runs if c.rank == 2)
        third = sum(1 for c in runs if c.rank == 3)
        tot_v = sum(c.total_votes for c in runs)
        
        win_margins = [c.election_result.margin for c in runs if c.is_winner and c.election_result.margin]
        avg_margin = int(sum(win_margins) / len(win_margins)) if win_margins else 0
        
        all_valid = db.query(func.sum(ElectionResult.valid_votes)).filter(
            ElectionResult.id.in_(q.with_entities(ElectionResult.id))
        ).scalar() or 1
        vote_share = round((tot_v / all_valid) * 100.0, 2)
        
        vs_timeline.append({
            "year": yr,
            "election": f"{yr} Vidhan Sabha",
            "seats_contested": len(runs),
            "seats_won": won,
            "runner_up_count": runner_up,
            "third_place_count": third,
            "total_votes": tot_v,
            "vote_share_pct": vote_share,
            "avg_winning_margin": avg_margin
        })

    # 3. Latest 2024 Constituency Performance Table (Won + Runner-up + Top contests)
    from app.routes.parties import get_party_seats
    seats_data = get_party_seats(party_code=party.code, year=2024, election_type="Lok Sabha", db=db)

    return {
        "party_code": party.code,
        "party_name": party.name,
        "party_type": party.party_type,
        "color": party.color_hex,
        "lok_sabha_timeline": ls_timeline,
        "vidhan_sabha_timeline": vs_timeline,
        "constituency_performance_2024": {
            "total_won": seats_data["total_won"],
            "total_runner_up": seats_data["total_runner_up"],
            "won_seats": seats_data["won_seats"],
            "runner_up_seats": seats_data["runner_up_seats"]
        }
    }
