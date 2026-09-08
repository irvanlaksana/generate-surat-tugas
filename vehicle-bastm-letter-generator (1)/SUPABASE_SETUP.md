# Supabase Setup Guide for Petugas Penagihan & Debitur Management

This guide will help you set up Supabase database for the Petugas Penagihan and Debitur management system.

## Prerequisites
- A Supabase account (free tier available)
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details and create the project
4. Wait for the database to be provisioned

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings > API**
2. Copy the following:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Create Database Tables

You can create the tables using SQL Editor in Supabase dashboard or via the Supabase CLI.

### Option A: Using Supabase SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL:

```sql
-- Create Mitra table (optional, for organizing petugas)
CREATE TABLE IF NOT EXISTS mitra (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  legalitas VARCHAR(100),
  alamat TEXT,
  pic VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Petugas Penagihan table
CREATE TABLE IF NOT EXISTS petugas_penagihan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  jabatan VARCHAR(100) DEFAULT 'Petugas Penagihan',
  mitra_id INTEGER REFERENCES mitra(id) ON DELETE SET NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Debitur table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_aktif ON petugas_penagihan(aktif) WHERE aktif = TRUE;
CREATE INDEX IF NOT EXISTS idx_petugas_penagihan_nama ON petugas_penagihan(nama);
CREATE INDEX IF NOT EXISTS idx_debitur_nama ON debitur(nama);
CREATE INDEX IF NOT EXISTS idx_debitur_no_kontrak ON debitur(no_kontrak);
CREATE INDEX IF NOT EXISTS idx_debitur_status ON debitur(status);
```

### Option B: Using Supabase CLI

Install Supabase CLI:
```bash
npm install -g supabase
```

Link your project:
```bash
supabase link --project-ref your-project-ref
```

Apply migrations:
```bash
supabase db push
```

## Step 5: Enable Row Level Security (RLS)

For production, enable RLS on your tables:

1. Go to **Authentication > Policies** in Supabase dashboard
2. Create policies for each table based on your security requirements

Example policies:

```sql
-- Enable RLS
ALTER TABLE petugas_penagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE debitur ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitra ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (for public access)
CREATE POLICY "Allow read access to petugas_penagihan" ON petugas_penagihan
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to debitur" ON debitur
  FOR SELECT USING (true);

-- Allow insert, update, delete for authenticated users
CREATE POLICY "Allow insert petugas_penagihan" ON petugas_penagihan
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update petugas_penagihan" ON petugas_penagihan
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete petugas_penagihan" ON petugas_penagihan
  FOR DELETE USING (true);

CREATE POLICY "Allow insert debitur" ON debitur
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update debitur" ON debitur
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete debitur" ON debitur
  FOR DELETE USING (true);
```

For production, you should create more restrictive policies based on user roles.

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Run the Application

```bash
npm run dev
```

## Step 8: Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [https://vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

## Database Schema Reference

### petugas_penagihan
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nama | VARCHAR(255) | Nama petugas |
| nik | VARCHAR(16) | NIK otomatis (unique) |
| jabatan | VARCHAR(100) | Jabatan petugas |
| mitra_id | INTEGER | Reference to mitra |
| aktif | BOOLEAN | Status aktif/tidak |
| created_at | TIMESTAMP | Waktu pembuatan |

### debitur
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nama | VARCHAR(255) | Nama debitur |
| alamat | TEXT | Alamat debitur |
| no_kontrak | VARCHAR(100) | Nomor kontrak (unique) |
| no_ktp | VARCHAR(50) | Nomor KTP |
| telepon | VARCHAR(20) | Nomor telepon |
| email | VARCHAR(255) | Email |
| status | VARCHAR(20) | Status: aktif, lunas, macet |
| mitra_id | INTEGER | Reference to mitra |
| petugas_id | INTEGER | Reference to petugas_penagihan |
| created_at | TIMESTAMP | Waktu pembuatan |

### mitra
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| nama | VARCHAR(255) | Nama mitra |
| legalitas | VARCHAR(100) | Nomor legalitas |
| alamat | TEXT | Alamat mitra |
| pic | VARCHAR(255) | Penanggung jawab |
| created_at | TIMESTAMP | Waktu pembuatan |

## Features

### Petugas Penagihan
- ✅ Automatic NIK generation for each petugas
- ✅ Dropdown selection with search
- ✅ Add new petugas via modal
- ✅ View petugas details (NIK, jabatan)
- ✅ Integration with Supabase

### Debitur Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Search functionality
- ✅ Form validation
- ✅ Status management (aktif, lunas, macet)
- ✅ Association with petugas penagihan
- ✅ Integration with Supabase

## Security Notes

1. **For Production**: Always enable RLS and create proper policies
2. **Environment Variables**: Never commit `.env` files to version control
3. **Rate Limiting**: Consider adding rate limiting for public APIs
4. **Authentication**: For sensitive operations, implement user authentication

## Troubleshooting

### Connection Issues
- Verify your `.env` variables are correct
- Check if the Supabase project is running
- Ensure CORS settings in Supabase allow your domain

### Database Issues
- Check SQL syntax for errors
- Verify table names and column types
- Ensure foreign key references are valid

### Deployment Issues
- Make sure all environment variables are set in Vercel
- Check build logs for errors
- Ensure Supabase URL is accessible from Vercel

## Support

For issues with this setup, please refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
