import os
import json
import pytest
from pathlib import Path

BASE_DIR = Path(r"E:\eci")
DATA_FILE = BASE_DIR / "data" / "historical_assembly_data.json"

@pytest.fixture(scope="module")
def historical_data():
    assert DATA_FILE.exists(), f"Missing {DATA_FILE}"
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    import sys
    backend_path = str(BASE_DIR / "backend")
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    from app.main import app
    return TestClient(app)

def test_all_403_acs_present(historical_data):
    """Verify all 403 ACs exist in the master historical dataset."""
    assert len(historical_data) == 403
    for ac_no in range(1, 404):
        assert str(ac_no) in historical_data

def test_mehdawal_ac_312_golden_reference(historical_data):
    """Verify Mehdawal AC #312 historical lineage and accuracy."""
    m = historical_data["312"]
    assert m["basic_info"]["name"] == "Menhdawal"
    assert m["basic_info"]["district"] == "Sant Kabir Nagar"
    
    # Delimitation
    identity = m["constituency_identity"]
    assert identity["current_ac_no"] == 312
    eras = {h["era"]: h["ac_no"] for h in identity["historical_numberings"]}
    assert eras.get("2000–2008") == 160 or eras.get("20002008") == 160
    assert eras.get("1976–2000") == 176 or eras.get("19762000") == 176
    assert "Boundary comparability" in identity["boundary_comparability_notice"]
    
    # Timeline
    timeline = {e["year"]: e for e in m["historical_winner_timeline"]}
    assert 2022 in timeline
    assert 2017 in timeline
    assert 2012 in timeline
    assert 2007 in timeline
    assert 2002 in timeline
    assert 1996 in timeline
    assert 1993 in timeline
    assert 1991 in timeline
    
    # Check winners
    assert "TRIPATHI" in timeline[2022]["winner"].upper()
    assert timeline[2022]["winner_party"] in ["NINSHAD", "NISHAD"]
    assert "BAGHEL" in timeline[2017]["winner"].upper()
    assert timeline[2017]["winner_party"] == "BJP"
    assert "LAXMIKANT" in timeline[2012]["winner"].upper()
    assert timeline[2012]["winner_party"] == "SP"
    assert "KALAM" in timeline[2007]["winner"].upper()
    assert timeline[2007]["winner_party"] == "SP"
    assert "KALAM" in timeline[2002]["winner"].upper()
    assert timeline[2002]["winner_party"] == "SP"
    assert "KALAM" in timeline[1996]["winner"].upper()
    assert timeline[1996]["winner_party"] == "SP"
    assert "CHANDRA SHEKHAR" in timeline[1993]["winner"].upper()
    assert timeline[1993]["winner_party"] == "BJP"
    assert "CHANDRA SHEKHAR" in timeline[1991]["winner"].upper()
    assert timeline[1991]["winner_party"] == "BJP"

def test_demographics_and_public_issues(historical_data):
    """Verify Census 2011 demographics and public issues indicators."""
    m = historical_data["312"]
    demo = m["demographics"]
    assert demo["district"] == "Sant Kabir Nagar"
    assert demo["population"] > 1000000
    assert "District-level indicator" in demo["geographic_level"]
    
    edu = m["education_profile"]
    assert edu["overall_literacy"] > 50
    
    issues = m["public_issues"]
    assert len(issues) >= 5
    for issue in issues:
        assert "indicator" in issue
        assert "value" in issue
        assert "source" in issue
        assert "evidence_notes" in issue

def test_parliamentary_segment_isolation(historical_data):
    """Verify 2024 Lok Sabha segment results are isolated and labeled."""
    for ac_no in ["1", "312", "403"]:
        seg = historical_data[ac_no]["parliamentary_segment_performance"]
        assert seg["election_year"] == 2024
        assert seg["election_type"] == "Lok Sabha"
        assert seg["label"] == "Lok Sabha Segment Result"
        assert "not constitute an Assembly election" in seg["notice"]

def test_sir_electorate_change_formula_and_safety(historical_data):
    """Verify SIR percentage formula: ((Current - Previous) / Previous) * 100 with zero division guard."""
    for ac_no, ac in historical_data.items():
        sir = ac.get("sir_electoral_roll")
        assert sir is not None, f"Missing SIR in AC #{ac_no}"
        
        prev = sir.get("previous_electors")
        curr = sir.get("current_electors")
        pct = sir.get("percentage_change")
        
        if prev and prev > 0 and curr is not None:
            expected_pct = round(((curr - prev) / prev) * 100, 2)
            assert abs(pct - expected_pct) < 0.01, f"AC #{ac_no}: {pct} != {expected_pct}"
        else:
            assert pct is None, f"AC #{ac_no}: should be None when prev is 0 or missing"
            assert sir.get("impact_category") == "Not calculable"

def test_sir_no_fabricated_data_null_vs_zero(historical_data):
    """Verify that unverified SIR additions/deletions are None (null), never silently converted to 0."""
    # Mehdawal AC #312 has official verified CEO UP SSR figures
    m312 = historical_data["312"]["sir_electoral_roll"]
    assert m312["data_status"] == "Verified"
    assert m312["verification_status"] == "Verified"
    assert m312["reported_additions"] == 47900
    assert m312["reported_deletions"] == 28500
    assert m312["source_date"] == "2024-01-22"
    
    # Other ACs without verified AC-level SSR additions/deletions must be None, NOT 0
    for ac_no in ["1", "61", "171", "200", "275", "390"]:
        sir = historical_data[ac_no]["sir_electoral_roll"]
        assert sir["data_status"] == "Unavailable"
        assert sir["verification_status"] == "Not verified"
        assert sir["reported_additions"] is None, f"AC #{ac_no} reported_additions should be None, not 0"
        assert sir["reported_deletions"] is None, f"AC #{ac_no} reported_deletions should be None, not 0"
        assert "Verified SIR data unavailable" in sir["unavailability_notice"]

