# UP Election Intelligence Platform

A high-credibility, evidence-first political and electoral intelligence platform dedicated to **Uttar Pradesh, India**.

Built entirely inside `E:\eci` using certified official Election Commission of India (ECI) 2024 Lok Sabha datasets.

---

## Key Highlights
* **100% Certified ECI Data**: Direct ingestion of all 80 Parliamentary Constituencies and 931 candidates from `33-Constituency-Wise-Detailed-Result.xls`.
* **Full Assembly Segment Mapping**: All 403 Vidhan Sabha constituencies mapped from `34-Details-Of-Assembly-Segment-Of-PC.xls`.
* **Verified Party Tally**: SP (37), BJP (33), INC (6), RLD (2), ADAL (1), ASPKR (1) across 15.44 Crore Electors and 8.80 Crore Votes.
* **Interactive UP Map**: Leaflet vector choropleth map across all 80 constituencies with multi-metric toggles (Party, Margin Bands, Turnout %).
* **Constituency Intelligence Dossiers**: Hero stats, Herfindahl vote concentration index (HHI), assembly segment breakdowns, candidate performance tables, and print-ready dossier generator.
* **Factual AI Research Assistant**: Natural language query interface backed by SQL database retrieval with zero hallucinations and full formula/source transparency.
* **Scenario Lab**: Mathematical swing simulator with mandatory simulation disclaimer.
* **Admin Excel Ingestion**: File upload, column detection, mapping, and mathematical validation engine.

---

## How to Run

### Option 1: Unified Platform (Recommended)
Double-click `start.bat` or run:
```bash
python run_platform.py
```
Open **http://localhost:8000** in your web browser.

### Option 2: Development Mode
Run the backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Run the frontend:
```bash
cd frontend
npm.cmd run dev
```
Open **http://localhost:5173**.
