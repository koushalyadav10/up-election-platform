from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Source, SourceDocument, DataVersion
import os
from pathlib import Path

router = APIRouter(prefix="/api/sources", tags=["Data Sources"])

HISTORICAL_DIR = Path("E:/eci/historical_data")
ROOT_DIR = Path("E:/eci")

@router.get("")
def get_sources_vault(db: Session = Depends(get_db)):
    docs = db.query(SourceDocument).all()
    versions = db.query(DataVersion).order_by(DataVersion.created_at.desc()).all()
    
    document_items = []
    for d in docs:
        document_items.append({
            "code": d.document_code,
            "name": d.document_name,
            "filename": d.file_name,
            "election_year": d.election_year,
            "data_version": d.data_version,
            "status": d.status,
            "imported_at": d.imported_at.isoformat() if d.imported_at else None,
            "download_url": f"/api/sources/download?filename={d.file_name}"
        })
        
    # Scan historical_data directory
    historical_files = []
    if HISTORICAL_DIR.exists():
        for p in sorted(HISTORICAL_DIR.rglob("*")):
            if p.is_file():
                rel = p.relative_to(HISTORICAL_DIR)
                size_kb = round(p.stat().st_size / 1024, 1)
                
                # Determine election type and year from folder name
                folder = rel.parts[0]
                election_year = 2024
                election_type = "General"
                
                if "LS_" in folder:
                    election_type = "Lok Sabha"
                    election_year = int(folder.replace("LS_", ""))
                elif "VS_" in folder:
                    election_type = "Vidhan Sabha"
                    election_year = int(folder.replace("VS_", ""))
                elif folder.isdigit():
                    election_year = int(folder)
                    election_type = "Lok Sabha"
                    
                historical_files.append({
                    "name": p.name,
                    "relative_path": str(rel).replace("\\", "/"),
                    "category": folder,
                    "election_year": election_year,
                    "election_type": election_type,
                    "size_kb": size_kb,
                    "format": p.suffix.upper().replace(".", ""),
                    "download_url": f"/api/sources/download?filename={str(rel).replace('\\', '/')}"
                })

    version_items = []
    for v in versions:
        version_items.append({
            "version_tag": v.version_tag,
            "description": v.description,
            "created_at": v.created_at.isoformat() if v.created_at else None,
            "is_active": v.is_active
        })
        
    return {
        "authority": "Election Commission of India (ECI)",
        "hierarchy_principle": [
            "1. Election Commission of India Official Gazettes & Result Reports",
            "2. Chief Electoral Officer (CEO), Uttar Pradesh",
            "3. District Election Officers (DEO)",
            "4. Local Government Directory (LGD) / Census of India",
            "5. Secondary Sourced Documents"
        ],
        "active_version": "UP-ECI-1991-2024-v2",
        "documents": document_items,
        "historical_repository_count": len(historical_files),
        "historical_repository": historical_files,
        "version_history": version_items
    }

@router.get("/download")
def download_source_file(filename: str = Query(..., description="File name or relative path")):
    # 1. Check in historical_data
    candidate_1 = (HISTORICAL_DIR / filename).resolve()
    if candidate_1.exists() and candidate_1.is_file() and str(candidate_1).startswith(str(HISTORICAL_DIR.resolve())):
        return FileResponse(
            path=str(candidate_1),
            filename=candidate_1.name,
            media_type="application/octet-stream"
        )
        
    # 2. Check in ROOT_DIR
    candidate_2 = (ROOT_DIR / filename).resolve()
    if candidate_2.exists() and candidate_2.is_file() and str(candidate_2).startswith(str(ROOT_DIR.resolve())):
        return FileResponse(
            path=str(candidate_2),
            filename=candidate_2.name,
            media_type="application/octet-stream"
        )
        
    raise HTTPException(status_code=404, detail="Requested file not found in ECI repository")
