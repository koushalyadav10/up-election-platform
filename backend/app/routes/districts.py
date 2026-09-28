from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from collections import Counter
from app.database import get_db
from app.models import (
    District, 
    AssemblyConstituency, 
    ParliamentaryConstituency, 
    PCACMapping, 
    Election, 
    ElectionResult,
    ACHistoricalIntelligence,
    Party
)
from app.services.competitiveness import calculate_competitiveness_score
from app.services.change_detector import detect_electoral_changes

router = APIRouter(prefix="/api/districts", tags=["District Intelligence"])

@router.get("")
def list_districts(db: Session = Depends(get_db)):
    """
    Returns high-level electoral intelligence for all 75 Uttar Pradesh districts.
    """
    districts = db.query(District).order_by(District.name.asc()).all()
    all_intel = db.query(ACHistoricalIntelligence).all()
    
    # Map intel by district name
    intel_by_dist = {}
    for r in all_intel:
        d_name = r.district or "Unknown"
        intel_by_dist.setdefault(d_name.strip().lower(), []).append(r)
        
    items = []
    for d in districts:
        d_clean = d.name.strip().lower()
        records = intel_by_dist.get(d_clean, [])
        
        # If no direct match, fuzzy match
        if not records:
            for k, v in intel_by_dist.items():
                if k in d_clean or d_clean in k:
                    records = v
                    break
                    
        ac_count = len(records) if records else len(d.acs)
        
        # Find overlapping PCs
        pc_names = set(r.pc_name for r in records if r.pc_name)
        
        # 2022 and 2024 tallies
        wins_2022 = Counter(r.winner_2022_party for r in records if r.winner_2022_party)
        leads_2024 = Counter(r.lead_2024_party for r in records if r.lead_2024_party)
        
        # Avg competitiveness
        comp_scores = []
        for r in records:
            score_data = calculate_competitiveness_score(
                margin_pct=r.margin_pct_2024 or 5.0,
                winner_votes=r.lead_2024_votes or 70000,
                runner_up_votes=r.runner_2024_votes or 60000,
                party_turnover_count=1 if r.winner_2022_party != r.lead_2024_party else 0,
                historical_margins=[r.margin_2017 or 10000, r.margin_2019 or 10000, r.margin_2022 or 10000, r.margin_2024 or 10000]
            )
            comp_scores.append(score_data["overall_score"])
            
        avg_comp = round(sum(comp_scores) / len(comp_scores), 1) if comp_scores else 50.0
        
        items.append({
            "id": d.id,
            "name": d.name,
            "ac_count": ac_count,
            "pc_count": len(pc_names),
            "pcs": sorted(list(pc_names)),
            "party_tally_2022": dict(wins_2022),
            "party_tally_2024": dict(leads_2024),
            "avg_competitiveness": avg_comp,
            "battlegrounds_count": sum(1 for r in records if r.is_battleground)
        })
        
    return {
        "total_districts": len(items),
        "districts": items
    }

from pathlib import Path
import json

DATA_DIR = Path(__file__).resolve().parents[3] / "data"

