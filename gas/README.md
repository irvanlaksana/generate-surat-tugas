# Generator Surat — Google Apps Script (Web App)

Versi **Google Apps Script** dari aplikasi *Generator Surat* (Surat Tugas,
Surat Penyerahan, BAST Kendaraan, dan Lampiran).

> **Prinsip utama: kode & fitur aplikasi TIDAK berubah.** Aplikasi React yang
> sama (build single-file) disajikan lewat Apps Script; GAS hanya menggantikan
> peran server/penyimpanan. Seluruh modul, formulir, validasi, pratinjau,
> cetak PDF, dan manajemen Petugas Penagihan tetap persis seperti sebelumnya.

---

## Isi folder

| Berkas | Peran |
| --- | --- |
| `Code.gs` | Backend: `doGet()` menyajikan halaman & menyuntikkan data awal; `saveState()` menyimpan data ke Google Drive. |
| `Index.html` | Aplikasi lengkap (hasil build + polyfill penyimpanan). **Dihasilkan otomatis** oleh `build.mjs` — jangan diedit manual. |
| `appsscript.json` | Manifest web app (timezone Asia/Jakarta, V8, akses "Anyone", jalankan sebagai pengguna yang men-deploy). |
| `client-polyfill.js` | Polyfill `localStorage` → memori + sinkron ke Drive (disuntikkan ke `Index.html` saat build). |
| `build.mjs` | Skrip perakit: `vite build` → suntik polyfill & data awal → `Index.html`. |
| `verify-polyfill.mjs` | Uji regresi polyfill (jalankan dengan `node verify-polyfill.mjs`). |
| `.claspignore` | Hanya mengunggah `Code.gs`, `Index.html`, `appsscript.json` saat `clasp push`. |

---

## Cara kerja penyimpanan

1. `localStorage` browser **tidak tersedia** di sandbox Apps Script
   (aksesnya melempar `SecurityError`). `client-polyfill.js` menggantinya
   dengan penyimpanan di memori yang otomatis disinkronkan ke Drive lewat
   `google.script.run.saveState()` (ter-debounce 400 ms).
2. `doGet()` membaca data tersimpan dari Drive lalu menyuntikkannya sebagai
   `window.__GAS_STORE__` sehingga aplikasi langsung memuat data yang sama
   seperti `localStorage` dulu — termasuk route terakhir, penghitung nomor
   surat, dan data Petugas Penagihan.
3. Data disimpan sebagai **satu file JSON** di folder
   `GeneratorSurat-Data/` pada Drive milik akun yang men-deploy script.
4. Integrasi Supabase otomatis **nonaktif** (tidak ada env `VITE_SUPABASE_*`),
   sehingga data Petugas Penagihan memakai penyimpanan Google-native yang
   sama — perilaku & validasi NIK tetap identik.

**Catatan model data:** karena akses "Anyone" + `executeAs: USER_DEPLOYING`,
seluruh pengunjung web app berbagi **satu dataset** di Drive (cocok untuk tim
internal). Bila ingin data terpisah per pengguna, ubah nama file store di
`Code.gs` memakai identitas pengguna, mis. `Session.getActiveUser().getEmail()`
(perlu akses "Anyone with Google account").

---

## Deploy

### Prasyarat
- Akun Google (pemilik script — data disimpan di Drive akun ini).
- (Opsional) Node.js bila ingin rebuild dari sumber.

### Opsi A — Manual (paling mudah, tanpa tool tambahan)

1. Buka <https://script.google.com> → **New project**.
2. Beri nama, hapus isi `Code.gs` bawaan, lalu tempel isi `gas/Code.gs`.
3. **File → New → HTML**, beri nama **`Index`** (tanpa ekstensi), tempel isi
   `gas/Index.html`.
4. **Project Settings** (⚙) → centang *Show "appsscript.json" manifest file*.
   Lalu buka file `appsscript.json` dan tempel isi `gas/appsscript.json`.
5. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
6. Klik **Deploy** → izinkan akses **Google Drive** saat diminta.
7. Salin URL `/exec` (format `https://script.google.com/macros/s/…/exec`) —
   itulah alamat web app Anda.

> Perubahan berikutnya: klik **Deploy → Manage deployments → Edit → New
> version** agar URL tetap sama, atau buat deployment baru.

### Opsi B — Dengan clasp (untuk rebuild & CI)

```bash
npm i -g @google/clasp
clasp login
cd gas
clasp create --type standalone --title "Generator Surat" --rootDir .
clasp push
clasp deploy --description "v1"
clasp deployments   # catat deployment id → buka https://script.google.com/macros/s/<id>/exec
```

---

## Rebuild setelah mengubah kode React

Setelah mengubah sumber di `vehicle-bastm-letter-generator (1)/src/`:

```bash
node gas/build.mjs   # build ulang + rakit gas/Index.html
clasp push           # (bila memakai clasp) unggah ulang
```

Lalu buat versi/deployment baru dari editor (Deploy → Manage deployments →
Edit → New version) agar perubahan tampil di URL web app.

---

## Keterbatasan & catatan penting

- **Cetak / Simpan PDF** — buka web app langsung di tab baru (bukan di-embed
  dalam iframe/situs lain) untuk hasil cetak terbaik. Karena web app berjalan
  di dalam iframe Apps Script, nama file PDF yang disarankan browser bisa
  mengikuti judul web app (bukan nama dokumen) — gunakan tombol cetak bawaan
  aplikasi.
- **Batas ukuran penyimpanan** — penulisan file Drive via `setContent()`
  dibatasi ~10 MB per file. Foto KTP/STNK yang sangat banyak & berukuran
  besar bisa mendekati batas ini; sebaiknya kompres foto sebelum diunggah.
- **Satu dataset bersama** — semua pengunjung melihat/menyimpan data yang
  sama (lihat catatan "model data" di atas).
- **Bukan server statis** — `gas/Index.html` berisi scriptlet
  `<?!= storeJson ?>` khusus Apps Script; hanya untuk GAS, bukan untuk dibuka
  langsung sebagai berkas HTML.
