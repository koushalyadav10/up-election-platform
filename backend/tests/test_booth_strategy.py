import sys
from pathlib import Path
backend_dir = str(Path(r"E:\eci\backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_booth_classification_endpoint():
    response = client.get("/api/strategy/assembly/343/booth-classification")
    assert response.status_code == 200
    data = response.json()
    assert "counts" in data
    assert "booths" in data
    assert data["counts"]["ALL"] > 0
    assert "PDA_FORTRESS" in data["counts"]
    assert "FLIPPED_TO_SP" in data["counts"]
    assert "BATTLEGROUND" in data["counts"]
    assert len(data["booths"]) > 0

    first_booth = data["booths"][0]
    assert "part_no" in first_booth
    assert "category_code" in first_booth
    assert "target_votes_2027" in first_booth


def test_booth_classification_filter():
    response = client.get("/api/strategy/assembly/343/booth-classification?category=FLIPPED_TO_SP")
    assert response.status_code == 200
    data = response.json()
    for b in data["booths"]:
        assert b["is_flipped"] is True


def test_bla_task_card_generation():
    response = client.get("/api/strategy/assembly/343/booth/1/bla-card")
    assert response.status_code == 200
    data = response.json()
    assert data["part_no"] == 1
    assert "target_votes_2027" in data
    assert "whatsapp_text" in data
    assert "share_url" in data
    assert "Form-6" in data["whatsapp_text"]
    assert "2027" in data["whatsapp_text"]


def test_simulate_booth_turnout():
    payload = {
        "target_turnout_pct": 68.5,
        "pda_favor_pct": 70.0
    }
    response = client.post("/api/strategy/assembly/343/booth/1/simulate-turnout", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "simulation" in data
    assert data["simulation"]["target_turnout_pct"] == 68.5
    assert "additional_sp_votes" in data["simulation"]


def test_booth_worker_crm():
    response = client.get("/api/strategy/assembly/343/booth/1/worker")
    assert response.status_code == 200
    data = response.json()
    assert "adhyaksh_name" in data
    assert "adhyaksh_mobile" in data
    assert "bla2_name" in data
    assert "bla2_mobile" in data


def test_progress_tracker():
    response = client.get("/api/strategy/assembly/343/progress-tracker")
    assert response.status_code == 200
    data = response.json()
    assert "verification_pct" in data
    assert "total_form6_submitted" in data
    assert len(data["sectors"]) > 0


def test_pda_estimator():
    response = client.get("/api/strategy/assembly/343/pda-estimator")
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_pda_share_pct"] > 50.0
    assert "total_opportunity_votes" in data


def test_export_ac_war_dossier():
    response = client.get("/api/strategy/assembly/343/export-dossier")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    assert len(response.content) > 1000
