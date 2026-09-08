# Implementation Summary: Perbaikan Database Petugas Penagihan

## Ringkasan

Perbaikan sistem penyimpanan data **Petugas Penagihan (team penagih)** dan
**penghapusan modul Debitur**.

## Masalah yang Diperbaiki

### 1. Menambah team penagih tidak bisa save
**Akar masalah:** `src/lib/supabase.ts` membuat klien Supabase dengan
kredensial placeholder (`https://YOUR_PROJECT_REF.supabase.co`) karena file
`.env` belum ada. Akibatnya semua operasi database gagal dan
`addPetugas()` mengembalikan `null` secara diam-diam — dialog "Tambah
Petugas Penagihan" tidak melakukan apa-apa.

**Solusi (local-first storage):**
- Tanpa konfigurasi apa pun, data petugas kini tersimpan permanen di
  `localStorage` browser (`bast-petugas-v1`) — menyimpan selalu berhasil.
- Bila `.env` Supabase terisi, data tersimpan ke Supabase; bila Supabase
  gagal dihubungi (jaringan/RLS), operasi otomatis beralih ke penyimpanan
  lokal untuk sisa sesi sehingga data tidak hilang.
- Kegagalan kini ditampilkan sebagai pesan error berbahasa Indonesia di
  dialog (tidak pernah gagal senyap), plus indikator "menyimpan…" saat save.
- NIK 16 digit dijamin unik: bentrok NIK ditangani dengan regenerasi
  otomatis (maks. 3 percobaan di Supabase, loop unik di lokal).
- Berhasil menyimpan → dialog tertutup, petugas baru langsung terpilih &
  NIK terisi otomatis di form Surat Tugas.

### 2. Modul Debitur dihapus
Tidak ada data debitur yang benar-benar tersimpan (database tidak pernah
terkonfigurasi), sehingga modul dihapus seluruhnya:

- `src/modules/DebiturModule.tsx` — dihapus
- `src/components/forms/DebiturForm.tsx` — dihapus
- `src/App.tsx` — import & route `debitur` dihapus
- `src/lib/modules.ts` — entri modul `debitur` dihapus dari `ModuleId`,
  `MODULES`, dan `MODULE_BY_ID`
- `src/lib/supabase.ts` — seluruh CRUD debitur dihapus
- `scripts/init-supabase.sql` — tabel `debitur` di-drop & definisinya dihapus
- Dokumentasi diperbarui

Data debitur untuk surat tetap diisi di modul **Data Umum** seperti biasa
(field `namaDebitur`, `alamat`, `noPerjanjian`, dll. tidak berubah).

## File yang Diubah

| File | Perubahan |
| --- | --- |
| `src/lib/supabase.ts` | Ditulis ulang: deteksi konfigurasi, penyimpanan lokal, Supabase + fallback otomatis, NIK unik, pesan error jelas |
| `src/components/ui/PetugasDropdown.tsx` | Status menyimpan, pesan error di dialog, indikator mode penyimpanan, Enter untuk simpan, muat ulang saat gagal |
| `src/App.tsx` | Route & import modul debitur dihapus |
| `src/lib/modules.ts` | Modul debitur dihapus dari daftar modul |
| `src/modules/DebiturModule.tsx` | Dihapus |
| `src/components/forms/DebiturForm.tsx` | Dihapus |
| `scripts/init-supabase.sql` | Tabel debitur dihapus, RLS aktif + kebijakan agar INSERT tidak ditolak |
| `src/vite-env.d.ts` | Baru — tipe `import.meta.env` |
| `README_SUPABASE.md`, `SUPABASE_SETUP.md`, `DATABASE_INTEGRATION.md` | Ditulis ulang sesuai arsitektur baru |

## Setup (Opsional) — Supabase

Aplikasi berjalan tanpa setup. Untuk data terpusat lintas perangkat, lihat
`vehicle-bastm-letter-generator (1)/SUPABASE_SETUP.md`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Verifikasi

- `npm run build` berhasil tanpa error.
- Menambah petugas baru → tersimpan, muncul di dropdown, tetap ada setelah
  reload halaman (mode lokal).
- Sidebar & Home tidak lagi menampilkan modul debitur; pengguna lama dengan
  route tersimpan `debitur` otomatis diarahkan ke Home.
