from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel
import re
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models import (
    ParliamentaryConstituency, 
    AssemblyConstituency, 
    District, 
    Party, 
    Candidate, 
    ElectionResult,
    CandidateResult,
    Election,
    ACHistoricalIntelligence
)
from app.query_guards import get_pc_results_query

router = APIRouter(prefix="/api/search", tags=["Global Search"])

class SearchRequest(BaseModel):
    query: str

@router.post("/advanced")
def advanced_search(req: SearchRequest, db: Session = Depends(get_db)):
    """
    ADVANCED GLOBAL SEARCH
    Parses keyword searches and analytical queries:
      - PC name / PC number
      - AC name / AC number
      - District
      - Candidate
      - Party
      - Analytical: "ACs with victory margin below 5000"
      - Analytical: "Compare Saharanpur 2022 and 2024"
    """
    raw_query = req.query.strip()
    q_lower = raw_query.lower()

    results = {
        "query": raw_query,
        "is_analytical": False,
        "analytical_interpretation": None,
        "pcs": [],
        "acs": [],
        "districts": [],
        "candidates": [],
        "parties": [],
        "analytical_matches": []
    }

    # 1. Check for Analytical Margin Queries (e.g. "margin below 5000", "margin under 10000")
    margin_match = re.search(r"margin\s*(?:below|under|<|less than)\s*(\d+)", q_lower)
    if margin_match:
        threshold = int(margin_match.group(1))
        results["is_analytical"] = True
        results["analytical_interpretation"] = f"Constituencies with victory margin under {threshold:,} votes"
        
        matches = db.query(ACHistoricalIntelligence).filter(
            ACHistoricalIntelligence.margin_2024 <= threshold
        ).order_by(ACHistoricalIntelligence.margin_2024.asc()).limit(20).all()
        
        for m in matches:
            results["analytical_matches"].append({
                "type": "AC_ANALYTICAL_MATCH",
                "id": m.ac_no,
                "name": m.ac_name,
                "district": m.district,
                "lead_party": m.lead_2024_party,
                "margin": m.margin_2024,
                "target_tab": "vidhan-sabha",
                "summary": f"AC #{m.ac_no} {m.ac_name}: {m.lead_2024_party} led by {m.margin_2024:,} votes."
            })
        return results

    # 2. Check for Comparison Query (e.g. "compare saharanpur 2022 and 2024")
    if "compare" in q_lower and ("2022" in q_lower or "2024" in q_lower or "2017" in q_lower):
        results["is_analytical"] = True
        results["analytical_interpretation"] = "Cross-Election Comparison Query"
        
        # Extract constituency name if present
        clean_terms = re.sub(r"compare|\d{4}|and|vs|in|results|for", "", q_lower).strip()
        if clean_terms:
            ac_match = db.query(ACHistoricalIntelligence).filter(
                or_(
                    ACHistoricalIntelligence.ac_name.ilike(f"%{clean_terms}%"),
                    ACHistoricalIntelligence.pc_name.ilike(f"%{clean_terms}%")
                )
            ).first()
            if ac_match:
                results["analytical_matches"].append({
                    "type": "COMPARISON_MATCH",
                    "id": ac_match.ac_no,
                    "name": ac_match.ac_name,
                    "target_tab": "election-comparison",
                    "summary": f"Compare {ac_match.ac_name} across 2022 Vidhan Sabha and 2024 Lok Sabha.",
                    "details": {
                        "2022_winner": f"{ac_match.winner_2022_party} (+{ac_match.margin_2022:,})",
                        "2024_lead": f"{ac_match.lead_2024_party} (+{ac_match.margin_2024:,})"
                    }
                })
        return results

    # 3. Standard Entity Search
    # A. PCs
    pcs = db.query(ParliamentaryConstituency).filter(
        or_(
            ParliamentaryConstituency.name.ilike(f"%{raw_query}%"),
            ParliamentaryConstituency.pc_no == (int(raw_query) if raw_query.isdigit() else -1)
        )
    ).limit(6).all()
    
    for p in pcs:
        latest = get_pc_results_query(db, year=2024).filter(ElectionResult.pc_id == p.id).first()
        results["pcs"].append({
            "id": p.id,
            "pc_no": p.pc_no,
            "name": p.name,
            "category": p.category,
            "winner": latest.winner_candidate.name if latest and latest.winner_candidate else "N/A",
            "party": latest.winner_party.code if latest and latest.winner_party else "OTHER",
            "margin": latest.margin if latest else 0,
            "target_tab": "lok-sabha"
        })

    # B. ACs
    acs = db.query(AssemblyConstituency).filter(
        or_(
            AssemblyConstituency.name.ilike(f"%{raw_query}%"),
            AssemblyConstituency.ac_no == (int(raw_query) if raw_query.isdigit() else -1)
        )
    ).limit(8).all()
    
    for a in acs:
        intel = db.query(ACHistoricalIntelligence).filter(ACHistoricalIntelligence.ac_no == a.ac_no).first()
        results["acs"].append({
            "id": a.ac_no,
            "ac_no": a.ac_no,
            "name": a.name,
            "category": a.category,
            "district": a.district.name if a.district else (intel.district if intel else "UP"),
            "winner_2022": intel.winner_2022_party if intel else "N/A",
            "lead_2024": intel.lead_2024_party if intel else "N/A",
            "margin": intel.margin_2024 if intel else 0,
            "target_tab": "vidhan-sabha"
        })

    # C. Districts
    dists = db.query(District).filter(District.name.ilike(f"%{raw_query}%")).limit(5).all()
    for d in dists:
        results["districts"].append({
            "id": d.id,
            "name": d.name,
            "ac_count": len(d.acs),
            "target_tab": "districts"
        })

    # D. Parties
    parties = db.query(Party).filter(
        or_(
            Party.code.ilike(f"%{raw_query}%"),
            Party.name.ilike(f"%{raw_query}%")
        )
    ).limit(5).all()
    for pt in parties:
        results["parties"].append({
            "id": pt.id,
            "code": pt.code,
            "name": pt.name,
            "color": pt.color_hex,
            "target_tab": "parties"
        })

    # E. Candidates
    cands = db.query(Candidate).filter(Candidate.name.ilike(f"%{raw_query}%")).limit(6).all()
    for cd in cands:
        results["candidates"].append({
            "id": cd.id,
            "name": cd.name,
            "target_tab": "lok-sabha"
        })

    return results
