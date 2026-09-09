# Database Integration Guide — Petugas Penagihan

## Ringkasan

Lapisan data petugas penagihan ("team penagih") ditangani oleh
[`src/lib/supabase.ts`](./src/lib/supabase.ts) dengan dua mode penyimpanan:

```
┌────────────────────────┐
│  PetugasDropdown (UI)  │  src/components/ui/PetugasDropdown.tsx
└───────────┬────────────┘
            │ addPetugas / fetchPetugasPenagihan / updatePetugas / deletePetugas
┌───────────▼────────────┐     ┌──────────────────────┐
│   src/lib/supabase.ts  │────▶│ Supabase (bila .env) │
│   (lapisan data)       │     └──────────────────────┘
│                        │────▶┌──────────────────────┐
│                        │     │ localStorage browser │ ← fallback otomatis
└────────────────────────┘     └──────────────────────┘
```

### Perbaikan penting (riwayat)

Sebelumnya klien Supabase dibuat dengan kredensial placeholder
(`https://YOUR_PROJECT_REF.supabase.co`) ketika `.env` belum diisi, sehingga
**setiap penyimpanan petugas gagal secara diam-diam** — dialog tambah petugas
tidak bereaksi sama sekali. Sekarang:

1. Tanpa `.env`, data otomatis disimpan ke `localStorage` → selalu berhasil.
2. Dengan `.env`, data disimpan ke Supabase; bila Supabase gagal (jaringan /
   RLS), operasi otomatis beralih ke `localStorage` supaya data tidak hilang.
3. Semua kegagalan ditampilkan sebagai pesan error di dialog — tidak pernah
   gagal senyap.
4. NIK duplikat ditolak dengan pesan error, tanpa regenerasi atau fallback lokal.

## Fitur

### Petugas Penagihan
- ✅ NIK 16 digit diisi manual dan divalidasi; duplikat ditolak.
- ✅ Dropdown dengan pencarian nama/NIK.
- ✅ Tambah petugas dari form Surat Tugas dengan umpan balik status/error.
- ✅ Soft delete (`aktif = false`) pada `deletePetugas`.
- ✅ Cadangan lokal otomatis dari data Supabase terakhir (merge berdasarkan NIK).

## File Terkait

| File | Peran |
| --- | --- |
| `src/lib/supabase.ts` | Lapisan data: deteksi konfigurasi, penyimpanan lokal, Supabase + fallback, validasi NIK |
| `src/components/ui/PetugasDropdown.tsx` | UI dropdown + dialog tambah petugas (status simpan & pesan error) |
| `scripts/init-supabase.sql` | Skema & kebijakan RLS Supabase |
| `.env` (tidak di-commit) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

## Kontrak API

```ts
fetchPetugasPenagihan(): Promise<PetugasPenagihan[]>   // daftar aktif, urut nama
addPetugas(input): Promise<PetugasPenagihan>           // melempar Error bila gagal
updatePetugas(id, patch): Promise<PetugasPenagihan>    // melempar Error bila gagal
deletePetugas(id): Promise<void>                       // soft delete
getStorageMode(): 'supabase' | 'local'                 // indikator mode aktif
isSupabaseConfigured: boolean
```

## Perilaku Penyimpanan Lokal

- Kunci localStorage: `bast-petugas-v1`.
- Saat pertama dipakai tanpa Supabase, diisi satu data contoh
  (DIAN FITRIANINGSIH) agar dropdown tidak kosong.
- Saat Supabase aktif, setiap fetch berhasil juga menulis cadangan lokal
  (merge berdasarkan NIK) sehingga data tetap tersedia saat offline.

## Catatan Modul Debitur

Modul **Manajemen Debitur** beserta tabel `debitur` telah dihapus dari
aplikasi. Data debitur yang dicetak pada surat (nama, alamat, no. perjanjian,
KTP, dll.) diisi langsung di halaman **Isian Surat** — satu form untuk semua
dokumen.