def _load_ground_intelligence():
    p = DATA_DIR / "district_ground_intelligence.json"
    if p.exists():
        try:
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _load_caste_demographics():
    p = DATA_DIR / "up_caste_demographics.json"
    if p.exists():
        try:
            with open(p, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

@router.get("/caste-matrix")
def get_caste_matrix():
    """
    Returns the comprehensive statewide and 75-district caste and demographic matrix of Uttar Pradesh.
    """
    data = _load_caste_demographics()
    if not data:
        raise HTTPException(status_code=404, detail="Caste demographic matrix not generated")
    return data

@router.get("/ground-intelligence-all")
def get_all_ground_intelligence():
    """
    Returns ground intelligence, promises vs reality, and AI rally speeches for all 75 districts.
    """
    data = _load_ground_intelligence()
    if not data:
        raise HTTPException(status_code=404, detail="Ground intelligence data not generated")
    return data

@router.get("/{name}/ground-intelligence")
def get_district_ground_intelligence(name: str):
    """
    Returns ground intelligence, promises vs reality, local MP/MLA report card, and rally speeches for a specific district.
    """
    data = _load_ground_intelligence()
    caste_data = _load_caste_demographics()
    
    clean_target = name.lower().replace(" ", "").replace("w", "v").replace("-", "").strip()
    matched = None
    for k, v in data.items():
        if k.lower().replace(" ", "").replace("w", "v").replace("-", "").strip() == clean_target:
            matched = v
            break
            
    if not matched:
        for k, v in data.items():
            if clean_target in k.lower() or k.lower() in clean_target:
                matched = v
                break
                
    if not matched:
        raise HTTPException(status_code=404, detail=f"Ground intelligence for district '{name}' not found")
        
    # Also attach matched caste profile if available
    district_caste = None
    if caste_data and "districts" in caste_data:
        for cd in caste_data["districts"]:
            cname = cd["district_name"].lower().replace(" ", "").replace("w", "v").replace("-", "").strip()
            if cname == clean_target or clean_target in cname or cname in clean_target:
                district_caste = cd
                break
                
    result = dict(matched)
    result["caste_profile"] = district_caste
    return result

@router.get("/{name}")
def get_district_dossier(name: str, db: Session = Depends(get_db)):
    """
    Comprehensive District Intelligence Dossier for any of UP's 75 districts.
    """
    district = db.query(District).filter(District.name.ilike(f"%{name}%")).first()
    clean_name = district.name if district else name
    
    records = db.query(ACHistoricalIntelligence).filter(
        ACHistoricalIntelligence.district.ilike(f"%{name}%")
    ).order_by(ACHistoricalIntelligence.ac_no.asc()).all()
    
    if not records and district:
        ac_ids = [ac.ac_no for ac in district.acs]
        records = db.query(ACHistoricalIntelligence).filter(
            ACHistoricalIntelligence.ac_no.in_(ac_ids)
        ).order_by(ACHistoricalIntelligence.ac_no.asc()).all()
        
    if not records:
        raise HTTPException(status_code=404, detail=f"No electoral records found for district {name}")
        
    ac_items = []
    pc_map = {}
    flips = []
    
    for r in records:
        # Competitiveness
        comp = calculate_competitiveness_score(
            margin_pct=r.margin_pct_2024 or 5.0,
            winner_votes=r.lead_2024_votes or 70000,
            runner_up_votes=r.runner_2024_votes or 60000,
            party_turnover_count=1 if r.winner_2022_party != r.lead_2024_party else 0,
            historical_margins=[r.margin_2017 or 10000, r.margin_2019 or 10000, r.margin_2022 or 10000, r.margin_2024 or 10000]
        )
        
        # Change detection (2022 vs 2024)
        changes = detect_electoral_changes(
            baseline_election="2022 Vidhan Sabha",
            comparison_election="2024 Lok Sabha Lead",
            baseline_data={"winner_party": r.winner_2022_party, "winner_candidate": r.winner_2022_candidate, "margin": r.margin_2022},
            comparison_data={"winner_party": r.lead_2024_party, "winner_candidate": r.lead_2024_candidate, "margin": r.margin_2024}
        )
        
        if changes["winner_changed"]:
            flips.append({
                "ac_no": r.ac_no,
                "ac_name": r.ac_name,
                "from_party": r.winner_2022_party,
                "to_party": r.lead_2024_party,
                "margin_2024": r.margin_2024
            })
            
        if r.pc_no and r.pc_name:
            pc_map[r.pc_no] = r.pc_name
            
        ac_items.append({
            "ac_no": r.ac_no,
            "ac_name": r.ac_name,
            "category": r.category or "GEN",
            "parent_pc": {"pc_no": r.pc_no, "pc_name": r.pc_name},
            "winner_2022": {
                "party": r.winner_2022_party,
                "candidate": r.winner_2022_candidate,
                "margin": r.margin_2022
            },
            "lead_2024": {
                "party": r.lead_2024_party,
                "candidate": r.lead_2024_candidate,
                "margin": r.margin_2024,
                "margin_pct": r.margin_pct_2024
            },
            "competitiveness": comp,
            "electoral_changes": changes["summary_statements"]
        })
        
    pcs_list = [{"pc_no": k, "pc_name": v} for k, v in sorted(pc_map.items())]
    
    tallies_2022 = Counter(r.winner_2022_party for r in records if r.winner_2022_party)
    tallies_2024 = Counter(r.lead_2024_party for r in records if r.lead_2024_party)
    
    avg_comp = round(sum(item["competitiveness"]["overall_score"] for item in ac_items) / len(ac_items), 1)
    
    # Ground intel & caste profile attachment
    ground_all = _load_ground_intelligence()
    caste_all = _load_caste_demographics()
    clean_target = clean_name.lower().replace(" ", "").replace("w", "v").replace("-", "").strip()
    
    ground_matched = None
    for k, v in ground_all.items():
        if k.lower().replace(" ", "").replace("w", "v").replace("-", "").strip() == clean_target:
            ground_matched = v
            break
            
    caste_matched = None
    if caste_all and "districts" in caste_all:
        for cd in caste_all["districts"]:
            cname = cd["district_name"].lower().replace(" ", "").replace("w", "v").replace("-", "").strip()
            if cname == clean_target or clean_target in cname or cname in clean_target:
                caste_matched = cd
                break

    return {
        "district_name": clean_name,
        "state": "Uttar Pradesh",
        "total_acs": len(ac_items),
        "total_pcs": len(pcs_list),
        "pcs": pcs_list,
        "party_performance_2022": dict(tallies_2022),
        "party_performance_2024": dict(tallies_2024),
        "average_competitiveness": avg_comp,
        "significant_flips_count": len(flips),
        "significant_flips": flips,
        "assembly_constituencies": ac_items,
        "ground_intelligence": ground_matched,
        "caste_profile": caste_matched
    }

