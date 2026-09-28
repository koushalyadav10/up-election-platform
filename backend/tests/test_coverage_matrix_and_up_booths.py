"""
Comprehensive test suite for UP-wide 403 AC Booth Intelligence and Coverage Matrix.
Tests coverage across all regions: Western UP, Purvanchal, Awadh, Bundelkhand, and Rohilkhand.
"""

import sys
from pathlib import Path
backend_dir = str(Path(r"E:\eci\backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_coverage_matrix_completeness():
    res = client.get("/api/assembly-constituencies/coverage-matrix")
    assert res.status_code == 200
    data = res.json()
    assert data["total_constituencies"] == 403
    assert data["total_polling_stations"] == 159004
    assert len(data["constituencies"]) == 403
    assert data["cycles"] == [2024, 2022, 2019, 2017]
    assert data["summary"]["fully_verified_constituencies"] >= 3
    assert data["summary"]["fully_verified_form20_booths"] >= 1370

def test_multi_region_ac_polling_stations():
    sample_acs = [1, 76, 174, 228, 312, 384]

    for ac_no in sample_acs:
        for yr in [2024, 2022]:
            res = client.get(f"/api/assembly-constituencies/{ac_no}/polling-stations?year={yr}&limit=10")
            assert res.status_code == 200, f"Failed for AC {ac_no}, year {yr}"
            data = res.json()
            assert data["ac_no"] == ac_no
            assert data["total_stations"] > 0
            assert len(data["items"]) > 0
            assert data["summary"] is not None
            assert data["summary"]["total_polling_stations"] > 0
            assert data["summary"]["avg_turnout_pct"] > 0
            assert len(data["summary"]["party_tally"]) > 0

            first_st = data["items"][0]
            assert first_st["part_no"] >= 1
            assert len(first_st["station_name"]) > 5
            assert first_st["total_electors"] > 0
            assert first_st["votes_polled"] > 0
            assert first_st["turnout_pct"] > 0
            assert first_st["lead_party"] != ""
            assert len(first_st["timeline"]) == 4

def test_booth_detail_multi_region():
    for ac_no, part_no in [(1, 5), (174, 12), (312, 1), (384, 10)]:
        res = client.get(f"/api/assembly-constituencies/{ac_no}/booths/{part_no}/details")
        assert res.status_code == 200
        data = res.json()
        assert data["ac_no"] == ac_no
        assert data["part_no"] == part_no
        assert len(data["station_name"]) > 0
        assert "2024" in data["cycles"]
        assert len(data["trends"]) == 4
