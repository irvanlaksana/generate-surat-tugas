import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface PetugasPenagihan {
  id: number
  nama: string
  nik: string
  jabatan: string
  mitra_id: number | null
  aktif: boolean
  created_at: string
}

export interface Debitur {
  id: number
  nama: string
  alamat: string
  no_kontrak: string
  no_ktp: string
  telepon: string
  email: string
  status: 'aktif' | 'lunas' | 'macet'
  mitra_id: number | null
  petugas_id: number | null
  created_at: string
}

export interface Mitra {
  id: number
  nama: string
  legalitas: string
  alamat: string
  pic: string
  created_at: string
}

// Fetch all active petugas penagihan
export async function fetchPetugasPenagihan(): Promise<PetugasPenagihan[]> {
  const { data, error } = await supabase
    .from('petugas_penagihan')
    .select('*')
    .eq('aktif', true)
    .order('nama', { ascending: true })

  if (error) {
    console.error('Error fetching petugas:', error)
    return []
  }
  return data
}

// Fetch all debitur
export async function fetchDebitur(): Promise<Debitur[]> {
  const { data, error } = await supabase
    .from('debitur')
    .select('*')
    .order('nama', { ascending: true })

  if (error) {
    console.error('Error fetching debitur:', error)
    return []
  }
  return data
}

// Fetch single debitur by ID
export async function fetchDebiturById(id: number): Promise<Debitur | null> {
  const { data, error } = await supabase
    .from('debitur')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching debitur:', error)
    return null
  }
  return data
}

// Add new petugas
export async function addPetugas(petugas: Omit<PetugasPenagihan, 'id' | 'created_at'>): Promise<PetugasPenagihan | null> {
  const { data, error } = await supabase
    .from('petugas_penagihan')
    .insert(petugas)
    .select()
    .single()

  if (error) {
    console.error('Error adding petugas:', error)
    return null
  }
  return data
}

// Update petugas
export async function updatePetugas(id: number, petugas: Partial<PetugasPenagihan>): Promise<PetugasPenagihan | null> {
  const { data, error } = await supabase
    .from('petugas_penagihan')
    .update(petugas)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating petugas:', error)
    return null
  }
  return data
}

// Delete petugas (soft delete)
export async function deletePetugas(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('petugas_penagihan')
    .update({ aktif: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting petugas:', error)
    return false
  }
  return true
}

// Add new debitur
export async function addDebitur(debitur: Omit<Debitur, 'id' | 'created_at'>): Promise<Debitur | null> {
  const { data, error } = await supabase
    .from('debitur')
    .insert(debitur)
    .select()
    .single()

  if (error) {
    console.error('Error adding debitur:', error)
    return null
  }
  return data
}

// Update debitur
export async function updateDebitur(id: number, debitur: Partial<Debitur>): Promise<Debitur | null> {
  const { data, error } = await supabase
    .from('debitur')
    .update(debitur)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating debitur:', error)
    return null
  }
  return data
}

// Delete debitur
export async function deleteDebitur(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('debitur')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting debitur:', error)
    return false
  }
  return true
}

// Generate unique NIK for petugas (16 digits)
export function generateNIK(nama: string): string {
  // Simple hash from name + timestamp to generate unique NIK
  const timestamp = Date.now().toString()
  const combined = nama.toUpperCase() + timestamp
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  // Ensure 16 digits
  const nik = Math.abs(hash).toString().padStart(16, '0').slice(0, 16)
  return nik
}
