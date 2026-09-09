/**
 * Build & rakit proyek Google Apps Script dari aplikasi React.
 *
 *   node gas/build.mjs
 *
 * Langkah:
 *   1. `npm run build` di folder aplikasi React (menghasilkan dist/index.html
 *      single-file via vite-plugin-singlefile).
 *   2. Menyuntikkan `window.__GAS_STORE__` (data awal dari Drive) + polyfill
 *      localStorage ke dalam <head>.
 *   3. Menulis hasilnya ke gas/Index.html (file templat Apps Script).
 *
 * Kode sumber React TIDAK diubah sama sekali.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..', 'vehicle-bastm-letter-generator (1)');
const distHtml = path.join(appDir, 'dist', 'index.html');
const polyfillPath = path.join(__dirname, 'client-polyfill.js');
const outHtml = path.join(__dirname, 'Index.html');

console.log('▶ Build aplikasi React (vite build)...');
execSync('npm run build', { cwd: appDir, stdio: 'inherit' });

const html = readFileSync(distHtml, 'utf8');
const polyfill = readFileSync(polyfillPath, 'utf8');

// Urutan tag scriptlet Apps Script: "<?", "<?=", "<?!" — bundel yang
// mengandung "<?" akan rusak saat dievaluasi templat.
if (html.includes('<?')) {
  throw new Error(
    'Bundel mengandung "<?" yang bentrok dengan templating Apps Script. ' +
      'Escape urutan tersebut di sumber aplikasi lalu build ulang.',
  );
}
if (polyfill.includes('<?') || /<\/script/i.test(polyfill)) {
  throw new Error('client-polyfill.js tidak boleh mengandung "<?" atau "</script".');
}

const injection = [
  '<script>window.__GAS_STORE__ = <?!= storeJson ?>;</script>',
  '<script>' + polyfill + '</script>',
].join('\n');

const headMatch = html.match(/<head[^>]*>/i);
if (!headMatch) throw new Error('Tag <head> tidak ditemukan di dist/index.html.');

const out = html.replace(headMatch[0], headMatch[0] + '\n' + injection);

writeFileSync(outHtml, out, 'utf8');
console.log(
  `✔ gas/Index.html siap di-deploy (${(Buffer.byteLength(out) / 1024).toFixed(1)} KB).`,
);
