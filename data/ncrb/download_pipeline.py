# -*- coding: utf-8 -*-
"""
E:/eci/data/ncrb/download_pipeline.py
Official NCRB PDF & Data Downloader.
Acquires official Crime in India reports and tables from ncrb.gov.in & official sources.
Follows Section 31: DOWNLOAD THE ACTUAL NCRB REPORTS.
"""

import os
import sys
import time
import requests
from pathlib import Path

DEST_DIR = Path("E:/eci/data/ncrb/raw_reports")
DEST_DIR.mkdir(parents=True, exist_ok=True)

OFFICIAL_REPORTS = [
    {
        "year": 2022,
        "title": "Crime in India 2022 - State/UT Highlights (09-.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/files/09-.pdf",
        "filename": "NCRB_CII_2022_State_Highlights.pdf"
    },
    {
        "year": 2022,
        "title": "Crime in India 2022 - Historical IPC Crimes 1981-2022 (08-1981-2022.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/files/08-1981-2022.pdf",
        "filename": "NCRB_CII_1981_2022_Historical_IPC.pdf"
    },
    {
        "year": 2022,
        "title": "Crime in India 2022 - Megacities Statistics (10-20.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/files/10-20.pdf",
        "filename": "NCRB_CII_2022_Megacities.pdf"
    },
    {
        "year": 2022,
        "title": "Crime in India 2022 - Estimated Population (06-.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/files/06-.pdf",
        "filename": "NCRB_CII_2022_Population.pdf"
    },
    {
        "year": 2021,
        "title": "Crime in India 2021 - State/UT Snapshot (9CII2021H.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/16844780179CII2021H.pdf",
        "filename": "NCRB_CII_2021_State_Highlights.pdf"
    },
    {
        "year": 2021,
        "title": "Crime in India 2021 - Historical Trend 1980-2021 (8CII2021H.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/16844779708CII2021H.pdf",
        "filename": "NCRB_CII_1980_2021_Historical_IPC.pdf"
    },
    {
        "year": 2021,
        "title": "Crime in India 2021 - Megacities Statistics (10CII2021H.pdf)",
        "url": "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/168447808210CII2021H.pdf",
        "filename": "NCRB_CII_2021_Megacities.pdf"
    },
    {
        "year": 2020,
        "title": "Crime in India 2020 - Official Report Publication",
        "url": "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/16844792341CII2020H.pdf",
        "filename": "NCRB_CII_2020_Report.pdf"
    },
    {
        "year": 2019,
        "title": "Crime in India 2019 - Official Report Publication",
        "url": "https://www.ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/16844808331CII2019H---2019.pdf",
        "filename": "NCRB_CII_2019_Report.pdf"
    }
]

def download_file(item):
    dest = DEST_DIR / item["filename"]
    if dest.exists() and dest.stat().st_size > 10000:
        print(f"[EXISTS] {item['filename']} ({dest.stat().st_size / 1024:.1f} KB)")
        return True

    print(f"[DOWNLOADING] {item['title']} from {item['url']}...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }

    try:
        r = requests.get(item["url"], headers=headers, stream=True, timeout=45)
        if r.status_code == 200:
            with open(dest, "wb") as f:
                for chunk in r.iter_content(chunk_size=65536):
                    if chunk:
                        f.write(chunk)
            print(f"[SUCCESS] Saved {item['filename']} ({dest.stat().st_size / 1024:.1f} KB)")
            return True
        else:
            print(f"[FAILED] HTTP {r.status_code} for {item['url']}")
            return False
    except Exception as e:
        print(f"[ERROR] Downloading {item['title']}: {e}")
        return False

def run_download_all():
    success_count = 0
    for item in OFFICIAL_REPORTS:
        if download_file(item):
            success_count += 1
        time.sleep(1) # respectful pacing
    print(f"\nDownload summary: {success_count} / {len(OFFICIAL_REPORTS)} official NCRB reports preserved on disk.")

if __name__ == "__main__":
    run_download_all()
