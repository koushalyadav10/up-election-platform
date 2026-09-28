from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.services.ai_engine import query_election_assistant
from app.models import AIQuery

router = APIRouter(prefix="/api/ai", tags=["AI Research Assistant"])

class AIQueryRequest(BaseModel):
    query: str

@router.post("/query")
def ask_ai(req: AIQueryRequest, db: Session = Depends(get_db)):
    response = query_election_assistant(db, req.query)
    
    # Audit log
    try:
        log = AIQuery(
            query_text=req.query,
            intent_detected=response.get("intent"),
            response_text=response.get("answer"),
            source_cited=response.get("source"),
            data_quality=response.get("data_quality")
        )
        db.add(log)
        db.commit()
    except Exception:
        pass
        
    return response
