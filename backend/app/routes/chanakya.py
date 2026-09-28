# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/routes/chanakya.py
API Endpoints for CHUNAVEE CHANAKYA (चुनावी चाणक्य AI)
War Room Political Advisor & Voice Chatbot.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.chanakya_engine import chanakya_engine

router = APIRouter(prefix="/api/chanakya", tags=["Chunavee Chanakya AI War Room Advisor"])

class ChanakyaAskRequest(BaseModel):
    query: str
    language: Optional[str] = "auto"
    district: Optional[str] = None
    session_id: Optional[str] = None

@router.post("/ask")
def ask_chanakya(req: ChanakyaAskRequest):
    """
    Main Chanakya entrypoint: handles queries in Hindi, English, and Hinglish.
    Combines 75 districts ground intel, caste matrix, and election EVM results.
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    return chanakya_engine.ask(query=req.query.strip(), language=req.language or "auto")

@router.get("/quick-prompts")
def get_quick_prompts():
    """
    Returns curated high-impact war room prompt chips for rapid analysis.
    """
    return {
        "prompts": [
            {
                "id": "ayodhya-coalition",
                "label": "🏛️ अयोध्या: कुर्मी + मुस्लिम भाषण",
                "query": "अयोध्या में कुर्मी और मुस्लिम वोट को एकजुट करने का सबसे सटीक भाषण क्या होगा?"
            },
            {
                "id": "gorakhpur-scandals",
                "label": "🔥 गोरखपुर: भाजपा विधायक घेराबंदी",
                "query": "गोरखपुर में भाजपा के स्थानीय विधायक को घेरने के 3 सबसे बड़े मुद्दे क्या हैं?"
            },
            {
                "id": "bsp-vote-shift",
                "label": "📊 बसपा का 6% वोट शिफ्ट",
                "query": "अगर बसपा का 6% वोट इंडिया गठबंधन में आता है, तो हम कितनी सीटें जीतेंगे?"
            },
            {
                "id": "lakhimpur-kisan",
                "label": "🌾 लखीमपुर खीरी: किसान व तिकुनिया",
                "query": "लखीमपुर खीरी में किसानों और तिकुनिया कांड पर मंच से क्या बोलें?"
            },
            {
                "id": "varanasi-weavers",
                "label": "🏺 वाराणसी: बुनकर व सीवर जलभराव",
                "query": "वाराणसी में बनारसी साड़ी बुनकरों और सीवर जलभराव पर सरकार को कैसे घेरें?"
            },
            {
                "id": "skn-joota-kand",
                "label": "⚡ संतकबीरनगर: कलेक्ट्रेट जूता कांड",
                "query": "संत कबीर नगर में भाजपा के जूता कांड और आमी नदी पर भाषण?"
            }
        ]
    }

@router.get("/vote-simulation")
def get_vote_simulation(shift: float = Query(6.0, ge=1.0, le=15.0)):
    """
    Simulates vote shift percentage from BSP to INDIA Alliance across all 403 ACs.
    """
    return chanakya_engine.query_bsp_vote_shift(shift_pct=shift)
