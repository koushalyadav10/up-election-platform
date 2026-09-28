"""
ELECTRA: AI Query Router & Intent Classifier
Routes user inquiries into one of 9 analytical categories:
  A. INTERNAL_DATA
  B. HISTORICAL_QUERY
  C. BOOTH_ANALYSIS
  D. CURRENT_REALTIME
  E. LOCAL_NEWS
  F. OFFICIAL_UPDATE
  G. COMPARISON
  H. WHY_CHANGED
  I. MIXED_QUERY
  J. UNSUPPORTED
"""
import re
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models import ACHistoricalIntelligence, AssemblyConstituency, District, ParliamentaryConstituency

class ElectraIntent(str, Enum):
    INTERNAL_DATA = "INTERNAL_DATA"
    HISTORICAL_QUERY = "HISTORICAL_QUERY"
    BOOTH_ANALYSIS = "BOOTH_ANALYSIS"
    CURRENT_REALTIME = "CURRENT_REALTIME"
    LOCAL_NEWS = "LOCAL_NEWS"
    OFFICIAL_UPDATE = "OFFICIAL_UPDATE"
    COMPARISON = "COMPARISON"
    WHY_CHANGED = "WHY_CHANGED"
    DOCUMENT_RESEARCH = "DOCUMENT_RESEARCH"
    MIXED_QUERY = "MIXED_QUERY"
    UNSUPPORTED = "UNSUPPORTED"

class QueryAnalysis(BaseModel):
    intent: ElectraIntent
    confidence: float
    ac_no: Optional[int] = None
    ac_name: Optional[str] = None
    pc_no: Optional[int] = None
    pc_name: Optional[str] = None
    district: Optional[str] = None
    booth_no: Optional[int] = None
    election_years: List[int] = []
    is_comparison: bool = False
    requires_web: bool = False
    requires_structured: bool = True
    summary: str

