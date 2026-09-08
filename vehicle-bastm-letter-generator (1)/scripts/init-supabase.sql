-- Supabase Database Initialization Script
-- Run this in Supabase SQL Editor to set up the required tables

-- ============================================
-- 1. Create Mitra Table (Optional - for organizing petugas)
-- ============================================
CREATE TABLE IF NOT EXISTS mitra (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  legalitas VARCHAR(100),
  alamat TEXT,
  pic VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample mitra if needed
INSERT INTO mitra (nama, legalitas, alamat, pic) VALUES 
  ('PT. Mitra Jaya Indonesia', 'AHU-00123456', 'Jl. Raya No. 123, Purwokerto', 'Filemon Halawa')
ON CONFLICT (nama) DO NOTHING;

-- ============================================
-- 2. Create Petugas Penagihan Table
-- ============================================
CREATE TABLE IF NOT EXISTS petugas_penagihan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  jabatan VARCHAR(100) DEFAULT 'Petugas Penagihan',
  mitra_id INTEGER REFERENCES mitra(id) ON DELETE SET NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample petugas data
INSERT INTO petugas_penagihan (nama, nik, jabatan, mitra_id, aktif) VALUES 
  ('DIAN FITRIANINGSIH', '1234567890123456', 'Petugas Penagihan', 1, TRUE),
  ('JOHN DOE', '9876543210987654', 'Senior Collector', 1, TRUE),
  ('JANE SMITH', '5555555555555555', 'Field Officer', 1, TRUE)
ON CONFLICT (nik) DO NOTHING;

-- ============================================
-- 3. Create Debitur Table
-- ============================================
CREATE TABLE IF NOT EXISTS debitur (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  alamat TEXT,
  no_kontrak VARCHAR(100) UNIQUE,
  no_ktp VARCHAR(50),
  telepon VARCHAR(20),
  email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'aktif' CHECK (status IN ('aktif', 'lunas', 'macet')),
  mitra_id INTEGER REFERENCES mitra(id) ON DELETE SET NULL,
  petugas_id INTEGER REFERENCES petugas_penagihan(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample debitur data
INSERT INTO debitur (nama, alamat, no_kontrak, no_ktp, telepon, email, status, mitra_id, petugas_id) VALUES 
  ('ADE IRAWAN', 'PENGADEGAN RT 001 RW 004, PENGADEGAN, WANGON', 'KTR-001', '1234567890123456', '081234567890', 'ade@example.com', 'aktif', 1, 1),
  ('BAMBANG SUPRIADI', 'Jl. Merdeka No. 45, Purwokerto', 'KTR-002', '9876543210987654', '081234567891', 'bambang@example.com', 'lunas', 1, 2),
  ('CITRA DEWI', 'Jl. Raya No. 67, Banyumas', 'KTR-003', '5555555555555555', '081234567892', 'citra@example.com', 'macet', 1, 3)
ON CONFLICT (no_kontrak) DO NOTHING;

-- ============================================
-- 4. Create Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_aktif ON petugas_penagihan(aktif) WHERE aktif = TRUE;
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_nama ON petugas_penagihan(nama);
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_nik ON petugas_penagihan(nik);
CREATE INDEX IF NOT EXISTS idx_debitur_nama ON debitur(nama);
CREATE INDEX IF NOT EXISTS idx_debitur_no_kontrak ON debitur(no_kontrak);
CREATE INDEX IF NOT EXISTS idx_debitur_no_ktp ON debitur(no_ktp);
CREATE INDEX IF NOT EXISTS idx_debitur_status ON debitur(status);
CREATE INDEX IF NOT EXISTS idx_debitur_petugas_id ON debitur(petugas_id);

-- ============================================
-- 5. (Optional) Create RLS Policies for Production
-- ============================================
-- Uncomment these for production use

-- ALTER TABLE petugas_penagihan ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE debitur ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

-- For development (public access):
-- CREATE POLICY "Public read access to petugas" ON petugas_penagihan FOR SELECT USING (true);
-- CREATE POLICY "Public insert petugas" ON petugas_penagihan FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update petugas" ON petugas_penagihan FOR UPDATE USING (true);

-- CREATE POLICY "Public read access to debitur" ON debitur FOR SELECT USING (true);
-- CREATE POLICY "Public insert debitur" ON debitur FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update debitur" ON debitur FOR UPDATE USING (true);
-- CREATE POLICY "Public delete debitur" ON debitur FOR DELETE USING (true);

-- For production (authenticated access only):
-- CREATE POLICY "Authenticated access to petugas" ON petugas_penagihan FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Authenticated access to debitur" ON debitur FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- 6. Create Helper Views (Optional)
-- ============================================
CREATE OR REPLACE VIEW v_petugas_aktif AS
SELECT id, nama, nik, jabatan, mitra_id
FROM petugas_penagihan
WHERE aktif = TRUE
ORDER BY nama;

CREATE OR REPLACE VIEW v_debitur_summary AS
SELECT 
  id,
  nama,
  no_kontrak,
  no_ktp,
  status,
  petugas_penagihan.nama as petugas_nama,
  petugas_penagihan.nik as petugas_nik
FROM debitur
LEFT JOIN petugas_penagihan ON debitur.petugas_id = petugas_penagihan.id
ORDER BY debitur.nama;

-- ============================================
-- Summary
-- ============================================
-- Tables created: mitra, petugas_penagihan, debitur
-- Indexes created: 8 indexes for performance
-- Sample data inserted: 1 mitra, 3 petugas, 3 debitur
-- Ready for use with the application!
