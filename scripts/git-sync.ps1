# Git-Sync Automation Script for Rahman
# Melakukan loop: Add -> Commit -> Push setiap 5 menit (300 detik)
# Untuk menghindari spamming build Vercel.

$interval = 300 # Detik (5 menit)

Write-Host "🚀 Memulai Git Auto-Sync..." -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk mematikan otomatisasi ini." -ForegroundColor Yellow

while ($true) {
    $changes = git status --porcelain
    if ($changes) {
        $currentTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
        Write-Host "📦 Perubahan terdeteksi pada $currentTime" -ForegroundColor Green
        
        # Ambil nama file pertama yang berubah untuk pesan commit
        $firstFile = ($changes[0] -split ' ')[-1]
        $commitMsg = "Auto-sync: $currentTime ($firstFile)"
        
        git add .
        git commit -m "$commitMsg"
        Write-Host "✅ Commit lokal berhasil: $commitMsg" -ForegroundColor Blue
        Write-Host "ℹ️ Auto-Push dinonaktifkan untuk menghemat kuota Vercel. Lakukan 'git push' manual jika sudah siap." -ForegroundColor Gray
        Write-Host "Menunggu $interval detik..." -ForegroundColor Gray
    }
    Start-Sleep -Seconds $interval
}
