# Panduan Setup Supabase — Petugas Penagihan

Aplikasi **sudah berfungsi tanpa Supabase** (data petugas tersimpan di
localStorage browser). Ikuti panduan ini hanya bila Anda ingin data petugas
disimpan di cloud dan dipakai bersama antar perangkat.

## Langkah 1 — Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) dan login.
2. Klik **New Project**, pilih organisation, isi nama & password database.
3. Tunggu provisioning selesai.

## Langkah 2 — Buat Tabel

1. Buka **SQL Editor** di dashboard Supabase.
2. Salin seluruh isi [`scripts/init-supabase.sql`](./scripts/init-supabase.sql)
   dan jalankan (Run).
3. Skrip tersebut:
   - membuat tabel `mitra` dan `petugas_penagihan`,
   - menghapus tabel `debitur` bila ada dari versi lama (modul debitur sudah
     dihapus dari aplikasi),
   - mengaktifkan RLS beserta kebijakan baca/tambah/ubah untuk petugas —
     **tanpa kebijakan ini, tombol Simpan akan ditolak Supabase**.

## Langkah 3 — Ambil Kredensial

Buka **Project Settings → API** dan salin:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Langkah 4 — Buat File `.env`

Di folder `vehicle-bastm-letter-generator (1)`, buat file `.env`:

```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> File `.env` diabaikan oleh Git (`.gitignore`) — jangan commit kredensial.

## Langkah 5 — Jalankan

```bash
npm install
npm run dev
```

Buka modul **Surat Tugas** → **+ Tambah** petugas. Dialog akan menampilkan
indikator “Tersimpan ke database Supabase” bila koneksi berhasil.

## Deploy ke Vercel

1. Push repo ke GitHub lalu import di [vercel.com](https://vercel.com)
   (konfigurasi build sudah tersedia di `vercel.json`).
2. Pada **Project Settings → Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy.

## Skema Database

### `petugas_penagihan`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | SERIAL PK | ID otomatis |
| nama | VARCHAR(255) NOT NULL | Nama petugas |
| nik | VARCHAR(16) UNIQUE NOT NULL | NIK 16 digit (digenerate aplikasi) |
| jabatan | VARCHAR(100) | Default `Petugas Penagihan` |
| mitra_id | INTEGER FK → mitra(id) | Opsional |
| aktif | BOOLEAN | Soft delete (`false` = tidak tampil) |
| created_at | TIMESTAMPTZ | Waktu dibuat |

### `mitra`

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| id | SERIAL PK | ID otomatis |
| nama | VARCHAR(255) NOT NULL | Nama mitra |
| legalitas | VARCHAR(100) | Nomor legalitas |
| alamat | TEXT | Alamat |
| pic | VARCHAR(255) | Penanggung jawab |
| created_at | TIMESTAMPTZ | Waktu dibuat |

## Keamanan (RLS)

Kebijakan default mengizinkan anon key membaca/menambah/mengubah petugas —
cukup untuk pemakaian internal. Untuk produksi yang lebih ketat, ganti
kebijakan tersebut dengan `auth.uid() IS NOT NULL` dan gunakan Supabase Auth
(lihat komentar di `scripts/init-supabase.sql`).

## Troubleshooting

| Gejala | Penyebab & Solusi |
| --- | --- |
| “Database menolak penyimpanan (RLS)” | Jalankan ulang `scripts/init-supabase.sql` — kebijakan RLS belum dibuat. |
| “Tidak dapat terhubung ke database Supabase” | Cek `.env` / environment variables dan koneksi internet. Data otomatis disimpan lokal sebagai cadangan. |
| Data petugas hilang setelah pindah browser | Mode lokal bersifat per-browser. Gunakan Supabase agar data terpusat. |
