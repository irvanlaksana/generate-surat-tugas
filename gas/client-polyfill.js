/* Polyfill penyimpanan untuk Google Apps Script (HtmlService iframe).
 * -----------------------------------------------------------------
 * Di sandbox Apps Script, `localStorage` browser TIDAK tersedia
 * (aksesnya melempar SecurityError). Polyfill ini menggantikannya dengan
 * penyimpanan di memori yang otomatis disinkronkan ke Google Drive lewat
 * `google.script.run.saveState()`, sehingga semua fitur autosave aplikasi
 * (termasuk data Petugas Penagihan) tetap bekerja tanpa mengubah kode
 * aplikasi sedikit pun.
 *
 * Di luar GAS (mis. `npm run dev` atau deploy Vercel), polyfill ini TIDAK
 * aktif — localStorage asli dipakai seperti biasa.
 */
(function () {
  function isGas() {
    try {
      return !!(window.google && window.google.script && window.google.script.run);
    } catch (e) {
      return false;
    }
  }
  if (!isGas()) return;

  var mem = {};
  var init = window.__GAS_STORE__;
  if (init && typeof init === 'object') {
    for (var k in init) {
      if (Object.prototype.hasOwnProperty.call(init, k)) {
        mem[k] = String(init[k]);
      }
    }
  }

  var timer = null;
  function sync() {
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      try {
        window.google.script.run
          .withSuccessHandler(function () {})
          .withFailureHandler(function (err) {
            console.warn('Gagal menyimpan data ke Google Drive:', err && err.message);
          })
          .saveState(JSON.stringify(mem));
      } catch (e) {
        console.warn('Gagal menyimpan data ke Google Drive:', e && e.message);
      }
    }, 400);
  }

  var store = {
    getItem: function (key) {
      key = String(key);
      return Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
    },
    setItem: function (key, value) {
      mem[String(key)] = String(value);
      sync();
    },
    removeItem: function (key) {
      delete mem[String(key)];
      sync();
    },
    clear: function () {
      mem = {};
      sync();
    },
    key: function (i) {
      return Object.keys(mem)[i] || null;
    },
    get length() {
      return Object.keys(mem).length;
    },
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: store,
      configurable: true,
    });
  } catch (e) {
    try {
      window.localStorage = store;
    } catch (e2) {
      console.warn('Tidak dapat memasang polyfill localStorage:', e2 && e2.message);
    }
  }
})();
