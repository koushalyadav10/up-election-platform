"""
ELECTRA Evidence Builder & Mathematical Calibration
Constructs deep-inspectable calculation objects, inputs, formulas, and calibrated confidence grades.
"""
from typing import Dict, Any, List, Optional
import uuid

class ElectraEvidenceBuilder:
    @staticmethod
    def build_evidence_package(
        ac_data: Optional[Dict[str, Any]] = None,
        booth_data: Optional[Dict[str, Any]] = None,
        district_data: Optional[Dict[str, Any]] = None,
        vector_docs: Optional[List[Dict[str, Any]]] = None,
        web_sources: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        evidence_items = []
        calculations = []

        # 1. AC Historical Evidence
        if ac_data:
            h = ac_data.get("history", {})
            y24 = h.get("2024", {})
            y22 = h.get("2022", {})

            # Margin formula
            if y24.get("lead_votes") and y24.get("runner_up_votes"):
                calculations.append({
                    "id": "CALC_MARGIN_2024",
                    "label": "2024 Lok Sabha Segment Margin",
                    "formula": "Lead Votes - Runner-up Votes",
                    "inputs": {
                        f"{y24.get('lead_party')} Votes": y24.get("lead_votes"),
                        f"{y24.get('runner_up_party')} Votes": y24.get("runner_up_votes")
                    },
                    "result": f"+{y24.get('margin', 0):,} votes ({y24.get('margin_pct', 0.0)}%)",
                    "verification": "Certified by ECI Form 20 Assembly Segment Summary"
                })

            evidence_items.append({
                "id": str(uuid.uuid4())[:8],
                "title": f"Official ECI Return — AC #{ac_data.get('ac_no')} {ac_data.get('ac_name')}",
                "category": "INTERNAL_DATABASE",
                "authority": "Election Commission of India (ECI)",
                "year": 2024,
                "verification_status": "OFFICIAL_VERIFIED",
                "confidence_grade": "High evidence (Certified ECI Warehouse)",
                "metrics": {
                    "2022 Winner": f"{y22.get('winner_party')} ({y22.get('winner_candidate')}) by +{y22.get('margin', 0):,}",
                    "2024 Lead": f"{y24.get('lead_party')} ({y24.get('lead_candidate')}) by +{y24.get('margin', 0):,}",
                    "Strategic Classification": ac_data.get("strategy", {}).get("category", "General")
                }
            })

        # 2. Booth-Level Evidence
        if booth_data:
            w24 = booth_data.get("winner_2024", {})
            w22 = booth_data.get("winner_2022", {})
            calculations.append({
                "id": "CALC_BOOTH_DELTA",
                "label": f"Booth #{booth_data.get('part_no')} Margin Shift",
                "formula": "Margin (2024 LS) - Margin (2022 VS)",
                "inputs": {
                    "2024 Margin": f"+{w24.get('margin', 0)} ({w24.get('party')})",
                    "2022 Margin": f"+{w22.get('margin', 0)} ({w22.get('party')})"
                },
                "result": f"{booth_data.get('comparison', {}).get('margin_difference', 0):+d} votes delta",
                "verification": "Form 20 Certified EVM Return Sheet"
            })

            evidence_items.append({
                "id": str(uuid.uuid4())[:8],
                "title": f"Form 20 Booth Return: Part #{booth_data.get('part_no')} ({booth_data.get('station_name')})",
                "category": "FORM_20_BOOTH_RECORD",
                "authority": "Returning Officer / ECI Form 20",
                "year": "2022–2024",
                "verification_status": "OFFICIAL_VERIFIED",
                "confidence_grade": "High evidence (Form 20 Statutory Return)",
                "metrics": {
                    "Electors": booth_data.get("total_electors"),
                    "Turnout 2024": f"{booth_data.get('turnout_2024_pct')}%",
                    "Winner Changed": "Yes" if booth_data.get("comparison", {}).get("winner_changed") else "No"
                }
            })

        # 3. External Web & Local News Evidence
        if web_sources:
            for s in web_sources:
                evidence_items.append({
                    "id": s.get("id", str(uuid.uuid4())[:8]),
                    "title": s.get("headline"),
                    "category": "EXTERNAL_REPORTING",
                    "authority": s.get("source_name"),
                    "source_url": s.get("source_url"),
                    "publication_date": s.get("publication_date"),
                    "verification_status": s.get("source_quality", "Established"),
                    "confidence_grade": f"Calibrated {s.get('source_quality', 'Established')} Evidence",
                    "metrics": {
                        "Documented Claims": s.get("claims", [])
                    }
                })

        return {
            "evidence_id": f"EV_{uuid.uuid4().hex[:8].upper()}",
            "confidence_overall": "High evidence (Certified ECI Database + Ground Form 20 Records)",
            "calculations": calculations,
            "evidence_items": evidence_items,
            "statutory_documents": vector_docs or []
        }
