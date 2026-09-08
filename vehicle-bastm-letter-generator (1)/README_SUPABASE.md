# Supabase Database Integration for Generator Surat Tugas

## New Features Added

This update adds comprehensive database integration for managing:

1. **Petugas Penagihan (Collection Officers)**
   - Automatic NIK generation for each petugas
   - Dropdown selection with search
   - Easy management via Supabase

2. **Debitur (Debtors)**
   - Full CRUD operations
   - Search and filter functionality
   - Status tracking (aktif, lunas, macet)
   - Association with petugas

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase Database
- Create a project at [supabase.com](https://supabase.com)
- Run the SQL from `scripts/init-supabase.sql`
- Copy your project URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Run the App
```bash
npm run dev
```

### 5. Deploy to Vercel
- Push to Git
- Import to Vercel
- Add environment variables
- Deploy!

## Documentation

- 📖 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Detailed setup guide
- 📖 [DATABASE_INTEGRATION.md](./DATABASE_INTEGRATION.md) - Integration details
- 📖 [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Complete summary

## Usage

### Petugas Dropdown
In Surat Tugas form, use the dropdown to select a petugas. The NIK will automatically appear.

### Debitur Management
Go to "Manajemen Debitur" module to:
- Add, edit, delete debitur
- Search debitur
- Assign petugas to debitur
- Auto-populate form data

## Support

For help with setup or issues:
1. Check the documentation files above
2. Refer to Supabase docs: [supabase.com/docs](https://supabase.com/docs)
3. Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
