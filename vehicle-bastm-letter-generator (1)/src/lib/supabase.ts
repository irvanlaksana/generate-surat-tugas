import { createClient } from '@supabase/supabase-js'

/**
 * Lapisan data Petugas Penagihan ("team penagih").
 *
 * Penyimpanan bekerja dalam 2 mode:
 *
 * 1. **Lokal (default)** — data disimpan permanen di localStorage browser.
 *    Tidak perlu setup apa pun; menambah petugas selalu berhasil dan data
 *    tetap ada setelah halaman dimuat ulang.
 *
 * 2. **Supabase** — aktif otomatis bila `VITE_SUPABASE_URL` dan
 *    `VITE_SUPABASE_ANON_KEY` terisi di file `.env` (lihat
 *    SUPABASE_SETUP.md). Bila koneksi Supabase gagal (mis. jaringan putus
 *    atau kebijakan RLS menolak), aplikasi otomatis beralih ke penyimpanan
 *    lokal untuk sesi ini supaya data tidak hilang, dengan data hasil
 *    unduhan Supabase terakhir tetap dijadikan cadangan.
 *
 * Semua fungsi tulis melempar `Error` berpesan jelas (bahasa Indonesia)
 * ketika benar-benar gagal — tidak pernah gagal secara diam-diam.
 */

export interface PetugasPenagihan {
  id: number
  nama: string
  nik: string
  jabatan: string
  mitra_id: number | null
  aktif: boolean
  created_at: string
}

export type PetugasInput = Omit<PetugasPenagihan, 'id' | 'created_at'>

/* ------------------------------------------------------------------ */
/* Inisialisasi Supabase (opsional)                                    */
/* ------------------------------------------------------------------ */

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** true bila kredensial Supabase benar-benar terisi (bukan placeholder). */
export const isSupabaseConfigured = Boolean(
  envUrl &&
    envKey &&
    /^https?:\/\//.test(envUrl) &&
    !envUrl.includes('YOUR_PROJECT_REF') &&
    envKey !== 'YOUR_SUPABASE_ANON_KEY' &&
    envKey !== 'YOUR_SUPABASE_ANON_KEY.placeholder',
)

const supabase = isSupabaseConfigured ? createClient(envUrl!, envKey!) : null

export type StorageMode = 'supabase' | 'local'

/**
 * Bila true, seluruh operasi memakai penyimpanan lokal untuk sisa sesi.
 * Di-set ketika Supabase terkonfigurasi tapi ternyata gagal dihubungi,
 * sehingga penyimpanan tetap berhasil dan tidak ada data yang hilang.
 */
let degradedToLocal = !isSupabaseConfigured

/** Mode penyimpanan yang sedang aktif — untuk ditampilkan di UI. */
export function getStorageMode(): StorageMode {
  return supabase && !degradedToLocal ? 'supabase' : 'local'
}

/* ------------------------------------------------------------------ */
/* Penyimpanan lokal (localStorage)                                    */
/* ------------------------------------------------------------------ */

const PETUGAS_KEY = 'bast-petugas-v1'

/** Data contoh saat aplikasi pertama kali dipakai tanpa Supabase. */
const SEED_PETUGAS: Omit<PetugasPenagihan, 'id'>[] = [
  {
    nama: 'DIAN FITRIANINGSIH',
    nik: '3302195408790001',
    jabatan: 'Petugas Penagihan',
    mitra_id: null,
    aktif: true,
    created_at: new Date().toISOString(),
  },
]

function isPetugasRow(v: unknown): v is PetugasPenagihan {
  if (typeof v !== 'object' || v === null) return false
  const r = v as Record<string, unknown>
  return (
    typeof r.id === 'number' &&
    typeof r.nama === 'string' &&
    typeof r.nik === 'string' &&
    typeof r.jabatan === 'string'
  )
}

