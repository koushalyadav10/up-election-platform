from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routes import (
    overview, 
    constituencies, 
    assembly, 
    parties, 
    analytics, 
    ai_assistant, 
    importer, 
    sources, 
    reports, 
    strategy,
    booth_strategy,
    districts,
    comparison, 
    data_quality, 
    search,
    electra,
    candidates,
    chanakya,
    crime_bureau
)
import os
from pathlib import Path
from app.database import Base, engine
import app.models  # ensure models are registered

# Ensure all database tables including booth_worker_assignments are created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UP Electoral Intelligence Platform API",
    description="Evidence-first political & electoral data intelligence system for Uttar Pradesh.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(overview.router)
app.include_router(constituencies.router)
app.include_router(assembly.router)
app.include_router(parties.router)
app.include_router(analytics.router)
app.include_router(strategy.router)
app.include_router(booth_strategy.router)
app.include_router(districts.router)
app.include_router(comparison.router)
app.include_router(data_quality.router)
app.include_router(search.router)
app.include_router(ai_assistant.router)
app.include_router(electra.router)
app.include_router(importer.router)
app.include_router(sources.router)
app.include_router(reports.router)
app.include_router(candidates.router)
app.include_router(chanakya.router)
app.include_router(crime_bureau.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "UP Election Intelligence Platform",
        "scope": "Uttar Pradesh (80 Lok Sabha, 403 Vidhan Sabha)",
        "version": "1.0.0"
    }

# Mount static GeoJSON
geojson_dir = Path(__file__).resolve().parent.parent.parent / "data" / "geojson"
if geojson_dir.exists():
    app.mount("/api/static/geojson", StaticFiles(directory=str(geojson_dir)), name="geojson")

@app.get("/guide")
async def serve_guide():
    guide_path = Path(__file__).resolve().parent.parent.parent / "UP_Election_Intelligence_Platform_Master_Guide.html"
    return FileResponse(guide_path, media_type="text/html")

@app.get("/guide-pdf")
async def serve_guide_pdf():
    pdf_path = Path(__file__).resolve().parent.parent.parent / "UP_Election_Intelligence_Platform_Master_Guide.pdf"
    return FileResponse(pdf_path, filename="UP_Election_Intelligence_Platform_Master_Guide.pdf", media_type="application/pdf")

@app.get("/proposal")
async def serve_proposal():
    proposal_path = Path(__file__).resolve().parent.parent.parent / "Koushal_Kumar_Yadav_SP_Mission_2027_Proposal.html"
    return FileResponse(proposal_path, media_type="text/html")

@app.get("/proposal-pdf")
async def serve_proposal_pdf():
    pdf_path = Path(__file__).resolve().parent.parent.parent / "Koushal_Kumar_Yadav_SP_Mission_2027_Proposal.pdf"
    return FileResponse(pdf_path, filename="Koushal_Kumar_Yadav_SP_Mission_2027_Proposal.pdf", media_type="application/pdf")

@app.get("/brief")
async def serve_brief():
    brief_path = Path(__file__).resolve().parent.parent.parent / "SP_War_Room_Mobile_Brief.html"
    return FileResponse(brief_path, media_type="text/html")

@app.get("/brief-pdf")
async def serve_brief_pdf():
    brief_pdf_path = Path(__file__).resolve().parent.parent.parent / "SP_War_Room_Mobile_Brief.pdf"
    return FileResponse(brief_pdf_path, filename="Koushal_Kumar_Yadav_SP_War_Room_Platform_Brief.pdf", media_type="application/pdf")

# Mount production built frontend if available
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    # Catch-all for SPA client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
