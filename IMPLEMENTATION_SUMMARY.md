# Implementation Summary

## Terbaru: Semua Isian Surat Digabung Jadi Satu Form

### Masalah
Isian surat terpecah per dokumen (Data Umum, Surat Tugas, Surat Penyerahan,
BAST, Lampiran) dan banyak field diisi dua kali untuk data yang sama.

### Solusi
Satu form isian (`src/components/forms/IsianForm.tsx`) memuat seluruh isian
semua dokumen, dikelompokkan per topik (Debitur, Perjanjian & Tagihan,
Kendaraan, Petugas, Nomor/Tanggal, Kreditur & Mitra, Perusahaan & Kop,
Checklist, Opsi & TTD, Lampiran). Dokumen tinggal dipilih lewat tab di panel
pratinjau untuk dicetak sendiri-sendiri atau sekaligus.

### Nominal rupiah (Angsuran, Total Angsuran, Denda)
- Isian `Angsuran / Total` dipecah jadi dua baris: **Angsuran** (`st.angsuran`)
  dan **Total Angsuran** (`st.totalAngsuran`); `st.angsuranNilai` dihapus.
- Angsuran, Total Angsuran, dan Denda memakai komponen `RupiahInput`
  (`src/components/ui.tsx`): yang disimpan **angka saja**, tampilan otomatis
  berpemisah ribuan (`652000` → `652.000`) dengan prefiks `Rp`.
- Surat Tugas mencetak `Rp. 652.000 / Rp. 11.736.000` dan `Rp. 169.285.000`
  lewat helper `rupiah()` / `ribuan()` / `digitsOnly()` di `src/lib/format.ts`.
- Data lama dimigrasikan: `"Rp. 652.000 / Rp. 11.736.000"` dipecah ke dua
  field, dan `denda` lama dibersihkan jadi angka.

Isian ganda yang digabung:

| Isian lama (duplikat) | Sekarang |
| --- | --- |
| `st.nasabahNama` (Surat Tugas) + `namaDebitur` | `namaDebitur` |
| `st.merkType` + `merekType` | `merekType` |
| `st.noPolisi` + `noPolisi` | `noPolisi` |
| `st.noKontrak` + `noPerjanjian` | `noPerjanjian` |
| `st.perusahaan` + `mitraNama` | `mitraNama` |
| `noSuratTugas` (kaki BAST) + `st.nomor` | `st.nomor` |
| `tanggalBast` + `st.tanggalSuratISO` | `tanggalISO` |
| `st.nasabahAlamat` | `alamatDebitur` |
| `st.angsuranNilai` (1 isian) | `st.angsuran` + `st.totalAngsuran` |

Data lama di `localStorage` / Google Drive otomatis dimigrasikan
(`migrate()` di `src/App.tsx`): bila isian bersama kosong, nilai dari field
lama dipakai.

### Struktur baru
- Halaman: **Beranda** dan **Isian Surat** (form kiri + pratinjau & cetak kanan).
- Dihapus: `ModuleLayout.tsx`, modul `DataUmum/SuratTugas/Penyerahan/Bast/Lampiran`,
  form `DataUmumForm/SuratTugasForm/PenyerahanForm/BastForm/LampiranForm`.
- Baru: `modules/IsianModule.tsx`, `components/IsianLayout.tsx`,
  `components/forms/IsianForm.tsx`, `components/LampiranUploads.tsx`.
- `lib/modules.ts` kini berisi daftar dokumen (`DOCS`) + bagian form (`SECTIONS`);
  validasi menandai dokumen yang terdampak (`docs`), bukan modul.

### Verifikasi
- `npm run typecheck` bersih, `npm run build` sukses, `npm test` 16/16 lolos
  (termasuk regresi baru `tests/single-form.test.mjs`: tidak ada field yang
  diisi dua kali & isian lama sudah hilang) plus `tests/rupiah.test.mjs`
  (format rupiah & hasil cetaknya di Surat Tugas).
- `gas/verify-polyfill.mjs` lolos; `gas/Index.html` di-build ulang.

---

# Perbaikan Database Petugas Penagihan

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

Data debitur untuk surat diisi di halaman **Isian Surat** seperti biasa
(field `namaDebitur`, `alamatDebitur`, `noPerjanjian`, dll.).

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
