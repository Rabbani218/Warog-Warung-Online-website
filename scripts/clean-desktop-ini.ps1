# Script to remove all desktop.ini files from the project and .git directory
# This helps prevent Git corruption on Windows.

Write-Host "Cleaning up desktop.ini files..." -ForegroundColor Cyan

# 1. Remove from project directories
Get-ChildItem -Recurse -Filter "desktop.ini" -Force -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Removing: $($_.FullName)"
    Remove-Item $_.FullName -Force
}

# 2. Remove from .git directory (CRITICAL for fixing corruption)
if (Test-Path ".git") {
    Get-ChildItem -Path ".git" -Recurse -Filter "desktop.ini" -Force -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "Removing from .git: $($_.FullName)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }
}

Write-Host "Cleanup complete! Git should be stable now." -ForegroundColor Green
