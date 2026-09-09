import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'

// Exercise the actual form callback without a browser or database connection.
const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/components/forms/IsianForm.tsx', import.meta.url), 'utf8')
const code = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText

// Semua dependensi form tunggal di-stub: yang diuji hanya callback PetugasDropdown.
const stubs = {
  '../../data/perlengkapan': {
    PERLENGKAPAN: { roda2: { label: 'Roda 2' }, roda4: { label: 'Roda 4' } },
  },
  '../../lib/format': { hariTanggal: () => '' },
  '../../lib/text': {
    KREDITUR_DEFAULT: 'KREDITUR',
    KREDITUR_PRESETS: [],
    catatanKreditur: () => 'kalimat kreditur',
    catatanKrediturText: () => 'kalimat kreditur',
    countForDate: () => 0,
    generateNomorST: () => 'ST-GEN/0001',
    initialsOf: () => 'XX',
    mitraLine: () => 'kalimat mitra',
    nextCountForDate: () => 1,
  },
  '../../lib/modules': {
    SECTIONS: [{ id: 'petugas', label: 'Petugas' }],
    sectionAnchor: (id) => `bagian-${id}`,
  },
  '../ChecklistEditor': { default: 'ChecklistEditor' },
  '../KopEditor': { default: 'KopEditor' },
  '../LampiranUploads': { default: 'LampiranUploads' },
  '../ui': Object.fromEntries(
    ['Check', 'Field', 'Grid', 'GroupTitle', 'Segmented', 'TextArea', 'TextInput'].map((name) => [name, name]),
  ),
  '../ui/PetugasDropdown': { PetugasDropdown: 'PetugasDropdown' },
  './formkit': { useIssueMaps: () => ({ E: () => undefined, W: () => undefined }) },
}

const exports = {}
new Function('require', 'exports', code)((id) => stubs[id] ?? require(id), exports)

function findDropdown(node) {
  if (!node || typeof node !== 'object') return undefined
  if (node.type === 'PetugasDropdown') return node
  const children = node.props?.children
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findDropdown(child)
    if (found) return found
  }
}

function setup() {
  let data = {
    jenis: 'roda4',
    kreditur: 'Koperasi Anugrah Mega Mandiri (KAMM)',
    tanggalISO: '2026-09-08',
    checklist: {},
    st: {
      petugasNama: 'PETUGAS LAMA',
      petugasNik: '3302195408790001',
      petugasJabatan: 'Petugas Penagihan',
      nomor: 'ST-TEST/001',
    },
  }
  const updates = []
  const render = () => findDropdown(exports.default({
    data,
    issues: [],
    setJenis: () => {},
    setChecklist: () => {},
    set: (key, value) => {
      updates.push({ key, value })
      data = { ...data, [key]: value }
    },
  }))
  return { render, updates, getData: () => data }
}

test('selecting a petugas updates name and NIK together and preserves other form fields', () => {
  const form = setup()
  const previous = form.getData().st
  form.render().props.onChange('PETUGAS BARU', '0123456789012345')
  assert.equal(form.updates.length, 1)
  assert.deepEqual(form.getData().st, {
    ...previous,
    petugasNama: 'PETUGAS BARU',
    petugasNik: '0123456789012345',
  })
  assert.equal(form.render().props.value, 'PETUGAS BARU')
})

test('switching petugas again keeps the displayed name and form NIK in sync', () => {
  const form = setup()
  for (const [nama, nik] of [
    ['PETUGAS SATU', '0123456789012345'],
    ['PETUGAS DUA', '0123456789012346'],
  ]) {
    form.render().props.onChange(nama, nik)
    assert.equal(form.render().props.value, nama)
    assert.equal(form.getData().st.petugasNik, nik)
  }
})

test('an omitted NIK is preserved while an explicitly empty NIK clears the old value', () => {
  const form = setup()
  const oldNik = form.getData().st.petugasNik
  form.render().props.onChange('TANPA NIK')
  assert.equal(form.render().props.value, 'TANPA NIK')
  assert.equal(form.getData().st.petugasNik, oldNik)
  form.render().props.onChange('NIK KOSONG', '')
  assert.equal(form.render().props.value, 'NIK KOSONG')
  assert.equal(form.getData().st.petugasNik, '')
})
