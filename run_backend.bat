@echo off
echo Starting Refrielectricos Backend...
uvicorn backend.main:app --reload
pause