def route_electra_query(question: str, client_context: Optional[Dict[str, Any]], db: Session) -> QueryAnalysis:
    q = (question or "").strip()
    q_lower = q.lower()
    ctx = client_context or {}

    # 1. Check for Unsupported / Predictive Speculation
    unsupported_terms = [
        "who will win in 2027", "who will win next", "prediction for 2027",
        "predict winner", "exit poll 2027", "opinion poll 2027",
        "caste percentage of voters", "caste share in booth",
        "which individual voter switched", "voters switched from"
    ]
    if any(t in q_lower for t in unsupported_terms):
        return QueryAnalysis(
            intent=ElectraIntent.UNSUPPORTED,
            confidence=0.99,
            requires_web=False,
            requires_structured=False,
            summary="Unsupported predictive or speculative request. Platform enforces evidence-based data."
        )

    # 2. Extract Entities from Query + Merge Client Context
    detected_ac_no: Optional[int] = ctx.get("ac_no")
    detected_ac_name: Optional[str] = ctx.get("ac_name")
    detected_pc_no: Optional[int] = ctx.get("pc_no")
    detected_pc_name: Optional[str] = ctx.get("pc_name")
    detected_district: Optional[str] = ctx.get("district")
    detected_booth_no: Optional[int] = ctx.get("booth_no") or ctx.get("part_no")

    # Regex for Booth / Part number: "booth 42", "booth #42", "part 42", "बूथ 42"
    booth_match = re.search(r'(?:booth|part|station|बूथ|भाग)\s*(?:no\.?|#)?\s*(\d+)', q_lower)
    if booth_match:
        detected_booth_no = int(booth_match.group(1))

    # Regex for AC number: "ac 314", "ac #314", "assembly 313"
    ac_match = re.search(r'(?:ac|assembly|vidhan sabha|विधानसभा)\s*(?:no\.?|#)?\s*(\d+)', q_lower)
    if ac_match:
        detected_ac_no = int(ac_match.group(1))

    # Check for AC names in DB
    all_acs = db.query(ACHistoricalIntelligence).all()
    for ac in all_acs:
        if ac.ac_name.lower() in q_lower:
            detected_ac_no = ac.ac_no
            detected_ac_name = ac.ac_name
            detected_district = ac.district
            detected_pc_name = ac.pc_name
            detected_pc_no = ac.pc_no
            break

    # If AC is set, resolve district and PC if missing
    if detected_ac_no and not detected_ac_name:
        ac_obj = db.query(ACHistoricalIntelligence).filter(ACHistoricalIntelligence.ac_no == detected_ac_no).first()
        if ac_obj:
            detected_ac_name = ac_obj.ac_name
            detected_district = detected_district or ac_obj.district
            detected_pc_name = detected_pc_name or ac_obj.pc_name
            detected_pc_no = detected_pc_no or ac_obj.pc_no

    # Check for District names if still missing
    if not detected_district:
        all_districts = db.query(District).all()
        for dist in all_districts:
            if dist.name.lower() in q_lower:
                detected_district = dist.name
                break

    # Extract years mentioned
    years_found = [int(y) for y in re.findall(r'\b(19\d\d|20\d\d)\b', q)]
    if not years_found and ctx.get("year"):
        years_found = [int(ctx["year"])]

    # 3. Classify Query Intent
    is_comparison = bool(
        "vs" in q_lower or "compare" in q_lower or "तुलना" in q_lower or 
        ("2022" in q_lower and "2024" in q_lower) or
        ("2017" in q_lower and "2022" in q_lower) or
        "badla" in q_lower or "changed" in q_lower or "difference" in q_lower
    )

    is_why = bool(
        "why" in q_lower or "kyun" in q_lower or "kyu" in q_lower or "क्यो" in q_lower or 
        "reason" in q_lower or "wajah" in q_lower or "factor" in q_lower or "explain" in q_lower
    )

    is_news = bool(
        "news" in q_lower or "khabar" in q_lower or "taja" in q_lower or "update" in q_lower or 
        "aaj" in q_lower or "today" in q_lower or "recent" in q_lower or "halhi" in q_lower or 
        "happen" in q_lower or "incident" in q_lower or "latest" in q_lower or "vikas" in q_lower
    )

    is_official_sir = bool(
        "sir" in q_lower or "roll" in q_lower or "voter list" in q_lower or "voter-list" in q_lower or 
        "form 6" in q_lower or "form-6" in q_lower or "deletion" in q_lower or "addition" in q_lower or
        "ceo" in q_lower or "notification" in q_lower or "circular" in q_lower
    )

    is_booth_specific = bool(detected_booth_no is not None or "booth" in q_lower or "polling station" in q_lower or "बूथ" in q_lower)

    # Decision Matrix
    if is_why:
        intent = ElectraIntent.WHY_CHANGED
        requires_web = bool(is_news or "recent" in q_lower)
        requires_structured = True
    elif is_news and ("2022" in q_lower or "2024" in q_lower or "result" in q_lower or "vote" in q_lower):
        intent = ElectraIntent.MIXED_QUERY
        requires_web = True
        requires_structured = True
    elif is_news:
        intent = ElectraIntent.LOCAL_NEWS
        requires_web = True
        requires_structured = bool(detected_ac_no or detected_district)
    elif is_official_sir:
        intent = ElectraIntent.OFFICIAL_UPDATE
        requires_web = bool("latest" in q_lower or "circular" in q_lower)
        requires_structured = True
    elif is_booth_specific:
        intent = ElectraIntent.BOOTH_ANALYSIS
        requires_web = False
        requires_structured = True
    elif is_comparison:
        intent = ElectraIntent.COMPARISON
        requires_web = False
        requires_structured = True
    elif any(y in years_found for y in [1991, 1993, 1996, 1998, 1999, 2002, 2004, 2007, 2009, 2012, 2014, 2017, 2019]):
        intent = ElectraIntent.HISTORICAL_QUERY
        requires_web = False
        requires_structured = True
    else:
        intent = ElectraIntent.INTERNAL_DATA
        requires_web = False
        requires_structured = True

    return QueryAnalysis(
        intent=intent,
        confidence=0.92,
        ac_no=detected_ac_no,
        ac_name=detected_ac_name,
        pc_no=detected_pc_no,
        pc_name=detected_pc_name,
        district=detected_district,
        booth_no=detected_booth_no,
        election_years=years_found or [2024, 2022],
        is_comparison=is_comparison,
        requires_web=requires_web,
        requires_structured=requires_structured,
        summary=f"Routed as {intent.value} for AC={detected_ac_name or detected_ac_no} District={detected_district} Booth={detected_booth_no}"
    )
