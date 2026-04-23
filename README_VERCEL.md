# 🚀 Wareb V2 - Panduan Deployment Vercel

Aplikasi Wareb V2 telah dioptimalkan untuk performa maksimal di platform **Vercel**. Berikut adalah langkah-langkah untuk melakukan deployment dan konfigurasi yang diperlukan.

## 📋 Prasyarat
1. Akun [Vercel](https://vercel.com).
2. Database PostgreSQL (disarankan menggunakan [Vercel Postgres](https://vercel.com/storage/postgres) atau [Supabase](https://supabase.com)).
3. Google Cloud Console Project (untuk Google OAuth).

## 🔑 Environment Variables (Wajib)
Pastikan Anda menambahkan variabel berikut di Dashboard Vercel (Settings > Environment Variables):

| Nama Variabel | Deskripsi | Contoh Nilai |
| :--- | :--- | :--- |
| `DATABASE_URL` | Koneksi database Prisma | `postgres://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | String acak untuk enkripsi sesi | `gunakan-perintah-openssl-rand-hex-32` |
| `NEXTAUTH_URL` | URL publik aplikasi Anda | `https://nama-proyek.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID dari Google Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret dari Google Console | `GOCSPX-xxx` |

## 🛠️ Optimasi yang Telah Diterapkan
Aplikasi ini sudah dilengkapi dengan konfigurasi otomatis untuk:
- **Keamanan**: Header HTTP ketat di `vercel.json` (CSP, HSTS, XSS Protection).
- **SEO**: 
  - Dynamic `sitemap.xml` yang mengindeks produk secara otomatis.
  - `robots.txt` yang dikonfigurasi untuk privasi admin.
- **Monitoring**: 
  - **Vercel Analytics** terintegrasi untuk melihat trafik pengunjung.
  - **Speed Insights** untuk memantau performa Core Web Vitals.
- **Middleware**: Proteksi rute admin yang efisien tanpa loop redirect.
- **Image Optimization**: Penggunaan Vercel Image Optimization untuk loading gambar lebih cepat.

## 🚀 Cara Deploy
1. **Push ke GitHub/GitLab/Bitbucket**:
   Pastikan folder `.next` tidak ikut di-push (sudah ada di `.gitignore`).
2. **Import ke Vercel**:
   Pilih repository Anda di dashboard Vercel.
3. **Konfigurasi Build**:
   Vercel akan mendeteksi Next.js secara otomatis. Build command akan menjalankan `prisma generate && next build`.
4. **Deploy!** 🎊

## 📝 Catatan Penting
- **Prisma**: Setiap kali ada perubahan skema database, pastikan menjalankan `npx prisma db push` secara lokal atau melalui CI/CD.
- **Setup Pertama**: Setelah deploy berhasil, kunjungi `/setup` untuk membuat toko pertama Anda jika belum ada di database.

---
*Dibuat dengan ❤️ untuk stabilitas Wareb Platform.*
