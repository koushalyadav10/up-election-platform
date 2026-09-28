"""
Generates complete, verified, comprehensive Ground Intelligence and Caste Demographic Matrices
for all 75 Districts of Uttar Pradesh.
Outputs:
1. E:/eci/data/district_ground_intelligence.json
2. E:/eci/data/up_caste_demographics.json
"""

import json
import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent

# Connect to database to get official AC and PC lists for all 75 districts
conn = sqlite3.connect(DATA_DIR / "up_election.db")
cur = conn.cursor()

# Get all 75 districts
cur.execute("SELECT id, name FROM districts ORDER BY name")
db_districts = cur.fetchall()

# Get ACs per district
cur.execute("""
    SELECT d.name, ac.ac_no, ac.name, ac.category 
    FROM assembly_constituencies ac
    JOIN districts d ON ac.district_id = d.id
    ORDER BY d.name, ac.ac_no
""")
acs_by_dist = {}
for dname, acno, acname, cat in cur.fetchall():
    acs_by_dist.setdefault(dname, []).append({
        "ac_no": acno,
        "ac_name": acname,
        "category": cat or "GEN"
    })

# Get historical intel (PCs per district and incumbent MLA/MP info)
cur.execute("""
    SELECT DISTINCT district, pc_no, pc_name, winner_2022_party, winner_2022_candidate, 
                    lead_2024_party, lead_2024_candidate, ac_name, ac_no
    FROM ac_historical_intelligence
""")
hist_rows = cur.fetchall()
pcs_by_dist = {}
incumbents_by_dist = {}
for dist, pcno, pcname, w_pty, w_cand, l_pty, l_cand, acname, acno in hist_rows:
    if not dist:
        continue
    # find matching district
    matched_d = None
    for d_id, d_name in db_districts:
        if d_name.lower() in dist.lower() or dist.lower() in d_name.lower():
            matched_d = d_name
            break
    if not matched_d:
        matched_d = dist
    
    if pcname and pcno:
        pcs_by_dist.setdefault(matched_d, set()).add((pcno, pcname))
        
    incumbents_by_dist.setdefault(matched_d, []).append({
        "ac_no": acno,
        "ac_name": acname,
        "mla_2022_party": w_pty,
        "mla_2022_name": w_cand,
        "lead_2024_party": l_pty,
        "lead_2024_candidate": l_cand
    })

conn.close()

print(f"Loaded {len(db_districts)} districts, {len(acs_by_dist)} AC mappings, {len(pcs_by_dist)} PC mappings.")
