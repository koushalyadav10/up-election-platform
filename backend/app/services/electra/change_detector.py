"""
ELECTRA Source Snapshot & Real-Time Change Detector
Tracks content hashes of official electoral portals, gazettes, and roll publications.
"""
import hashlib
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ElectraSourceSnapshot

OFFICIAL_MONITORED_PAGES = [
    {
        "source_name": "Chief Electoral Officer (CEO) Uttar Pradesh - Notifications",
        "url": "https://ceouttarpradesh.nic.in/notifications",
        "mock_content": "CEO UP SSR-2026: Schedule for Special Summary Revision of Electoral Rolls. Qualifying date 01-01-2026. Claims disposal completed."
    },
    {
        "source_name": "Election Commission of India - Press Releases",
        "url": "https://eci.gov.in/press-releases",
        "mock_content": "ECI Directives 2026: Protocols on EVM-VVPAT first randomization and designated party BLA-2 verification portals."
    },
    {
        "source_name": "District Administration Sant Kabir Nagar - Election Updates",
        "url": "https://santkabirnagar.nic.in/election",
        "mock_content": "District Election Office Sant Kabir Nagar: Special camp list for AC 312, AC 313, AC 314 Form 6 verification."
    }
]

class ElectraChangeDetector:
    def __init__(self, db: Session):
        self.db = db

    def sync_snapshots(self) -> List[Dict[str, Any]]:
        updates = []
        for page in OFFICIAL_MONITORED_PAGES:
            content = page["mock_content"]
            curr_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]

            rec = self.db.query(ElectraSourceSnapshot).filter(
                ElectraSourceSnapshot.source_name == page["source_name"]
            ).first()

            if not rec:
                rec = ElectraSourceSnapshot(
                    source_name=page["source_name"],
                    url=page["url"],
                    content_hash=curr_hash,
                    previous_hash=None,
                    title=page["source_name"],
                    change_summary="Initial baseline established for continuous integrity monitoring.",
                    last_seen=datetime.utcnow(),
                    last_changed=datetime.utcnow()
                )
                self.db.add(rec)
                self.db.commit()
                updates.append({"source": rec.source_name, "status": "BASELINE_CREATED"})
            else:
                rec.last_seen = datetime.utcnow()
                if rec.content_hash != curr_hash:
                    rec.previous_hash = rec.content_hash
                    rec.content_hash = curr_hash
                    rec.last_changed = datetime.utcnow()
                    rec.change_summary = f"Content change detected at {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}."
                    updates.append({"source": rec.source_name, "status": "DELTA_DETECTED"})
                self.db.commit()

        return updates
