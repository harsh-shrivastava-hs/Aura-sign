@echo off
title AuraSign - Real-Time Sign Language Translator
echo ===================================================
echo Starting AuraSign Local Server...
echo ===================================================

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3 or ensure it is added to your environment variables.
    pause
    exit /b 1
)

python server.py
pause
