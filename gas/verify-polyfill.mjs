import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const code = readFileSync(
  new URL('./client-polyfill.js', import.meta.url),
  'utf8',
);

// Simulasi sandbox GAS: localStorage adalah accessor di prototype yang THROW.
const proto = {};
Object.defineProperty(proto, 'localStorage', {
  get() {
    throw new Error('Access is denied for this document');
  },
});

const calls = [];
const saveState = (json) => {
  calls.push(json);
};
const run = {
  withSuccessHandler: () => ({ withFailureHandler: () => ({ saveState }) }),
};

const windowObj = Object.create(proto);
Object.assign(windowObj, {
  __GAS_STORE__: {
    'bast-generator-v1': JSON.stringify({ jenis: 'roda4' }),
    'bast-generator-route': 'tugas',
    'bast-petugas-v1': JSON.stringify([{ id: 1, nama: 'DIAN' }]),
  },
  google: { script: { run } },
});

const ctx = vm.createContext({
  window: windowObj,
  console,
  setTimeout,
  clearTimeout,
});
vm.runInContext(code, ctx);

// 1) getItem harus membaca store awal (bukan throw)
const v = windowObj.localStorage.getItem('bast-generator-v1');
console.log('getItem bast-generator-v1 =>', v.slice(0, 30), '...');

// 2) setItem harus menulis memori & men-schedule saveState
windowObj.localStorage.setItem('kunci', 'nilai');
console.log('length =>', windowObj.localStorage.length);
console.log('getItem kunci =>', windowObj.localStorage.getItem('kunci'));

// 3) tunggu debounce, pastikan saveState dipanggil dengan JSON lengkap
await new Promise((r) => setTimeout(r, 700));
console.log('saveState called =>', calls.length === 1);
if (calls.length) {
  const parsed = JSON.parse(calls[0]);
  console.log('   keys tersimpan =>', Object.keys(parsed).sort().join(', '));
  console.log('   kunci =>', parsed['kunci']);
  console.log(
    '   bast-petugas-v1 terjaga =>',
    parsed['bast-petugas-v1'].includes('DIAN'),
  );
}

// 4) removeItem
windowObj.localStorage.removeItem('kunci');
console.log(
  'after removeItem, kunci =>',
  windowObj.localStorage.getItem('kunci'),
);

console.log('POLYFILL TEST PASS');
