# Penyimpanan Data Petugas Penagihan — Generator Surat Tugas

## Fitur

Aplikasi mengelola data **Petugas Penagihan (team penagih)** yang dipakai pada
Surat Tugas:

- Pemilihan petugas lewat dropdown dengan pencarian (nama / NIK).
- Tombol **+ Tambah** untuk menambah petugas baru langsung dari form Surat Tugas.
- **NIK 16 digit digenerate otomatis** dan dijamin unik (bentrok NIK ditangani otomatis).
- Data tersimpan **permanen** dan tetap ada setelah halaman dimuat ulang.

## Mode Penyimpanan

| Mode | Kapan dipakai | Keterangan |
| --- | --- | --- |
| **Lokal** (default) | Supabase belum dikonfigurasi | Data disimpan di `localStorage` browser. Tidak perlu setup apa pun. |
| **Supabase** | File `.env` terisi | Data disimpan di database Supabase sehingga bisa dipakai lintas perangkat. Bila koneksi gagal, aplikasi otomatis beralih ke penyimpanan lokal agar data tidak hilang. |

Indikator mode aktif ditampilkan pada dialog tambah petugas.

## Menambah Petugas

1. Buka modul **Surat Tugas** → bagian **Petugas**.
2. Klik **+ Tambah**, isi nama (wajib) dan jabatan (opsional).
3. Klik **Simpan** — NIK muncul otomatis dan petugas langsung terpilih.

Bila penyimpanan gagal, pesan error yang jelas ditampilkan di dialog — tidak
pernah gagal secara diam-diam.

## Setup Supabase (Opsional)

1. Buat project di [supabase.com](https://supabase.com).
2. Jalankan `scripts/init-supabase.sql` di SQL Editor.
3. Buat file `.env` di folder project:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. Jalankan `npm run dev` (atau deploy ulang ke Vercel dengan environment
   variables yang sama).

Panduan lengkap: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Catatan

- Modul debitur telah **dihapus** dari aplikasi. Data debitur untuk surat
  diisi langsung pada modul **Data Umum** sebagaimana biasa.
- Detail teknis lapisan data: [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md).
