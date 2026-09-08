import { useState, useCallback } from 'react'
import type { BastData } from '../types'
import { MODULE_BY_ID } from '../lib/modules'
import ModuleLayout from '../components/ModuleLayout'
import DebiturForm from '../components/forms/DebiturForm'
import type { ModulePageProps } from '../components/forms/formkit'

/**
 * Modul Manajemen Debitur — untuk mengelola data debitur dan petugas penagihan
 * dengan integrasi Supabase.
 */
export default function DebiturModule({
  data,
  set,
  issues,
  onGotoField,
  onRoute,
}: ModulePageProps & { onRoute: (route: string) => void }) {
  const [selectedDebiturId, setSelectedDebiturId] = useState<number | null>(null)

  // Handle debitur selection - update form data
  const handleDebiturSelected = useCallback((debitur: Partial<{ nama: string; alamat: string; no_kontrak: string }>) => {
    if (debitur.nama) {
      set('namaDebitur', debitur.nama)
    }
    if (debitur.alamat) {
      // Only set if current alamat is empty
      if (!data.alamat.trim()) {
        set('alamat', debitur.alamat)
      }
    }
    if (debitur.no_kontrak) {
      set('noPerjanjian', debitur.no_kontrak)
    }
    
    // Also update Surat Tugas data
    if (debitur.nama) {
      set('st', { ...data.st, nasabahNama: debitur.nama })
    }
    if (debitur.no_kontrak) {
      set('st', { ...data.st, noKontrak: debitur.no_kontrak })
    }
    if (debitur.alamat) {
      set('st', { ...data.st, nasabahAlamat: debitur.alamat })
    }
  }, [data, set])

  return (
    <ModuleLayout
      meta={MODULE_BY_ID.debitur}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={
        <DebiturForm
          onDebiturSelected={handleDebiturSelected}
          selectedDebiturId={selectedDebiturId}
        />
      }
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          Manajemen Data
        </span>
      }
    >
      <div className="p-4 text-center text-slate-400">
        <p className="text-sm">
          Pilih debitur dari daftar atau tambahkan debitur baru. 
          Data debitur yang dipilih akan otomatis diisi ke form Data Umum dan Surat Tugas.
        </p>
      </div>
    </ModuleLayout>
  )
}
