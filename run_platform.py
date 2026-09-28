import os
import sys
from pathlib import Path
import time
import threading
import webbrowser

# Set up paths so it works no matter where the command is executed from
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

# Ensure both root_dir and backend_dir are at the front of sys.path
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Change current working directory to backend_dir
os.chdir(str(backend_dir))

# Now import app directly
from app.main import app
import uvicorn

def open_browser():
    time.sleep(1.5)
    try:
        webbrowser.open("http://localhost:8000")
    except Exception:
        pass

if __name__ == "__main__":
    print("=================================================================")
    print("   UP ELECTION INTELLIGENCE PLATFORM (1991–2024 & ROAD TO 2027)")
    print("       Evidence-Based Electoral Intelligence for Uttar Pradesh")
    print("=================================================================")
    print("Serving Unified Production Platform at:")
    print(">>> http://localhost:8000")
    print("Swagger API Documentation: http://localhost:8000/docs")
    print("Active Features: Road to 2027 (Mission 202+), Delimitation History,")
    print("                 Multi-Election Switcher (2014-2024), Ask Election AI")
    print("Press CTRL+C to stop.")
    print("=================================================================")
    
    # Auto open browser in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
