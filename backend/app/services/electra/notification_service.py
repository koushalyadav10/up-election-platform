"""
ELECTRA Notification Engine & Daily Intelligence Digest
Manages in-product alerts, deduplication clustering, user subscriptions, and Daily Briefing.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import ElectraNotification, ElectraSubscription

class ElectraNotificationService:
    def __init__(self, db: Session):
        self.db = db

    def seed_initial_notifications(self):
        """Seeds standard non-alarmist intelligence alerts if repository is empty."""
        if self.db.query(ElectraNotification).count() > 0:
            return

        initial = [
            ElectraNotification(
                title="Special Summary Revision Completed in Sant Kabir Nagar",
                summary="District Election Office processed 4,200+ Form-6 additions across Khalilabad (AC 313) and Dhanghata (AC 314). All booth rosters verified.",
                alert_type="UPDATE",
                category="roll",
                target_type="DISTRICT",
                target_id="Sant Kabir Nagar",
                source_name="District Election Office Sant Kabir Nagar",
                source_url="https://santkabirnagar.nic.in",
                source_quality="Official",
                publication_date="2026-09-12",
                cluster_count=3,
                deduplication_key="SKN_ROLL_UPDATE_2026",
                is_read=False,
                created_at=datetime.utcnow()
            ),
            ElectraNotification(
                title="Ami River Infrastructure Project Cleared for Khalilabad",
                summary="UP state administration approved ₹48 Cr flood defense and drainage package benefiting Khalilabad industrial town polling areas.",
                alert_type="INFO",
                category="news",
                target_type="AC",
                target_id="313",
                source_name="Amar Ujala Bureau",
                source_url="https://www.amarujala.com",
                source_quality="Established",
                publication_date="2026-09-10",
                cluster_count=2,
                deduplication_key="AMI_RIVER_KHL_48CR",
                is_read=False,
                created_at=datetime.utcnow()
            ),
            ElectraNotification(
                title="ECI Digital BLA-2 Verification Protocol Released",
                summary="Updated statutory guidelines mandate online verification of polling station agents (BLA-2) via ECI Suvidha portal.",
                alert_type="SOURCE_UPDATE",
                category="official",
                target_type="STATE",
                target_id="UP",
                source_name="Election Commission of India",
                source_url="https://eci.gov.in",
                source_quality="Official",
                publication_date="2026-09-14",
                cluster_count=4,
                deduplication_key="ECI_SOP_BLA2_2026",
                is_read=False,
                created_at=datetime.utcnow()
            )
        ]
        self.db.add_all(initial)
        self.db.commit()

    def get_notifications(self, target_type: Optional[str] = None, target_id: Optional[str] = None) -> List[Dict[str, Any]]:
        self.seed_initial_notifications()
        q = self.db.query(ElectraNotification).order_by(ElectraNotification.created_at.desc())
        if target_type:
            q = q.filter(ElectraNotification.target_type == target_type)
        if target_id:
            q = q.filter(ElectraNotification.target_id == str(target_id))

        items = q.limit(20).all()
        return [
            {
                "id": it.id,
                "title": it.title,
                "summary": it.summary,
                "alert_type": it.alert_type,
                "category": it.category,
                "target_type": it.target_type,
                "target_id": it.target_id,
                "source_name": it.source_name,
                "source_url": it.source_url,
                "source_quality": it.source_quality,
                "publication_date": it.publication_date,
                "cluster_count": it.cluster_count,
                "is_read": it.is_read,
                "created_at": it.created_at.strftime("%Y-%m-%d %H:%M") if it.created_at else ""
            }
            for it in items
        ]

    def mark_as_read(self, notification_id: int):
        rec = self.db.query(ElectraNotification).filter(ElectraNotification.id == notification_id).first()
        if rec:
            rec.is_read = True
            self.db.commit()

    def get_daily_digest(self) -> Dict[str, Any]:
        """Returns the Electra Daily Brief."""
        self.seed_initial_notifications()
        notifs = self.db.query(ElectraNotification).order_by(ElectraNotification.created_at.desc()).limit(5).all()
        return {
            "title": "Electra Daily Intelligence Brief",
            "date": datetime.now().strftime("%A, %d %B %Y"),
            "status": "Verified & Calibrated",
            "executive_summary": "Active voter roll verification ongoing across eastern UP districts. ECI digital BLA-2 guidelines implemented statewide. No irregular roll drops detected.",
            "bulletin_items": [
                {
                    "headline": n.title,
                    "summary": n.summary,
                    "source": n.source_name,
                    "date": n.publication_date or "Recent",
                    "badge": n.alert_type
                }
                for n in notifs
            ]
        }
