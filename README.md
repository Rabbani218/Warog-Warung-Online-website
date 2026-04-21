# Wareb Platform V2 (Next.js App Router)

Platform e-commerce POS multi-portal untuk Warung Website V1 yang di-scale ke arsitektur Next.js 14+ (App Router), siap deploy ke Vercel via GitHub.

## Arsitektur

- Framework: Next.js 14+ (App Router)
- ORM: Prisma + MySQL
- Auth: NextAuth.js (Credentials lokal)
- Route Groups:
  - `(admin)` untuk portal penjual/pemilik
  - `(client)` untuk portal publik SEO-friendly

## Modul Portal

### 1) Admin Portal (`/admin`)

- Login/registrasi lokal (NextAuth + Credentials).
- Smart Dashboard:
  - Upload `.xlsx` / `.csv` via komponen parser (`xlsx`).
  - API Auto-Analysis: tren penjualan bulanan + menu terlaris.
- Product & Ads Management:
  - CRUD produk (`Menu`) dan banner iklan.
- Payment Gateway Settings:
  - Simpan nomor rekening dan API key simulasi.
- QR Generator:
  - Generate QR URL meja dan URL toko, bisa di-download.

### 2) Client Portal (`/`)

- UI e-commerce gaya marketplace lokal (Shopee/Tokopedia inspired + Warteg modern).
- Promo Carousel (banner aktif).
- Product grid responsif.
- Floating cart dinamis.
- Checkout flow:
  - Membentuk invoice digital.
  - Otomatis membuat KOT untuk sistem dapur sisi admin.

## BOM & Stock Logic

Logika BOM tetap dipertahankan dalam model `Menu -> Recipe -> Ingredient`.

Saat checkout:
1. Sistem menghitung kebutuhan bahan dari `recipes`.
2. Validasi stok tiap bahan.
3. Jika stok bahan akan negatif: transaksi dibatalkan dengan pesan `Bahan baku [Nama] habis`.
4. Jika valid: stok dikurangi, order `PAID`, invoice dibuat, dan KOT di-generate.

## Prisma Models Utama

- `User` (Role: `ADMIN`, `CLIENT`)
- `Store` (profil toko + payment settings)
- `Banner`
- `Menu`
- `Ingredient`
- `Recipe` (pivot BOM)
- `Order`
- `OrderDetail`
- `Invoice`
- `KOTicket`
- `SalesHistory` (data import Excel)

Lihat detail di `prisma/schema.prisma`.

## Setup Lokal

1. Install dependency:

```bash
npm install
```

2. Salin env:

```bash
cp .env.example .env
```

3. Generate Prisma client dan push schema:

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed data awal:

```bash
npm run seed
```

5. Jalankan development server:

```bash
npm run dev
```

## Endpoint Kunci

- Public Store Data: `GET /api/store`
- Auth Register: `POST /api/auth/register`
- NextAuth Credentials: `POST /api/auth/[...nextauth]`
- Upload & Analyze Sales: `POST /api/admin/analyze-sales`
- Product CRUD: `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- Banner CRUD: `GET/POST /api/admin/banners`, `PUT/DELETE /api/admin/banners/:id`
- Payment Settings: `GET/PUT /api/admin/payment-settings`
- Checkout + Invoice + KOT: `POST /api/client/checkout`

## Deploy ke Vercel

### Environment Variables

Tambahkan di Vercel Project Settings:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

> Pastikan `NEXTAUTH_URL` sama dengan domain produksi Vercel Anda agar Google OAuth callback bekerja.

### Build Settings

- Install Command: `npm install`
- Build Command: `npm run build`
- Output: Next.js default

Konfigurasi tambahan tersedia di `vercel.json`.

## Akun Seed Demo

- Email: `owner@wareb.local`
- Password: `wareb12345`

