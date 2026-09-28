@echo off
title UP Election Intelligence Platform
cd /d "%~dp0"
echo =================================================================
echo       UP ELECTION INTELLIGENCE PLATFORM (2024 LOK SABHA)
echo =================================================================
echo Starting platform on http://localhost:8000 ...
python run_platform.py
pause
