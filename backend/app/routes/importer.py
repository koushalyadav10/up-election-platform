from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil
import os
import tempfile
from python_calamine import CalamineWorkbook
from app.database import get_db
from app.models import DataImport, DataVersion

router = APIRouter(prefix="/api/importer", tags=["Data Importer"])

@router.post("/preview")
async def preview_file(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1].lower()
    if suffix not in [".xls", ".xlsx", ".csv"]:
        raise HTTPException(status_code=400, detail="Only XLS, XLSX, and CSV formats supported.")
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        wb = CalamineWorkbook.from_path(tmp_path)
        sheet_name = wb.sheet_names[0]
        sheet = wb.get_sheet_by_name(sheet_name)
        rows = sheet.to_python()
        
        # Detect headers
        header_row = 0
        for idx, r in enumerate(rows[:5]):
            if any(isinstance(c, str) and ("name" in c.lower() or "pc" in c.lower() or "constituency" in c.lower() or "candidate" in c.lower()) for c in r):
                header_row = idx
                break
                
        headers = [str(c).strip() for c in rows[header_row] if c is not None]
        sample_rows = rows[header_row+1:header_row+6]
        
        os.remove(tmp_path)
        return {
            "filename": file.filename,
            "sheet_name": sheet_name,
            "total_rows_detected": len(rows),
            "header_row_index": header_row,
            "detected_columns": headers,
            "sample_rows": sample_rows,
            "validation_preview": {
                "status": "Ready for Column Mapping",
                "recommended_mappings": {
                    "PC Name / Constituency": "pc_name",
                    "Candidate Name": "candidate_name",
                    "Party Name": "party_name",
                    "Total Votes": "votes"
                }
            }
        }
    except Exception as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        raise HTTPException(status_code=500, detail=f"Error reading spreadsheet: {str(e)}")
