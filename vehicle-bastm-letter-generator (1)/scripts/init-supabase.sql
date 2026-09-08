-- ============================================================
-- Inisialisasi Database Supabase — Petugas Penagihan
-- ============================================================
-- Jalankan seluruh skrip ini di Supabase SQL Editor.
-- Skrip ini aman dijalankan berulang kali (idempotent).
--
-- Catatan: aplikasi juga bisa berjalan TANPA Supabase — data
-- petugas otomatis disimpan di localStorage browser. Supabase
-- hanya diperlukan bila ingin data dipakai bersama antar perangkat
-- (set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env).

-- ============================================================
-- 0. Bersihkan modul debitur yang sudah dihapus dari aplikasi
-- ============================================================
DROP VIEW IF EXISTS v_debitur_summary;
DROP TABLE IF EXISTS debitur CASCADE;

-- ============================================================
-- 1. Tabel Mitra (opsional — untuk pengelompokan petugas)
-- ============================================================
CREATE TABLE IF NOT EXISTS mitra (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  legalitas VARCHAR(100),
  alamat TEXT,
  pic VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mitra (nama, legalitas, alamat, pic) VALUES
  ('PT. Mitra Jaya Indonesia', 'AHU-00123456', 'Jl. Raya No. 123, Purwokerto', 'Filemon Halawa')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Tabel Petugas Penagihan
-- ============================================================
CREATE TABLE IF NOT EXISTS petugas_penagihan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  jabatan VARCHAR(100) DEFAULT 'Petugas Penagihan',
  mitra_id INTEGER REFERENCES mitra(id) ON DELETE SET NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data contoh (diabaikan bila NIK sudah ada)
INSERT INTO petugas_penagihan (nama, nik, jabatan, mitra_id, aktif) VALUES
  ('DIAN FITRIANINGSIH', '3302195408790001', 'Petugas Penagihan', 1, TRUE)
ON CONFLICT (nik) DO NOTHING;

-- ============================================================
-- 3. Index untuk performa
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_aktif ON petugas_penagihan(aktif) WHERE aktif = TRUE;
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_nama ON petugas_penagihan(nama);
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_nik ON petugas_penagihan(nik);

-- ============================================================
-- 4. Keamanan (RLS)
-- ============================================================
-- Tanpa kebijakan di bawah ini, INSERT dari aplikasi (anon key)
-- akan DITOLAK Supabase dan petugas gagal tersimpan.
ALTER TABLE petugas_penagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "petugas_bisa_dibaca" ON petugas_penagihan;
DROP POLICY IF EXISTS "petugas_bisa_ditambah" ON petugas_penagihan;
DROP POLICY IF EXISTS "petugas_bisa_diubah" ON petugas_penagihan;
DROP POLICY IF EXISTS "mitra_bisa_dibaca" ON mitra;

CREATE POLICY "petugas_bisa_dibaca"  ON petugas_penagihan FOR SELECT USING (true);
CREATE POLICY "petugas_bisa_ditambah" ON petugas_penagihan FOR INSERT WITH CHECK (true);
CREATE POLICY "petugas_bisa_diubah"  ON petugas_penagihan FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "mitra_bisa_dibaca"    ON mitra FOR SELECT USING (true);

-- Untuk produksi yang lebih ketat, ganti kebijakan di atas dengan:
-- CREATE POLICY "... " ON petugas_penagihan FOR ALL
--   USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 5. View pembantu (opsional)
-- ============================================================
CREATE OR REPLACE VIEW v_petugas_aktif AS
SELECT id, nama, nik, jabatan, mitra_id
FROM petugas_penagihan
WHERE aktif = TRUE
ORDER BY nama;

-- ============================================================
-- Ringkasan
-- ============================================================
-- Tabel dibuat : mitra, petugas_penagihan
-- Tabel dihapus: debitur (modul debitur sudah dihapus dari aplikasi)
-- RLS          : baca/tambah/ubah petugas diizinkan untuk aplikasi
-- Siap dipakai oleh aplikasi setelah .env diisi!