def test_2024_chamber_labeling_strict_isolation(historical_data):
    """Verify 2024 is strictly labeled as Lok Sabha Segment Result and never as an Assembly election."""
    for ac_no in ["1", "8", "61", "171", "200", "227", "275", "312", "390"]:
        ac = historical_data[ac_no]
        tri = ac.get("tri_election_comparison", {})
        
        # 2017 & 2022 are Assembly Results
        assert tri["assembly_2017"]["chamber_label"] == "Assembly Result — 2017"
        assert tri["assembly_2017"]["election_type"] == "Vidhan Sabha"
        assert tri["assembly_2022"]["chamber_label"] == "Assembly Result — 2022"
        assert tri["assembly_2022"]["election_type"] == "Vidhan Sabha"
        
        # 2024 is strictly Lok Sabha Segment Result
        ls24 = tri.get("lok_sabha_segment_2024")
        assert ls24 is not None
        assert ls24["election_year"] == 2024
        assert ls24["election_type"] == "Lok Sabha"
        assert ls24["chamber_label"] == "Lok Sabha Segment Result — 2024"
        assert ls24["short_ui_label"] == "2024 LS Segment"
        assert ls24["role"] == "Parliamentary Segment Lead"
        assert "do not constitute an Assembly election" in ls24["notice"]
        
        # Also accessible via lok_sabha_2024_segment_result alias
        assert "lok_sabha_2024_segment_result" in tri
        assert tri["lok_sabha_2024_segment_result"]["chamber_label"] == "Lok Sabha Segment Result — 2024"

def test_historical_boundary_comparability_metadata(historical_data):
    """Verify historical records contain delimitation era and boundary comparability warnings."""
    for ac_no in ["1", "312", "390"]:
        timeline = historical_data[ac_no]["historical_winner_timeline"]
        for item in timeline:
            assert "election_year" in item
            assert "historical_ac_number" in item
            assert "current_ac_number" in item
            assert "delimitation_era" in item
            assert "boundary_comparability" in item
            assert "mapping_confidence" in item
            
            if item["year"] < 2008:
                assert "Pre-2008" in item["boundary_comparability"]
                assert "Historical constituency boundaries differ" in item["boundary_notice"]
            else:
                assert "2008 Delimitation Order" in item["boundary_comparability"]

def test_10_geographically_diverse_constituencies(historical_data):
    """Verify 10 geographically diverse ACs across UP for complete data integrity."""
    diverse_acs = [1, 3, 8, 61, 171, 200, 227, 275, 312, 390]
    for ac_no in diverse_acs:
        ac = historical_data[str(ac_no)]
        assert ac["basic_info"]["ac_no"] == ac_no
        assert len(ac["historical_winner_timeline"]) >= 7
        assert ac["tri_election_comparison"]["assembly_2022"]["winner"] is not None
        assert ac["tri_election_comparison"]["lok_sabha_segment_2024"]["winner"] is not None
        assert ac["sir_electoral_roll"]["official_advisory"] is not None
        assert "cannot be determined from electoral-roll changes alone" in ac["sir_electoral_roll"]["official_advisory"]


def test_sant_kabir_nagar_polling_stations(client):
    """Verify Sant Kabir Nagar district and AC polling station endpoints and data totals."""
    # 1. District level endpoint
    res = client.get("/api/assembly-constituencies/district/Sant%20Kabir%20Nagar/polling-stations")
    assert res.status_code == 200
    data = res.json()
    assert data["district"] == "Sant Kabir Nagar"
    assert data["total_stations"] == 1370
    assert len(data["stations"]) == 1370

    # 2. AC 312 Menhdawal
    res312 = client.get("/api/assembly-constituencies/312/polling-stations?page=1&limit=50")
    assert res312.status_code == 200
    d312 = res312.json()
    assert d312["ac_no"] == 312
    assert d312["total_stations"] == 481
    assert len(d312["items"]) == 50
    st1 = d312["items"][0]
    assert st1["part_no"] == 1
    assert "Prathmik Vidyalaya" in st1["station_name"]
    assert st1["total_electors"] > st1["votes_polled"]
    assert st1["latitude"] is not None and st1["longitude"] is not None
    assert len(st1["results"]) >= 8

    # 3. Test intelligent keyword search in AC #314 Dhanghata for "padaraha"
    res_padaraha = client.get("/api/assembly-constituencies/314/polling-stations?search=padaraha")
    assert res_padaraha.status_code == 200
    d_pad = res_padaraha.json()
    assert d_pad["total_stations"] >= 8
    assert any("Padaraha" in item["station_name"] for item in d_pad["items"])

    # 4. Test transliteration handling in AC #312 for "vidhyala"
    res_vid = client.get("/api/assembly-constituencies/312/polling-stations?search=vidhyala")
    assert res_vid.status_code == 200
    d_vid = res_vid.json()
    assert d_vid["total_stations"] > 0
    assert any("Vidyalaya" in item["station_name"] for item in d_vid["items"])

    # 5. Test candidate name search in AC #314 for "alagu"
    res_cand = client.get("/api/assembly-constituencies/314/polling-stations?search=alagu")
    assert res_cand.status_code == 200
    d_cand = res_cand.json()
    assert d_cand["total_stations"] > 0


