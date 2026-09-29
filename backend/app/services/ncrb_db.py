# -*- coding: utf-8 -*-
"""
E:/eci/backend/app/services/ncrb_db.py
Database initializer and manager for NCRB Crime Bureau.
Follows exact schema specified in Section 38 and Section 43.
"""

import sqlite3
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
DB_PATH = BASE_DIR / "data" / "ncrb" / "ncrb_crime.db"
DISTRICT_MAP_PATH = BASE_DIR / "data" / "ncrb" / "district_mapping.json"

def init_ncrb_database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. crime_reports table (Section 38)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crime_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        report_name TEXT NOT NULL,
        source_url TEXT NOT NULL,
        local_file TEXT,
        report_version TEXT DEFAULT 'Official Annual Publication',
        published_by TEXT DEFAULT 'National Crime Records Bureau, Ministry of Home Affairs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. crime_statistics table (Section 38 & 34)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS crime_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        year INTEGER NOT NULL,
        state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
        district TEXT,
        crime_category TEXT NOT NULL,
        crime_subcategory TEXT,
        cases INTEGER,
        crime_rate REAL,
        population INTEGER,
        data_status TEXT NOT NULL DEFAULT 'AVAILABLE',
        table_number TEXT,
        page_number TEXT,
        source_reference TEXT NOT NULL,
        source_file TEXT,
        metric_type TEXT DEFAULT 'official',
        calculation_method TEXT,
        FOREIGN KEY (report_id) REFERENCES crime_reports(id)
    )
    """)

    # 3. investigation_statistics table (Section 38)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investigation_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        year INTEGER NOT NULL,
        state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
        district TEXT,
        crime_category TEXT NOT NULL,
        cases_registered INTEGER,
        cases_investigated INTEGER,
        cases_charge_sheeted INTEGER,
        cases_pending INTEGER,
        cases_disposed INTEGER,
        charge_sheet_rate REAL,
        data_status TEXT NOT NULL DEFAULT 'AVAILABLE',
        source_reference TEXT NOT NULL,
        table_number TEXT,
        page_number TEXT,
        FOREIGN KEY (report_id) REFERENCES crime_reports(id)
    )
    """)

    # 4. trial_statistics table (Section 38)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trial_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        year INTEGER NOT NULL,
        state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
        district TEXT,
        crime_category TEXT NOT NULL,
        cases_for_trial INTEGER,
        cases_decided INTEGER,
        convictions INTEGER,
        acquittals INTEGER,
        other_outcomes INTEGER,
        conviction_rate REAL,
        data_status TEXT NOT NULL DEFAULT 'AVAILABLE',
        source_reference TEXT NOT NULL,
        table_number TEXT,
        page_number TEXT,
        FOREIGN KEY (report_id) REFERENCES crime_reports(id)
    )
    """)

    # 5. district_metadata table (Section 43)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS district_metadata (
        district_id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_name TEXT NOT NULL UNIQUE,
        historical_names TEXT,
        created_year INTEGER,
        renamed_year INTEGER,
        parent_district TEXT,
        boundary_status TEXT NOT NULL
    )
    """)

    # Indexes for rapid retrieval
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crime_year ON crime_statistics(year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crime_cat ON crime_statistics(crime_category)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_crime_dist ON crime_statistics(district)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_inv_year ON investigation_statistics(year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trial_year ON trial_statistics(year)")

    # Load district mapping metadata
    if DISTRICT_MAP_PATH.exists():
        with open(DISTRICT_MAP_PATH, "r", encoding="utf-8") as f:
            dmap = json.load(f)
            for d in dmap.get("districts", []):
                cursor.execute("""
                INSERT OR REPLACE INTO district_metadata 
                (current_name, historical_names, created_year, renamed_year, parent_district, boundary_status)
                VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    d["current_name"],
                    json.dumps(d.get("historical_names", [])),
                    d.get("created_year"),
                    d.get("renamed_year"),
                    d.get("parent_district"),
                    d.get("boundary_status", "STABLE")
                ))

    conn.commit()
    conn.close()
    print("NCRB Database initialized successfully with exact Section 38 & 43 schema.")

if __name__ == "__main__":
    init_ncrb_database()
