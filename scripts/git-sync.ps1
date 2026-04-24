# Git-Sync Automation Script for Rahman
# Melakukan loop: Add -> Commit -> Push setiap 5 menit (300 detik)
# Untuk menghindari spamming build Vercel.

$interval = 10 # Detik (Mode Google Drive)

Write-Host "🚀 Memulai Git-Sync: MODE GOOGLE DRIVE" -ForegroundColor Cyan
Write-Host "Otomatisasi AKTIF. Setiap perubahan akan di-commit setiap $interval detik." -ForegroundColor Yellow

while ($true) {
    $changes = git status --porcelain
    if ($changes) {
        $currentTime = Get-Date -Format 'HH:mm:ss'
        $firstFile = ($changes[0] -split ' ')[-1]
        
        git add .
        git commit -m "Drive-sync: $currentTime ($firstFile)" --quiet
        
        Write-Host "☁️ Auto-commit berhasil pada $currentTime ($firstFile)" -ForegroundColor Green
    }
    Start-Sleep -Seconds $interval
}
