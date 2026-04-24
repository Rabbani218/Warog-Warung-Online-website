# Git-Sync Automation Script for Rahman
# Melakukan loop: Add -> Commit -> Push setiap 5 menit (300 detik)
# Untuk menghindari spamming build Vercel.

$interval = 300 # Detik (5 menit)

Write-Host "🚀 Memulai Git Auto-Sync..." -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk mematikan otomatisasi ini." -ForegroundColor Yellow

while ($true) {
    $changes = git status --porcelain
    if ($changes) {
        Write-Host "📦 Perubahan terdeteksi pada $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
        git add .
        git commit -m "Auto-update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Write-Host "📤 Mendorong ke GitHub..." -ForegroundColor Blue
        git push origin main
        Write-Host "✅ Berhasil disinkronkan. Menunggu $interval detik..." -ForegroundColor Gray
    } else {
        # Tidak ada perubahan, diam saja
    }
    Start-Sleep -Seconds $interval
}
