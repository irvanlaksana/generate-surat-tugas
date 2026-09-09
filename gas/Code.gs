/**
 * Generator Surat — Google Apps Script (backend)
 * =====================================================
 * Aplikasi React "Generator Surat" (Surat Tugas, Surat Penyerahan,
 * BAST Kendaraan, dan Lampiran) disajikan lewat Apps Script sebagai
 * web app. Seluruh logika & tampilan aplikasi TIDAK berubah — GAS hanya
 * bertindak sebagai server + penyimpanan data di Google Drive.
 *
 * Cara kerja penyimpanan:
 *   - Klien menyimpan seluruh state (termasuk data Petugas Penagihan
 *     yang sebelumnya memakai Supabase/localStorage) ke objek "store".
 *   - Polyfill localStorage di klien mensinkronkan store tersebut ke
 *     Google Drive lewat `saveState()` (google.script.run).
 *   - `doGet()` membaca store dari Drive dan menyuntikkannya ke halaman
 *     (window.__GAS_STORE__) sehingga aplikasi bisa langsung memuat data
 *     yang sama seperti sebelumnya.
 *
 * Data disimpan sebagai satu file JSON di folder khusus milik pengguna
 * yang men-deploy script ini (bukan per-browser). Bila ingin data
 * terpisah per pengguna, sesuaikan nama file dengan identitas pengguna.
 */

var STORE_FILE_NAME = 'bast-generator-state.json';
var APP_FOLDER_NAME = 'GeneratorSurat-Data';

/** ============================================================
 *  doGet — titik masuk web app
 *  ============================================================ */
function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  t.storeJson = safeJson_(readStore_());

  return t
    .evaluate()
    .setTitle('Generator Surat — Tugas, Penyerahan & BAST Kendaraan')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** ============================================================
 *  saveState — dipanggil klien lewat google.script.run.saveState()
 *  Simpan seluruh store (string JSON) ke Google Drive.
 *  ============================================================ */
function saveState(json) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    if (typeof json !== 'string') {
      json = JSON.stringify(json == null ? {} : json);
    }

    writeStore_(json);
    return true;
  } catch (err) {
    var msg = err && err.message ? err.message : String(err);
    throw new Error('Gagal menyimpan data ke Google Drive: ' + msg);
  } finally {
    lock.releaseLock();
  }
}

/** ============================================================
 *  Helper internal (dengan akhiran "_" agar TIDAK bisa dipanggil
 *  langsung dari klien melalui google.script.run)
 *  ============================================================ */

/** Folder khusus aplikasi di Drive pemilik script (dibuat otomatis). */
function getAppFolder_() {
  var folders = DriveApp.getFoldersByName(APP_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(APP_FOLDER_NAME);
}

/** Baca seluruh store dari Drive. Kembalikan {} bila belum ada / korup. */
function readStore_() {
  try {
    var folder = getAppFolder_();
    var files = folder.getFilesByName(STORE_FILE_NAME);
    if (!files.hasNext()) return {};

    var content = files.next().getBlob().getDataAsString();
    if (!content) return {};

    var parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    console.log('Gagal membaca store (direset ke kosong):', err && err.message);
    return {};
  }
}

/** Tulis store (string JSON) ke Drive — menimpa file lama, hapus duplikat. */
function writeStore_(json) {
  var folder = getAppFolder_();
  var files = folder.getFilesByName(STORE_FILE_NAME);
  var existing = [];
  while (files.hasNext()) existing.push(files.next());

  if (existing.length === 0) {
    folder.createFile(STORE_FILE_NAME, json, 'application/json');
  } else {
    existing[0].setContent(json);
    // Bersihkan file duplikat (jaga-jaga bila pernah tercipta ganda).
    for (var i = 1; i < existing.length; i++) {
      try {
        existing[i].setTrashed(true);
      } catch (err) {
        /* abaikan */
      }
    }
  }
}

/** JSON.stringify yang aman disisipkan ke dalam tag <script>. */
function safeJson_(value) {
  return JSON.stringify(value == null ? {} : value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
