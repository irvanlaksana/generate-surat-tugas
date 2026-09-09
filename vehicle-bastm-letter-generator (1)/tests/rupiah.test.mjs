import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'

const require = createRequire(import.meta.url)

/** Transpile satu berkas TS/TSX sumber lalu jalankan sebagai CommonJS. */
function load(file, stubs = {}) {
  const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const exports = {}
  new Function('require', 'exports', code)((id) => stubs[id] ?? require(id), exports)
  return exports
}

const format = load('lib/format.ts')

test('nominal disimpan sebagai angka lalu diformat rupiah', () => {
  assert.equal(format.digitsOnly('Rp. 652.000'), '652000')
  assert.equal(format.digitsOnly('Rp. 652.000 / Rp. 11.736.000'.split('/')[1]), '11736000')
  assert.equal(format.ribuan('652000'), '652.000')
  assert.equal(format.ribuan('11736000'), '11.736.000')
  assert.equal(format.ribuan(''), '')
  assert.equal(format.rupiah('652000'), 'Rp. 652.000')
  assert.equal(format.rupiah('169285000'), 'Rp. 169.285.000')
  assert.equal(format.rupiah(''), '')
})

test('Surat Tugas mencetak Angsuran / Total & Denda dalam format rupiah', () => {  const { SuratTugasHal1 } = load('components/SuratTugas.tsx', {
    '../lib/format': format,
  })
  const { renderToStaticMarkup } = require('react-dom/server')

  const data = {
    kreditur: 'Koperasi Anugrah Mega Mandiri (KAMM)',
    mitraNama: 'PT MITRA JASATRIA INDONESIA',
    namaDebitur: 'MARYANTO',
    alamatDebitur: 'PENGADEGAN RT 001 RW 004',
    kecamatan: 'WANGON',
    noPerjanjian: '040424210837',
    merekType: 'HONDA / MINIBUS',
    noPolisi: 'R1187UC',
    tanggalISO: '2026-09-09',
    kop: {
      image: '',
      width: 170,
      offsetX: 0,
      offsetY: 0,
      align: 'center',
      garis: true,
      semuaHalaman: false,
      kontenY: 0,
      kontenY2: 0,
    },
    st: {
      nomor: 'ST-DC/MJI.KAMM/2026/09/0483',
      pemberiNama: 'FILEMO HALAWA',
      pemberiJabatan: 'DIREKTUR',
      petugasNama: 'DIAN FITRIANINGSIH',
      petugasNik: '3302195408790001',
      petugasJabatan: 'Petugas Penagihan',
      jatuhTempo: '23 MARET 2018',
      noAngsuran: '12',
      angsuran: '652000',
      totalAngsuran: '11736000',
      denda: '169285000',
      berlakuDari: '29 Agustus 2026',
      berlakuSampai: '31 Agustus 2026',
      kota: 'Purwokerto',
    },
  }

  const html = renderToStaticMarkup(SuratTugasHal1({ data }))
  assert.ok(
    html.includes('Rp. 652.000 / Rp. 11.736.000'),
    'baris "Angsuran / Total" tidak tercetak dalam format rupiah',
  )
  assert.ok(html.includes('Rp. 169.285.000'), 'DENDA tidak tercetak dalam format rupiah')
  assert.ok(!html.includes('652000'), 'angka mentah ikut tercetak di surat')
})

test('input rupiah di form menampilkan pemisah ribuan dan hanya menyimpan angka', () => {
  const ui = load('components/ui.tsx', { '../lib/format': format })

  function findInput(node) {
    if (!node || typeof node !== 'object') return undefined
    if (node.type === ui.TextInput) return node
    const children = node.props?.children
    for (const child of Array.isArray(children) ? children : [children]) {
      const found = findInput(child)
      if (found) return found
    }
  }

  const received = []
  const input = findInput(ui.RupiahInput({ value: '1234567', onValue: (v) => received.push(v) }))

  assert.equal(input.props.value, '1.234.567', 'tampilan input tidak diberi pemisah ribuan')
  assert.equal(input.props.inputMode, 'numeric')

  // apa pun yang diketik (termasuk "Rp" & titik) disimpan sebagai angka saja
  input.props.onChange({ target: { value: 'Rp 1.234.5678' } })
  assert.deepEqual(received, ['12345678'])
})
