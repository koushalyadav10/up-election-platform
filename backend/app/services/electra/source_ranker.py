"""
ELECTRA Source Ranker & Quality Classifier
Evaluates external and internal source authority:
  1. OFFICIAL (1.00) - ECI, CEO UP, Gov Portals, Gazettes
  2. HIGH (0.85) - Established National Wires & Papers (The Hindu, Indian Express, PTI)
  3. ESTABLISHED (0.70) - Accredited Regional Publications (Amar Ujala, Dainik Jagran, Hindustan)
  4. SECONDARY (0.40) - Aggregators, secondary commentary
  5. UNVERIFIED (0.20) - Social feeds or unvetted content
"""
from enum import Enum
from typing import Dict, Any, List

class SourceQuality(str, Enum):
    OFFICIAL = "Official"
    HIGH = "High"
    ESTABLISHED = "Established"
    SECONDARY = "Secondary"
    UNVERIFIED = "Unverified"

DOMAIN_AUTHORITY_MAP = {
    "eci.gov.in": SourceQuality.OFFICIAL,
    "ceouttarpradesh.nic.in": SourceQuality.OFFICIAL,
    "sansad.in": SourceQuality.OFFICIAL,
    "santkabirnagar.nic.in": SourceQuality.OFFICIAL,
    "gorakhpur.nic.in": SourceQuality.OFFICIAL,
    "varanasi.nic.in": SourceQuality.OFFICIAL,
    "up.gov.in": SourceQuality.OFFICIAL,
    "ptinews.com": SourceQuality.HIGH,
    "thehindu.com": SourceQuality.HIGH,
    "indianexpress.com": SourceQuality.HIGH,
    "amarujala.com": SourceQuality.ESTABLISHED,
    "jagran.com": SourceQuality.ESTABLISHED,
    "livehindustan.com": SourceQuality.ESTABLISHED
}

class ElectraSourceRanker:
    @staticmethod
    def classify_domain(url_or_name: str) -> SourceQuality:
        s = url_or_name.lower()
        for domain, quality in DOMAIN_AUTHORITY_MAP.items():
            if domain in s:
                return quality
        if ".gov.in" in s or ".nic.in" in s:
            return SourceQuality.OFFICIAL
        return SourceQuality.SECONDARY

    @staticmethod
    def cross_check_claims(claims: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Cross checks numbers or assertions between multiple sources.
        If sources differ, flags discrepancy explicitly.
        """
        if len(claims) <= 1:
            return {"status": "CONSISTENT", "sources_differ": False, "verified_claim": claims[0] if claims else None}

        # Check if numbers differ
        values = set(str(c.get("claimed_value", "")).strip() for c in claims if c.get("claimed_value"))
        if len(values) > 1:
            return {
                "status": "SOURCES_DIFFER",
                "sources_differ": True,
                "discrepancy_note": f"Conflicting figures detected across {len(claims)} sources: {list(values)}. Both attributions preserved.",
                "claims": claims
            }

        return {
            "status": "CONSISTENT",
            "sources_differ": False,
            "verified_claim": claims[0],
            "supporting_sources_count": len(claims)
        }
