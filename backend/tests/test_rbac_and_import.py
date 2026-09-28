import sys
import os
from pathlib import Path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
import csv

client = TestClient(app)

def test_auth_verify_role():
    # 1. Test Super Admin Passcode
    res_admin = client.post("/api/strategy/assembly/auth/verify-role", json={"passcode": "sp2027admin"})
    assert res_admin.status_code == 200
    data_admin = res_admin.json()
    assert data_admin["valid"] is True
    assert data_admin["role"] == "admin"
    assert data_admin["permissions"]["can_edit"] is True
    assert data_admin["permissions"]["can_import"] is True
    assert data_admin["permissions"]["is_admin"] is True

    # 2. Test Editor Passcode
    res_editor = client.post("/api/strategy/assembly/auth/verify-role", json={"passcode": "spworker"})
    assert res_editor.status_code == 200
    data_editor = res_editor.json()
    assert data_editor["valid"] is True
    assert data_editor["role"] == "editor"
    assert data_editor["permissions"]["can_edit"] is True
    assert data_editor["permissions"]["can_import"] is False

    # 3. Test Invalid Passcode (Viewer fallback)
    res_invalid = client.post("/api/strategy/assembly/auth/verify-role", json={"passcode": "wrongcode123"})
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["valid"] is False
    assert data_invalid["role"] == "viewer"
    assert data_invalid["permissions"]["can_edit"] is False

def test_worker_database_persistence_and_security():
    ac_no = 314
    part_no = 99

    payload = {
        "adhyaksh_name": "विक्रम सिंह यादव",
        "adhyaksh_mobile": "+91 98111 22233",
        "bla2_name": "सुनील कुमार राजभर",
        "bla2_mobile": "+91 94111 44455",
        "status": "सत्यापित (VERIFIED)",
        "notes": "परीक्षण कार्यकर्ता"
    }

    # 1. Reject without auth header (403 Forbidden)
    res_no_auth = client.post(
        f"/api/strategy/assembly/{ac_no}/booth/{part_no}/worker",
        json=payload
    )
    assert res_no_auth.status_code == 403

    # 2. Reject with wrong auth header (403 Forbidden)
    res_wrong_auth = client.post(
        f"/api/strategy/assembly/{ac_no}/booth/{part_no}/worker",
        json=payload,
        headers={"x-role-key": "invalid_passcode"}
    )
    assert res_wrong_auth.status_code == 403

    # 3. Allow with valid Admin or Editor key
    save_res = client.post(
        f"/api/strategy/assembly/{ac_no}/booth/{part_no}/worker",
        json=payload,
        headers={"x-role-key": "sp2027admin"}
    )
    assert save_res.status_code == 200
    save_data = save_res.json()
    assert save_data["status"] == "SUCCESS"
    assert save_data["data"]["adhyaksh_name"] == "विक्रम सिंह यादव"

    # Fetch worker from DB
    get_res = client.get(f"/api/strategy/assembly/{ac_no}/booth/{part_no}/worker")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["adhyaksh_name"] == "विक्रम सिंह यादव"
    assert get_data["adhyaksh_mobile"] == "+91 98111 22233"
    assert get_data["bla2_name"] == "सुनील कुमार राजभर"
    assert get_data["is_custom"] is True

def test_bulk_import_security_and_execution():
    ac_no = 314
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Booth Part No", "Assigned Booth President (अध्यक्ष)", "President Mobile", "BLA-2 Name", "BLA-2 Mobile", "Status"])
    writer.writerow([101, "अजय कुमार वर्मा", "9876500101", "दिनेश निषाद", "9452000101", "Verified"])
    writer.writerow([102, "सुरेंद्र प्रताप सिंह", "9876500102", "महेश यादव", "9452000102", "Verified"])
    
    csv_bytes = output.getvalue().encode("utf-8")
    
    # 1. Reject without key
    res_no_auth = client.post(
        f"/api/strategy/assembly/{ac_no}/bulk-import-workers",
        files={"file": ("test_workers.csv", csv_bytes, "text/csv")}
    )
    assert res_no_auth.status_code == 403

    # 2. Reject with Editor key (Admin only!)
    res_editor_auth = client.post(
        f"/api/strategy/assembly/{ac_no}/bulk-import-workers",
        files={"file": ("test_workers.csv", csv_bytes, "text/csv")},
        headers={"x-role-key": "spworker"}
    )
    assert res_editor_auth.status_code == 403

    # 3. Allow with Admin key
    res = client.post(
        f"/api/strategy/assembly/{ac_no}/bulk-import-workers",
        files={"file": ("test_workers.csv", csv_bytes, "text/csv")},
        headers={"x-role-key": "sp2027admin"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["total_rows_imported"] >= 2

    # Verify booth 101 has updated data
    b101_res = client.get(f"/api/strategy/assembly/{ac_no}/booth/101/worker")
    assert b101_res.status_code == 200
    b101_data = b101_res.json()
    assert b101_data["adhyaksh_name"] == "अजय कुमार वर्मा"
    assert b101_data["is_custom"] is True

def test_export_dossier_endpoint():
    ac_no = 314
    res = client.get(f"/api/strategy/assembly/{ac_no}/export-dossier")
    assert res.status_code == 200
    assert "attachment; filename=" in res.headers.get("Content-Disposition", "")
    assert b"Booth Part No" in res.content
    assert b"Mission 2027 SP Target" in res.content

def test_worker_template_download():
    ac_no = 314
    res = client.get(f"/api/strategy/assembly/{ac_no}/worker-template-excel")
    assert res.status_code == 200
    assert "attachment; filename=" in res.headers.get("Content-Disposition", "")
    assert b"Booth Part No" in res.content
