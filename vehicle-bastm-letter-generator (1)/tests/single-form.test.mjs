import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Regresi untuk "satu form isian": semua surat memakai isian yang sama dan
 * tidak boleh ada lagi input ganda per dokumen.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full)
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : []
  })
}

const rel = (file) => path.relative(root, file)

test('hanya ada satu komponen form isian', () => {
  const files = readdirSync(path.join(root, 'components', 'forms')).sort()
  assert.deepEqual(files, ['IsianForm.tsx', 'formkit.ts'])
})

test('tidak ada isian ganda di dalam form', () => {
  const src = readFileSync(path.join(root, 'components', 'forms', 'IsianForm.tsx'), 'utf8')
  const names = [...src.matchAll(/name="([^"]+)"/g)].map((m) => m[1])
  const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))]
  assert.deepEqual(dupes, [], `field diisi lebih dari sekali: ${dupes.join(', ')}`)
  assert.ok(names.length >= 25, `form terlalu pendek (${names.length} field)`)
})

test('setiap field yang divalidasi punya isian di form tunggal', () => {
  const validation = readFileSync(path.join(root, 'lib', 'validation.ts'), 'utf8')
  const paths = [...new Set([...validation.matchAll(/path: "([^"]+)"/g)].map((m) => m[1]))]
  assert.ok(paths.length >= 15, `aturan validasi tidak terbaca (${paths.length})`)

  const form = [
    readFileSync(path.join(root, 'components', 'forms', 'IsianForm.tsx'), 'utf8'),
    readFileSync(path.join(root, 'components', 'LampiranUploads.tsx'), 'utf8'),
  ].join('\n')

  const missing = paths.filter(
    (p) => !form.includes(`name="${p}"`) && !form.includes(`data-field="${p}"`),
  )
  assert.deepEqual(missing, [], `field validasi tanpa input: ${missing.join(', ')}`)
})

test('field duplikat per dokumen sudah dihapus dari seluruh sumber', () => {
  const legacy = [
    'st.nasabahNama',
    'st.merkType',
    'st.noPolisi',
    'st.noKontrak',
    'st.perusahaan',
    'tanggalBast',
    'noSuratTugas',
    'tanggalSuratISO',
    'angsuranNilai',
    'nasabahNama',
    'nasabahAlamat',
  ]
  // App.tsx dikecualikan: satu-satunya tempat yang membaca data lama saat migrasi.
  for (const file of walk(root).filter((f) => !f.endsWith('App.tsx'))) {
    const src = readFileSync(file, 'utf8')
    for (const key of legacy) {
      assert.ok(!src.includes(key), `${rel(file)} masih memakai isian lama "${key}"`)
    }
  }
})

test('semua dokumen membaca isian bersama, bukan salinannya', () => {
  const suratTugas = readFileSync(path.join(root, 'components', 'SuratTugas.tsx'), 'utf8')
  for (const field of [
    'data.namaDebitur',
    'data.merekType',
    'data.noPolisi',
    'data.noPerjanjian',
    'data.tanggalISO',
    'data.alamatDebitur',
    'data.mitraNama',
  ]) {
    assert.ok(suratTugas.includes(field), `SuratTugas.tsx tidak memakai ${field}`)
  }

  const bast = readFileSync(path.join(root, 'components', 'BastSheet.tsx'), 'utf8')
  assert.ok(bast.includes('data.tanggalISO'), 'BastSheet.tsx tidak memakai data.tanggalISO')
  assert.ok(bast.includes('data.st.nomor'), 'BastSheet.tsx tidak memakai data.st.nomor')
})
