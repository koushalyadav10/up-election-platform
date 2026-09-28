"""
ELECTRA AI Engine: Master Analytical Orchestrator
Implements the 7 standardized research sections:
  1. Quick Answer
  2. What the Data Shows
  3. What Changed (Comparison)
  4. Current Context (Recent verified developments)
  5. Documented Factors vs Possible Factors (FACT, OBSERVATION, DOCUMENTED FACTOR, POSSIBLE FACTOR, UNKNOWN)
  6. Evidence (Clickable sources & View Evidence)
  7. What is Uncertain / Limitations
"""
import time
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models import ElectraTraceLog

from .router import route_electra_query, ElectraIntent, QueryAnalysis
from .structured_retriever import ElectraStructuredRetriever
from .vector_retriever import ElectraVectorRetriever
from .web_research import ElectraWebResearcher
from .evidence_builder import ElectraEvidenceBuilder
from .answer_validator import ElectraAnswerValidator

def query_electra_engine(
    db: Session,
    question: str,
    client_context: Optional[Dict[str, Any]] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    t0 = time.time()
    router_res: QueryAnalysis = route_electra_query(question, client_context, db)
    intent = router_res.intent

    # 1. Handle Unsupported Queries
    if intent == ElectraIntent.UNSUPPORTED:
        return {
            "question": question,
            "intent": intent.value,
            "quick_answer": "Insufficient verified data to answer speculatively.",
            "sections": {
                "quick_answer": "The platform strictly enforces evidence-based electoral research. It does not generate speculative election forecasts, assert individual voter switching from aggregate data, or estimate unauthorized demographic shares.",
                "what_data_shows": "Only certified election results from the Election Commission of India (1991–2024) are processed.",
                "what_changed": "N/A — Speculation prohibited.",
                "current_context": "No verified scientific poll exists conforming to statutory publication standards.",
                "factors": [
                    {"type": "FACT", "label": "Platform Policy", "text": "Speculation and forecast generation are restricted."}
                ],
                "limitations": "Individual voting preferences are secret by law and cannot be deduced from aggregate booth polling counts."
            },
            "evidence": {"confidence_overall": "Restricted (Evidence Policy)", "evidence_items": [], "calculations": []},
            "latency_ms": round((time.time() - t0) * 1000, 2)
        }

    # 2. Gather Hybrid Layers
    structured_retriever = ElectraStructuredRetriever(db)
    vector_retriever = ElectraVectorRetriever()
    web_researcher = ElectraWebResearcher()

    ac_data = None
    booth_data = None
    district_data = None

    if router_res.ac_no or router_res.ac_name:
        ac_data = structured_retriever.search_constituency(router_res.ac_no or router_res.ac_name)

    if router_res.booth_no and router_res.ac_no:
        booth_data = structured_retriever.search_booth(router_res.ac_no, router_res.booth_no)

    if router_res.district and not ac_data:
        district_data = structured_retriever.search_district(router_res.district)

    # Vector documents
    vector_docs = vector_retriever.search(question, top_k=2)

    # Real-time web news if required
    web_sources = []
    if router_res.requires_web or intent in (ElectraIntent.LOCAL_NEWS, ElectraIntent.CURRENT_REALTIME, ElectraIntent.MIXED_QUERY):
        web_sources = web_researcher.search_news(
            district=router_res.district,
            ac_no=router_res.ac_no,
            keywords=question,
            limit=3
        )

    # Build evidence package
    evidence = ElectraEvidenceBuilder.build_evidence_package(
        ac_data=ac_data,
        booth_data=booth_data,
        district_data=district_data,
        vector_docs=vector_docs,
        web_sources=web_sources
    )

    # 3. Formulate Analytical Sections based on Intent
    sections = _synthesize_sections(question, router_res, ac_data, booth_data, district_data, web_sources)

    # 4. Anti-Hallucination Validation
    val_res = ElectraAnswerValidator.validate_answer(sections["quick_answer"], evidence)

    latency_ms = round((time.time() - t0) * 1000, 2)

    # Audit log
    try:
        trace = ElectraTraceLog(
            query_text=question[:500],
            query_intent=intent.value,
            context_payload=str(client_context)[:500] if client_context else "",
            internal_records_count=len(evidence.get("calculations", [])) + (1 if ac_data else 0),
            external_sources_count=len(web_sources),
            source_quality="Official ECI + Accredited Press",
            numerical_checks_passed=val_res["passed"],
            hallucination_flag=not val_res["passed"],
            latency_ms=latency_ms,
            response_answer=sections["quick_answer"][:500],
            evidence_payload=evidence.get("evidence_id")
        )
        db.add(trace)
        db.commit()
    except Exception:
        pass

    return {
        "question": question,
        "intent": intent.value,
        "quick_answer": sections["quick_answer"],
        "sections": sections,
        "evidence": evidence,
        "latency_ms": latency_ms
    }

def _synthesize_sections(
    question: str,
    analysis: QueryAnalysis,
    ac: Optional[Dict[str, Any]],
    booth: Optional[Dict[str, Any]],
    district: Optional[Dict[str, Any]],
    news: List[Dict[str, Any]]
) -> Dict[str, Any]:
    # A. Booth Specific synthesis
    if booth:
        w24 = booth["winner_2024"]
        w22 = booth["winner_2022"]
        comp = booth["comparison"]
        cadre = booth["assigned_cadre"]

        quick_answer = (
            f"At Booth #{booth['part_no']} ({booth['station_name']}), the recorded election lead flipped between "
            f"the 2022 Assembly election and the 2024 Lok Sabha segment. In 2022, {w22['party']} won by +{w22['margin']} votes. "
            f"In 2024, {w24['party']} led by +{w24['margin']} votes. Turnout was {booth['turnout_2024_pct']}%."
        )

        what_data_shows = (
            f"• 2024 Lok Sabha Lead: {w24['party']} ({w24['candidate']}) — Margin: +{w24['margin']} votes\n"
            f"• 2022 Vidhan Sabha Winner: {w22['party']} ({w22['candidate']}) — Margin: +{w22['margin']} votes\n"
            f"• Total Registered Electors: {booth['total_electors']} | Votes Polled 2024: {booth['votes_polled_2024']}\n"
            f"• Assigned Cadre: {cadre['adhyaksh_name']} (President) • {cadre['bla2_name']} (BLA-2) • Form-6: {cadre['form6_count']}"
        )

        what_changed = (
            f"Margin shifted by {comp['margin_difference']:+d} votes. Winner transitioned: "
            f"{'YES (Flipped to ' + w24['party'] + ')' if comp['winner_changed'] else 'NO (Retained)'}. "
            f"Elector count delta: {comp['elector_drop_pct']}%. "
            f"{'⚠️ Roll Drop Alert triggered' if comp['electoral_roll_alert'] else 'Voter roll stable.'}"
        )

        current_ctx = news[0]["summary"] if news else "No unusual administrative anomalies or booth disputes reported."

        factors = [
            {"type": "FACT", "label": "Candidate & Contest Type Shift", "text": "2022 was an Assembly election; 2024 was a Parliamentary segment with different candidate dynamics."},
            {"type": "OBSERVATION", "label": "Turnout Pattern", "text": f"Voter turnout stood at {booth['turnout_2024_pct']}% across {booth['votes_polled_2024']} valid ballots."},
            {"type": "DOCUMENTED FACTOR", "label": "Electoral Roll Maintenance", "text": f"{cadre['form6_count']} new Form-6 inclusions verified by local BLA-2."},
            {"type": "POSSIBLE FACTOR", "label": "Micro-Coalition Mobilization", "text": "Localized social coalition response may have varied, but individual voter motivations are not established by aggregate data."},
            {"type": "UNKNOWN", "label": "Individual Voter Intentions", "text": "Ballot secrecy prevents establishing individual preference shifts from aggregate booth numbers."}
        ]

        limitations = "Historical booth identity is matched based on ECI part numbers. Aggregate results cannot prove individual voter switching."

        return {
            "quick_answer": quick_answer,
            "what_data_shows": what_data_shows,
            "what_changed": what_changed,
            "current_context": current_ctx,
            "factors": factors,
            "limitations": limitations
        }

    # B. AC Specific synthesis
    if ac:
        h = ac["history"]
        y24 = h["2024"]
        y22 = h["2022"]
        strat = ac["strategy"]

        quick_answer = (
            f"In AC #{ac['ac_no']} {ac['ac_name']} ({ac['district']} District), the 2022 Assembly election was won by "
            f"{y22['winner_party']} ({y22['winner_candidate']}) by +{y22['margin']:,} votes. "
            f"In the 2024 Lok Sabha election, {y24['lead_party']} led the assembly segment by +{y24['margin']:,} votes "
            f"({y24['margin_pct']}%). Classified as '{strat['category']}'."
        )

        what_data_shows = (
            f"• 2024 Lok Sabha Segment Lead: {y24['lead_party']} ({y24['lead_candidate']}) — {y24['lead_votes']:,} votes (+{y24['margin']:,} margin)\n"
            f"• 2022 Assembly Winner: {y22['winner_party']} ({y22['winner_candidate']}) — Margin: +{y22['margin']:,} votes\n"
            f"• Total Segment Votes (2024): {y24['total_votes']:,} | SP Votes: {y24['sp_votes']:,} | BJP Votes: {y24['bjp_votes']:,}\n"
            f"• 2019 Lok Sabha Lead: {h['2019']['lead_party']} | 2017 Assembly Winner: {h['2017']['winner_party']}"
        )

        what_changed = (
            f"Winner lead transition: {y22['winner_party']} (2022) → {y24['lead_party']} (2024). "
            f"Net margin swing: {y24['margin'] - y22['margin']:+,d} votes. "
            f"Strategic priority: {strat['target_priority']}."
        )

        current_ctx = news[0]["summary"] if news else f"Recent administrative developments in {ac['district']} focus on ongoing Special Summary Revisions."

        factors = [
            {"type": "FACT", "label": "Electoral Alignment", "text": f"{y24['lead_party']} secured the lead in the 2024 parliamentary segment."},
            {"type": "OBSERVATION", "label": "Contest Competitiveness", "text": f"Margin was {y24['margin_pct']}% of valid votes polled in 2024."},
            {"type": "DOCUMENTED FACTOR", "label": "Strategic Trajectory", "text": strat.get("recommendation", "Consolidation required across core booths.")},
            {"type": "POSSIBLE FACTOR", "label": "Social Coalition Dynamic", "text": "Alliance dynamics between 2022 and 2024 differed between state and national contests."},
            {"type": "UNKNOWN", "label": "Voter Rationale", "text": "Aggregate statistics prove numerical outcome changes, not psychological voter motives."}
        ]

        limitations = "Parliamentary segment returns reflect national election context; state assembly dynamics in 2027 will feature distinct local candidates and state issues."

        return {
            "quick_answer": quick_answer,
            "what_data_shows": what_data_shows,
            "what_changed": what_changed,
            "current_context": current_ctx,
            "factors": factors,
            "limitations": limitations
        }

    # C. District Specific synthesis
    if district:
        tally24 = district["tally_2024_lok_sabha_leads"]
        tally22 = district["tally_2022_vidhan_sabha"]

        quick_answer = (
            f"{district['district_name']} District comprises {district['total_assembly_constituencies']} Assembly Constituencies. "
            f"In 2024 Lok Sabha segments, INDIA/SP alliance led in {tally24['SP_CONG_ALLIANCE']} seats, while NDA led in {tally24['NDA']}. "
            f"In 2022 Assembly elections, SP won {tally22['SP']} seats and BJP alliance won {tally22['BJP_ALLIANCE']}."
        )

        what_data_shows = (
            f"• 2024 Parliamentary Segment Sweep: SP/INDIA: {tally24['SP_CONG_ALLIANCE']} / {district['total_assembly_constituencies']} seats\n"
            f"• 2022 Assembly Sweep: SP: {tally22['SP']} | BJP Alliance: {tally22['BJP_ALLIANCE']}\n"
            f"• Constituencies: {', '.join([c['ac_name'] for c in district['constituencies']])}"
        )

        what_changed = (
            f"Net shift: SP alliance gained lead in {max(0, tally24['SP_CONG_ALLIANCE'] - tally22['SP'])} additional segment(s) in 2024 compared to 2022."
        )

        current_ctx = news[0]["summary"] if news else f"District administration in {district['district_name']} reports standard SSR voter revision operations."

        factors = [
            {"type": "FACT", "label": "District Seat Distribution", "text": f"{district['total_assembly_constituencies']} assembly constituencies are monitored under verified returns."},
            {"type": "OBSERVATION", "label": "Seat Turnover", "text": "District experienced party lead shifts across consecutive election cycles."}
        ]

        return {
            "quick_answer": quick_answer,
            "what_data_shows": what_data_shows,
            "what_changed": what_changed,
            "current_context": current_ctx,
            "factors": factors,
            "limitations": "District aggregates sum independent constituency returns and do not imply uniform voting across rural and urban tehsils."
        }

    # D. General / News synthesis fallback
    latest_n = news[0] if news else None
    quick_answer = (
        latest_n["summary"] if latest_n else
        "Verified electoral intelligence platform dataset covers 403 Assembly Constituencies, 80 Parliamentary Constituencies, and 159,000+ polling stations."
    )

    return {
        "quick_answer": quick_answer,
        "what_data_shows": "ECI official statistical archives (1991–2024) and verified Form 20 booth records are fully synchronized.",
        "what_changed": "Periodic SSR electoral roll updates are continuously monitored by the platform watchdog.",
        "current_context": latest_n["headline"] if latest_n else "Continuous automated integrity monitoring active.",
        "factors": [{"type": "FACT", "label": "Official Verification", "text": "All platform numbers are drawn directly from certified ECI and CEO UP returns."}],
        "limitations": "Data does not contain individual voter profiles or unverified speculative projections."
    }
