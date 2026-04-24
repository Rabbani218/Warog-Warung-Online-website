@echo off
TITLE Git Auto-Sync for Rahman
echo Memulai Git Auto-Sync Automation...
powershell -ExecutionPolicy Bypass -File "%~dp0git-sync.ps1"
pause