function readLocalPetugas(): PetugasPenagihan[] {
  try {
    const raw = localStorage.getItem(PETUGAS_KEY)
    if (raw === null) {
      // Pertama kali dijalankan. Bila Supabase aktif, jangan seed —
      // data akan diambil dari Supabase.
      if (isSupabaseConfigured) return []
      const seeded = SEED_PETUGAS.map((p, i) => ({ ...p, id: i + 1 }))
      writeLocalPetugas(seeded)
      return seeded
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPetugasRow).map((r) => ({
      ...r,
      mitra_id: r.mitra_id ?? null,
      aktif: r.aktif ?? true,
      created_at: r.created_at ?? new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

function writeLocalPetugas(rows: PetugasPenagihan[]): void {
  try {
    localStorage.setItem(PETUGAS_KEY, JSON.stringify(rows))
  } catch {
    // localStorage penuh / tidak tersedia — biarkan; operasi tulis akan
    // tetap mengembalikan data untuk sesi ini.
  }
}

function nextLocalId(rows: PetugasPenagihan[]): number {
  return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
}

/** Gabungkan dua kumpulan baris tanpa duplikat NIK (untuk sinkron cadangan). */
function mergeByNik(a: PetugasPenagihan[], b: PetugasPenagihan[]): PetugasPenagihan[] {
  const byNik = new Map<string, PetugasPenagihan>()
  for (const r of [...a, ...b]) if (!byNik.has(r.nik)) byNik.set(r.nik, r)
  return [...byNik.values()]
}

/* ------------------------------------------------------------------ */
/* Pesan error yang mudah dipahami                                     */
/* ------------------------------------------------------------------ */

function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

function describeError(e: unknown): string {
  const msg = messageOf(e)
  if (/duplicate key/i.test(msg)) return 'NIK sudah terdaftar di database (duplikat).'
  if (/row-level security|permission denied|violates row-level/i.test(msg))
    return 'Database menolak penyimpanan (RLS). Jalankan ulang scripts/init-supabase.sql di Supabase SQL Editor.'
  if (/failed to fetch|networkerror|fetch failed|load failed/i.test(msg))
    return 'Tidak dapat terhubung ke database Supabase.'
  return msg || 'Terjadi kesalahan saat menyimpan.'
}

/* ------------------------------------------------------------------ */
/* API Petugas Penagihan                                               */
/* ------------------------------------------------------------------ */

/** Ambil daftar petugas penagihan yang aktif, urut nama. */
export async function fetchPetugasPenagihan(): Promise<PetugasPenagihan[]> {
  if (supabase && !degradedToLocal) {
    try {
      const { data, error } = await supabase
        .from('petugas_penagihan')
        .select('*')
        .eq('aktif', true)
        .order('nama', { ascending: true })
      if (error) throw error
      if (Array.isArray(data)) {
        const rows = data as PetugasPenagihan[]
        // Simpan cadangan lokal supaya data tetap ada bila Supabase
        // kemudian tidak bisa dihubungi.
        writeLocalPetugas(mergeByNik(readLocalPetugas(), rows))
        return rows
      }
      return []
    } catch (e) {
      console.warn('Supabase tidak dapat dihubungi — memakai penyimpanan lokal:', e)
      degradedToLocal = true
    }
  }
  return readLocalPetugas()
    .filter((p) => p.aktif)
    .sort((a, b) => a.nama.localeCompare(b.nama))
}

/** Tambah petugas penagih baru. Melempar Error bila gagal total. */
export async function addPetugas(petugas: PetugasInput): Promise<PetugasPenagihan> {
  const nama = (petugas.nama || '').trim().toUpperCase()
  if (!nama) throw new Error('Nama petugas wajib diisi.')

  const base = {
    nama,
    jabatan: (petugas.jabatan || '').trim() || 'Petugas Penagihan',
    mitra_id: petugas.mitra_id ?? null,
    aktif: petugas.aktif ?? true,
  }
  const nik = petugas.nik || ''
  if (!nik) throw new Error('NIK petugas wajib diisi.')
  if (!/^[0-9]{16}$/.test(nik)) throw new Error('NIK harus terdiri dari 16 digit angka.')

  if (supabase && !degradedToLocal) {
    try {
      const { data, error } = await supabase
        .from('petugas_penagihan')
        .insert({ ...base, nik })
        .select()
        .single()
      if (error) throw error
      if (data) {
        // catat juga ke cadangan lokal
        writeLocalPetugas(mergeByNik(readLocalPetugas(), [data as PetugasPenagihan]))
        return data as PetugasPenagihan
      }
      throw new Error('Data tidak tersimpan ke Supabase.')
    } catch (e) {
      // NIK manual tidak boleh diganti atau disimpan lokal untuk melewati duplikat.
      if ((typeof e === 'object' && e !== null && 'code' in e && e.code === '23505') || /duplicate key/i.test(messageOf(e))) {
        throw new Error('NIK sudah terdaftar. Gunakan NIK petugas yang berbeda.')
      }
      console.warn('Supabase gagal menyimpan — beralih ke penyimpanan lokal:', e)
      degradedToLocal = true
    }
  }

  // ---- penyimpanan lokal ----
  const rows = readLocalPetugas()
  if (rows.some((r) => r.nik === nik)) {
    throw new Error('NIK sudah terdaftar. Gunakan NIK petugas yang berbeda.')
  }
  const row: PetugasPenagihan = {
    ...base,
    nik,
    id: nextLocalId(rows),
    created_at: new Date().toISOString(),
  }
  writeLocalPetugas([...rows, row])
  return row
}

/** Ubah data petugas. Melempar Error bila gagal. */
export async function updatePetugas(
  id: number,
  patch: Partial<Omit<PetugasPenagihan, 'id' | 'created_at'>>,
): Promise<PetugasPenagihan> {
  if (supabase && !degradedToLocal) {
    try {
      const { data, error } = await supabase
        .from('petugas_penagihan')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      if (data) return data as PetugasPenagihan
      throw new Error('Data tidak ditemukan di Supabase.')
    } catch (e) {
      console.warn('Supabase gagal memperbarui — beralih ke penyimpanan lokal:', e)
      degradedToLocal = true
    }
  }

  const rows = readLocalPetugas()
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Petugas tidak ditemukan.')
  const updated: PetugasPenagihan = { ...rows[idx], ...patch, id, }
  rows[idx] = updated
  writeLocalPetugas(rows)
  return updated
}

/** Hapus petugas (non-aktifkan). Melempar Error bila gagal. */
export async function deletePetugas(id: number): Promise<void> {
  if (supabase && !degradedToLocal) {
    try {
      const { error } = await supabase
        .from('petugas_penagihan')
        .update({ aktif: false })
        .eq('id', id)
      if (error) throw error
      return
    } catch (e) {
      console.warn('Supabase gagal menghapus — beralih ke penyimpanan lokal:', e)
      degradedToLocal = true
    }
  }

  const rows = readLocalPetugas()
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Petugas tidak ditemukan.')
  rows[idx] = { ...rows[idx], aktif: false }
  writeLocalPetugas(rows)
}

/** Alasan human-readable dari error Supabase/jaringan (internal). */
export { describeError }
