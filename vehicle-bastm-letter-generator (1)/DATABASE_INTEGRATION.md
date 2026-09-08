# Database Integration Guide - Petugas Penagihan & Debitur

## Overview

This implementation adds comprehensive database integration for **Petugas Penagihan** (Collection Officers) and **Debitur** (Debtors) management using **Supabase** with automatic **NIK** (Employee ID) generation.

## Features Implemented

### 1. Petugas Penagihan Management
- ✅ **Automatic NIK Generation**: Each petugas gets a unique 16-digit NIK automatically generated from their name
- ✅ **Dropdown Selection**: Easy selection of petugas with search functionality
- ✅ **NIK Display**: Automatically displays the NIK when a petugas is selected
- ✅ **Add New Petugas**: Modal dialog for adding new petugas
- ✅ **Supabase Integration**: All data stored and retrieved from Supabase

### 2. Debitur Management
- ✅ **Full CRUD Operations**: Create, Read, Update, Delete debitur records
- ✅ **Search Functionality**: Search by name, contract number, or KTP number
- ✅ **Status Management**: Track debitur status (aktif, lunas, macet)
- ✅ **Petugas Assignment**: Assign petugas to each debitur
- ✅ **Form Integration**: Selected debitur data automatically populates form fields

### 3. Supabase & Vercel Integration
- ✅ **Environment Configuration**: Ready for Vercel deployment
- ✅ **Type-Safe Database Access**: TypeScript interfaces for all database tables
- ✅ **Error Handling**: Comprehensive error handling for database operations

## Files Created/Modified

### New Files Created:

1. **`src/lib/supabase.ts`** - Supabase client and database functions
   - Database types (PetugasPenagihan, Debitur, Mitra)
   - CRUD operations for petugas and debitur
   - NIK generation function

2. **`src/components/ui/PetugasDropdown.tsx`** - Dropdown component with automatic NIK
   - Search functionality
   - Add new petugas modal
   - NIK display

3. **`src/components/forms/DebiturForm.tsx`** - Complete debitur management form
   - List view with search
   - Add/Edit/Delete functionality
   - Status management

4. **`src/modules/DebiturModule.tsx`** - New module for debitur management
   - Integrated with existing module system
   - Auto-populates form data

5. **`SUPABASE_SETUP.md`** - Comprehensive setup guide

6. **`.env.example`** - Environment variable template

### Modified Files:

1. **`src/App.tsx`** - Added DebiturModule to the app
2. **`src/lib/modules.ts`** - Added debitur module definition
3. **`src/components/forms/SuratTugasForm.tsx`** - Integrated PetugasDropdown
4. **`package.json`** - Added @supabase/supabase-js dependency

## Usage

### Petugas Dropdown in Forms

```tsx
import { PetugasDropdown } from '../components/ui/PetugasDropdown'

// In your form component:
<PetugasDropdown
  value={data.st.petugasNama}
  onChange={(nama, nik) => {
    st("petugasNama", nama)
    if (nik) {
      st("petugasNik", nik)
    }
  }}
/>
```

### Debitur Management

The DebiturModule is accessible from the sidebar. It provides:
- Full list of debitur with search
- Add new debitur functionality
- Edit existing debitur
- Delete debitur
- Automatic data population to other forms

## Database Schema

### petugas_penagihan
```sql
CREATE TABLE petugas_penagihan (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(16) UNIQUE NOT NULL,
  jabatan VARCHAR(100) DEFAULT 'Petugas Penagihan',
  mitra_id INTEGER REFERENCES mitra(id) ON DELETE SET NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### debitur
```sql
CREATE TABLE debitur (
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
```

### mitra (optional)
```sql
CREATE TABLE mitra (
  id SERIAL PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  legalitas VARCHAR(100),
  alamat TEXT,
  pic VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## NIK Generation Algorithm

The NIK is generated using a simple hash function:

```typescript
function generateNIK(nama: string): string {
  const timestamp = Date.now().toString()
  const combined = nama.toUpperCase() + timestamp
  
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  const nik = Math.abs(hash).toString().padStart(16, '0').slice(0, 16)
  return nik
}
```

This ensures:
- Each petugas gets a unique NIK
- NIK is always 16 digits
- NIK is deterministic but unique due to timestamp

## Deployment to Vercel

### Step 1: Set Up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema (from `SUPABASE_SETUP.md`)
3. Get your project URL and anon key

### Step 2: Configure Environment Variables
In Vercel project settings, add:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Step 3: Deploy
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to Vercel
git push origin main
```

## Security Considerations

### For Development
- RLS (Row Level Security) is disabled by default for easier development
- All users can read/write data

### For Production
- **Enable RLS** on all tables
- Create proper policies based on user roles
- Consider implementing authentication
- Use environment variables for sensitive data

Example secure policy:
```sql
-- Only allow authenticated users to access
CREATE POLICY "Allow authenticated access to petugas" ON petugas_penagihan
  FOR ALL USING (auth.uid() IS NOT NULL);
```

## API Functions Available

### Petugas Penagihan
- `fetchPetugasPenagihan()`: Get all active petugas
- `addPetugas(petugas)`: Add new petugas
- `updatePetugas(id, petugas)`: Update existing petugas
- `deletePetugas(id)`: Soft delete petugas
- `generateNIK(nama)`: Generate unique NIK

### Debitur
- `fetchDebitur()`: Get all debitur
- `fetchDebiturById(id)`: Get single debitur
- `addDebitur(debitur)`: Add new debitur
- `updateDebitur(id, debitur)`: Update existing debitur
- `deleteDebitur(id)`: Delete debitur

## Integration with Existing System

The implementation integrates seamlessly with the existing codebase:

1. **Module System**: DebiturModule follows the same pattern as other modules
2. **UI Components**: Uses existing UI components (Btn, Field, Grid, etc.)
3. **Type Safety**: All types are properly defined with TypeScript
4. **State Management**: Uses the same state management pattern

## Testing the Implementation

1. **Development Mode**:
   ```bash
   npm run dev
   ```
   - Navigate to "Manajemen Debitur" module
   - Add some petugas and debitur
   - Test the dropdown in Surat Tugas form

2. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

## Future Enhancements

1. **Authentication**: Add user login with Supabase Auth
2. **Data Export**: Export debitur data to CSV/Excel
3. **Advanced Filtering**: More filtering options for debitur list
4. **Bulk Operations**: Bulk import/export of data
5. **Audit Trail**: Track changes to data
6. **Reporting**: Generate reports from debitur data

## Support

For issues or questions:
- Check `SUPABASE_SETUP.md` for detailed setup instructions
- Refer to [Supabase Documentation](https://supabase.com/docs)
- Check [Vercel Documentation](https://vercel.com/docs)

## License

This implementation is provided as-is and can be used freely in your projects.
