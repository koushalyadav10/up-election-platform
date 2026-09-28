from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from app.database import get_db
from app.models import ElectionResult, ParliamentaryConstituency, CandidateResult, AssemblyConstituency, PCACMapping
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/master-guide-pdf")
def download_master_guide_pdf():
    pdf_path = Path(__file__).resolve().parent.parent.parent.parent / "UP_Election_Intelligence_Platform_Master_Guide.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Master Guide PDF not found")
    return FileResponse(
        path=str(pdf_path),
        filename="UP_Election_Intelligence_Platform_Master_Guide.pdf",
        media_type="application/pdf"
    )

@router.get("/master-guide-html")
def view_master_guide_html():
    html_path = Path(__file__).resolve().parent.parent.parent.parent / "UP_Election_Intelligence_Platform_Master_Guide.html"
    if not html_path.exists():
        raise HTTPException(status_code=404, detail="Master Guide HTML not found")
    return FileResponse(
        path=str(html_path),
        media_type="text/html"
    )

@router.get("/constituency-dossier/{pc_id}")
def generate_constituency_dossier(pc_id: int, db: Session = Depends(get_db)):
    res = db.query(ElectionResult).filter(ElectionResult.pc_id == pc_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Constituency not found")
        
    pc = res.pc
    c_res = db.query(CandidateResult).filter(CandidateResult.election_result_id == res.id).order_by(CandidateResult.rank.asc()).all()
    mappings = db.query(PCACMapping).filter(PCACMapping.pc_id == pc.id).all()
    
    candidates = []
    for c in c_res:
        candidates.append({
            "rank": c.rank,
            "name": c.candidate.name,
            "party": c.party.code,
            "votes": c.total_votes,
            "vote_share": f"{c.vote_pct_valid:.2f}%"
        })
        
    segments = [m.ac.name for m in mappings]
    
    return {
        "report_type": "ELECTORAL INTELLIGENCE DOSSIER",
        "title": f"{pc.name} Parliamentary Constituency (PC {pc.pc_no})",
        "jurisdiction": "Uttar Pradesh, India",
        "election": "Lok Sabha General Election 2024",
        "generated_timestamp": datetime.utcnow().strftime("%d %B %Y, %H:%M UTC"),
        "verification_badge": "OFFICIAL ECI CERTIFIED",
        "executive_summary": f"In {pc.name} (PC {pc.pc_no}), {res.winner_candidate.name} representing {res.winner_party.code} secured election to the 18th Lok Sabha with {candidates[0]['votes']:,} votes ({candidates[0]['vote_share']}), achieving a margin of {res.margin:,} votes over runner-up {res.runner_up_candidate.name} ({res.runner_up_party.code}). Overall voter turnout registered at {res.turnout_pct:.2f}%.",
        "key_metrics": {
            "Total Electors": f"{res.total_electors:,}",
            "Votes Polled": f"{res.total_votes_polled:,}",
            "Valid Votes": f"{res.valid_votes:,}",
            "Winning Margin": f"{res.margin:,}",
            "Turnout": f"{res.turnout_pct:.2f}%",
            "Assembly Segments Count": len(segments)
        },
        "assembly_segments": segments,
        "candidate_performance": candidates,
        "citation": "Election Commission of India, General Election to Lok Sabha 2024, Dataset 33 (Detailed Result)."
    }
