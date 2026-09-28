import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_ECI_DIR = BASE_DIR
DB_PATH = DATA_DIR / "up_election.db"
GEOJSON_PATH = DATA_DIR / "geojson" / "up_pc_boundaries.geojson"

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

# Official source identifiers
DATA_VERSION = "UP-LS-2024-ECI-v1"
STATE_NAME = "Uttar Pradesh"
TOTAL_UP_PCS = 80
TOTAL_UP_ACS = 403
TOTAL_UP_DISTRICTS = 75
