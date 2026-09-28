import sys
from pathlib import Path
backend_dir = str(Path(r"E:\eci\backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.electra.router import route_electra_query, ElectraIntent
from app.services.electra.structured_retriever import ElectraStructuredRetriever
from app.services.electra.news_service import ElectraNewsService
from app.services.electra.ai_engine import query_electra_engine

client = TestClient(app)

def test_electra_intent_routing():
    db = SessionLocal()
    try:
        # 1. Internal query
        r1 = route_electra_query("2022 mein Dhanghata par kaun jeeta?", None, db)
        assert r1.intent in (ElectraIntent.INTERNAL_DATA, ElectraIntent.HISTORICAL_QUERY)
        assert r1.ac_name == "Dhanghata" or r1.ac_no == 314

        # 2. Comparison query
        r2 = route_electra_query("2022 vs 2024 compare karo Khalilabad", None, db)
        assert r2.is_comparison is True
        assert r2.intent == ElectraIntent.COMPARISON

        # 3. Booth query
        r3 = route_electra_query("Booth #42 par kya result tha?", {"ac_no": 314}, db)
        assert r3.intent == ElectraIntent.BOOTH_ANALYSIS
        assert r3.booth_no == 42
        assert r3.ac_no == 314

        # 4. Local news query
        r4 = route_electra_query("Sant Kabir Nagar mein aaj ki latest news kya hai?", None, db)
        assert r4.intent in (ElectraIntent.LOCAL_NEWS, ElectraIntent.CURRENT_REALTIME)
        assert r4.requires_web is True

        # 5. Why query
        r5 = route_electra_query("Why did SP votes increase in Dhanghata?", None, db)
        assert r5.intent == ElectraIntent.WHY_CHANGED

        # 6. Unsupported speculation query
        r6 = route_electra_query("Who will win in 2027 predict exit poll", None, db)
        assert r6.intent == ElectraIntent.UNSUPPORTED
    finally:
        db.close()


def test_electra_structured_retriever():
    db = SessionLocal()
    try:
        retriever = ElectraStructuredRetriever(db)
        
        # Test AC 314 Dhanghata
        ac = retriever.search_constituency(314)
        assert ac is not None
        assert ac["ac_no"] == 314
        assert ac["ac_name"] == "Dhanghata"
        assert "history" in ac
        assert "2024" in ac["history"]
        assert "2022" in ac["history"]

        # Test Booth
        booth = retriever.search_booth(314, 1)
        assert booth is not None
        assert booth["part_no"] == 1
        assert "winner_2024" in booth
        assert "winner_2022" in booth
        assert "assigned_cadre" in booth

        # Test District
        dist = retriever.search_district("Sant Kabir Nagar")
        assert dist is not None
        assert dist["total_assembly_constituencies"] >= 3
    finally:
        db.close()


def test_electra_query_api_endpoints():
    # 1. Main query endpoint
    res = client.post("/api/electra/query", json={
        "query": "What changed in Dhanghata AC 314 between 2022 and 2024?",
        "context": {"ac_no": 314, "district": "Sant Kabir Nagar"}
    })
    assert res.status_code == 200
    data = res.json()
    assert "quick_answer" in data
    assert "sections" in data
    assert "what_data_shows" in data["sections"]
    assert "what_changed" in data["sections"]
    assert "factors" in data["sections"]
    assert "evidence" in data
    assert len(data["sections"]["factors"]) > 0

    # 2. Context summary endpoint
    res_ctx = client.get("/api/electra/context?ac_no=314&booth_no=1")
    assert res_ctx.status_code == 200
    ctx_data = res_ctx.json()
    assert "constituency" in ctx_data
    assert "booth" in ctx_data

    # 3. News endpoint
    res_news = client.get("/api/electra/news?district=Sant+Kabir+Nagar")
    assert res_news.status_code == 200
    news_items = res_news.json()
    assert isinstance(news_items, list)
    assert len(news_items) > 0
    assert "cluster_count" in news_items[0]

    # 4. Notifications & Digest
    res_notif = client.get("/api/electra/notifications")
    assert res_notif.status_code == 200
    notifs = res_notif.json()
    assert len(notifs) > 0

    res_digest = client.get("/api/electra/digest")
    assert res_digest.status_code == 200
    digest = res_digest.json()
    assert "bulletin_items" in digest

    # 5. Subscriptions API
    res_sub = client.post("/api/electra/subscriptions", json={
        "target_type": "AC",
        "target_id": "314",
        "target_name": "AC #314 Dhanghata",
        "alert_frequency": "instant"
    })
    assert res_sub.status_code == 200
    assert res_sub.json()["status"] == "SUCCESS"

    res_subs_list = client.get("/api/electra/subscriptions")
    assert res_subs_list.status_code == 200
    assert len(res_subs_list.json()) > 0

    # 6. Observability debug trace
    res_trace = client.get("/api/electra/debug-trace")
    assert res_trace.status_code == 200
    assert len(res_trace.json()) > 0
