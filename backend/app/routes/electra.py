"""
ELECTRA API Routes: Context-Aware Intelligence Engine Endpoints
Provides:
  POST /api/electra/query
  GET  /api/electra/context
  GET  /api/electra/evidence/{evidence_id}
  GET  /api/electra/news
  GET  /api/electra/notifications
  POST /api/electra/notifications/{id}/read
  GET  /api/electra/subscriptions
  POST /api/electra/subscriptions
  DELETE /api/electra/subscriptions/{id}
  GET  /api/electra/digest
  GET  /api/electra/snapshots
  GET  /api/electra/debug-trace
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Body, status
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import ElectraNotification, ElectraSubscription, ElectraSourceSnapshot, ElectraTraceLog
from app.services.electra.ai_engine import query_electra_engine
from app.services.electra.news_service import ElectraNewsService
from app.services.electra.notification_service import ElectraNotificationService
from app.services.electra.change_detector import ElectraChangeDetector
from app.services.electra.structured_retriever import ElectraStructuredRetriever

router = APIRouter(prefix="/api/electra", tags=["Electra AI Intelligence Engine"])

class ElectraQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None

class SubscriptionRequest(BaseModel):
    target_type: str  # AC, PC, DISTRICT, ALL
    target_id: str
    target_name: Optional[str] = None
    alert_frequency: str = "instant"

@router.post("/query")
def ask_electra(req: ElectraQueryRequest, db: Session = Depends(get_db)):
    """
    Primary Electra Entrypoint:
    Executes hybrid RAG pipeline with strict grounding, context awareness, and verification.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    return query_electra_engine(
        db=db,
        question=req.query,
        client_context=req.context,
        session_id=req.session_id
    )

@router.get("/context")
def get_electra_context(
    ac_no: Optional[int] = Query(None),
    district: Optional[str] = Query(None),
    booth_no: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns rapid contextual overview for an active constituency or booth."""
    retriever = ElectraStructuredRetriever(db)
    result: Dict[str, Any] = {"active": True}
    
    if ac_no:
        ac = retriever.search_constituency(ac_no)
        if ac:
            result["constituency"] = ac
            if booth_no:
                b = retriever.search_booth(ac_no, booth_no)
                if b:
                    result["booth"] = b

    if district and "constituency" not in result:
        d = retriever.search_district(district)
        if d:
            result["district"] = d

    return result

@router.get("/news")
def get_electra_news(
    district: Optional[str] = Query(None),
    ac_no: Optional[int] = Query(None),
    limit: int = Query(10, le=50)
):
    """Returns deduplicated, credible local news intelligence."""
    service = ElectraNewsService()
    return service.get_local_news_feed(district=district, ac_no=ac_no, limit=limit)

@router.get("/notifications")
def get_notifications(
    target_type: Optional[str] = Query(None),
    target_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns in-product intelligence notifications with multi-source cluster counts."""
    service = ElectraNotificationService(db)
    return service.get_notifications(target_type=target_type, target_id=target_id)

@router.post("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    service = ElectraNotificationService(db)
    service.mark_as_read(notification_id)
    return {"status": "SUCCESS", "id": notification_id}

@router.get("/digest")
def get_daily_digest(db: Session = Depends(get_db)):
    """Returns the Electra Daily Brief."""
    service = ElectraNotificationService(db)
    return service.get_daily_digest()

@router.get("/subscriptions")
def list_subscriptions(user_id: str = Query("default_analyst"), db: Session = Depends(get_db)):
    subs = db.query(ElectraSubscription).filter(
        ElectraSubscription.user_id == user_id,
        ElectraSubscription.is_active == True
    ).all()
    return [
        {
            "id": s.id,
            "target_type": s.target_type,
            "target_id": s.target_id,
            "target_name": s.target_name,
            "alert_frequency": s.alert_frequency,
            "created_at": s.created_at.strftime("%Y-%m-%d") if s.created_at else ""
        }
        for s in subs
    ]

@router.post("/subscriptions")
def create_subscription(sub: SubscriptionRequest, user_id: str = Query("default_analyst"), db: Session = Depends(get_db)):
    existing = db.query(ElectraSubscription).filter(
        ElectraSubscription.user_id == user_id,
        ElectraSubscription.target_type == sub.target_type,
        ElectraSubscription.target_id == sub.target_id
    ).first()
    if existing:
        existing.is_active = True
        existing.alert_frequency = sub.alert_frequency
        existing.target_name = sub.target_name or existing.target_name
    else:
        new_sub = ElectraSubscription(
            user_id=user_id,
            target_type=sub.target_type,
            target_id=sub.target_id,
            target_name=sub.target_name or f"{sub.target_type} #{sub.target_id}",
            alert_frequency=sub.alert_frequency,
            is_active=True
        )
        db.add(new_sub)
    db.commit()
    return {"status": "SUCCESS", "message": f"Subscribed to {sub.target_name or sub.target_id}"}

@router.delete("/subscriptions/{sub_id}")
def delete_subscription(sub_id: int, db: Session = Depends(get_db)):
    sub = db.query(ElectraSubscription).filter(ElectraSubscription.id == sub_id).first()
    if sub:
        sub.is_active = False
        db.commit()
    return {"status": "SUCCESS", "deleted_id": sub_id}

@router.get("/snapshots")
def get_snapshots(db: Session = Depends(get_db)):
    detector = ElectraChangeDetector(db)
    detector.sync_snapshots()
    snaps = db.query(ElectraSourceSnapshot).all()
    return [
        {
            "id": s.id,
            "source_name": s.source_name,
            "url": s.url,
            "content_hash": s.content_hash,
            "title": s.title,
            "change_summary": s.change_summary,
            "last_changed": s.last_changed.strftime("%Y-%m-%d %H:%M") if s.last_changed else ""
        }
        for s in snaps
    ]

@router.get("/debug-trace")
def get_debug_trace(limit: int = Query(15, le=50), db: Session = Depends(get_db)):
    """Observability endpoint for developer and analyst audit logs."""
    logs = db.query(ElectraTraceLog).order_by(ElectraTraceLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "query": l.query_text,
            "intent": l.query_intent,
            "latency_ms": l.latency_ms,
            "internal_records": l.internal_records_count,
            "external_sources": l.external_sources_count,
            "numerical_checks_passed": l.numerical_checks_passed,
            "hallucination_flag": l.hallucination_flag,
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else ""
        }
        for l in logs
    ]
