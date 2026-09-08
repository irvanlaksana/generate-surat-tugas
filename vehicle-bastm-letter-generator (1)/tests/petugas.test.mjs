import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/supabase.ts', import.meta.url), 'utf8')
const code = ts.transpileModule(source.replaceAll('import.meta.env', 'env'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function setup(remote) {
  const stored = new Map()
  const localStorage = {
    getItem: (key) => stored.get(key) ?? null,
    setItem: (key, value) => stored.set(key, value),
  }
  const exports = {}
  const env = remote ? { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'test' } : {}
  const client = { from: () => ({ insert: (row) => ({ select: () => ({ single: () => remote(row) }) }) }) }
  new Function('require', 'exports', 'env', 'localStorage', code)(
    () => ({ createClient: () => client }), exports, env, localStorage,
  )
  return { api: exports, stored }
}
const input = { nama: 'Petugas Test', nik: '0123456789012345', jabatan: '', mitra_id: null, aktif: true }

test('manual NIK is saved unchanged, including leading zero, and survives reload', async () => {
  const { api, stored } = setup()
  const row = await api.addPetugas(input)
  assert.equal(row.nik, input.nik)
  assert.equal(JSON.parse(stored.get('bast-petugas-v1')).at(-1).nik, input.nik)
  assert.equal((await api.fetchPetugasPenagihan()).find(p => p.id === row.id).nik, input.nik)
  await assert.rejects(api.addPetugas(input), /NIK sudah terdaftar/)
})

test('missing, short, long and nonnumeric NIK are rejected without writes', async () => {
  const { api, stored } = setup()
  for (const nik of [undefined, '', '123', '12345678901234567', '123456789012345a']) {
    await assert.rejects(api.addPetugas({ ...input, nik }), /NIK/)
  }
  assert.equal(stored.size, 0)
})

test('Supabase receives the exact manually entered NIK', async () => {
  const { api } = setup(async row => {
    assert.equal(row.nik, input.nik)
    return { data: { ...row, id: 9 }, error: null }
  })
  assert.equal((await api.addPetugas(input)).nik, input.nik)
})

test('Supabase duplicate is rejected, without regeneration or local fallback', async () => {
  let calls = 0
  const { api, stored } = setup(async () => {
    calls++
    return { data: null, error: { code: '23505', message: 'duplicate key' } }
  })
  await assert.rejects(api.addPetugas(input), /NIK sudah terdaftar/)
  assert.equal(calls, 1)
  assert.equal(stored.size, 0)
  assert.equal(api.getStorageMode(), 'supabase')
})

test('network fallback preserves manual NIK', async () => {
  const { api } = setup(async () => { throw new Error('Failed to fetch') })
  assert.equal((await api.addPetugas(input)).nik, input.nik)
  assert.equal(api.getStorageMode(), 'local')
})
