import { useState, useEffect, useCallback, useRef } from 'react'
import type { PetugasPenagihan } from '../../lib/supabase'
import {
  fetchPetugasPenagihan,
  addPetugas,
  generateNIK,
  getStorageMode,
} from '../../lib/supabase'

interface PetugasDropdownProps {
  value: string
  onChange: (value: string, nik?: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Button component matching the existing UI style
 */
function Btn({
  children,
  variant = "ghost",
  className = "",
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "dark";
}) {
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    ghost: "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
  };
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Dropdown component for selecting Petugas Penagihan with automatic NIK assignment.
 * Each petugas has their own unique NIK. Data tersimpan permanen di browser
 * (localStorage) atau ke Supabase bila dikonfigurasi.
 */
export function PetugasDropdown({ value, onChange, disabled, className }: PetugasDropdownProps) {
  const [petugasList, setPetugasList] = useState<PetugasPenagihan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPetugas, setNewPetugas] = useState({ nama: '', jabatan: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [loadError, setLoadError] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Fetch petugas data
  const loadPetugas = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchPetugasPenagihan()
      setPetugasList(data)
      setLoadError('')
    } catch (error) {
      console.error('Failed to load petugas:', error)
      setLoadError('Gagal memuat daftar petugas.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPetugas()
  }, [loadPetugas])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle selection change
  const handleSelect = (petugas: PetugasPenagihan) => {
    onChange(petugas.nama, petugas.nik)
    setIsOpen(false)
  }

  // Add new petugas
  const handleAddPetugas = async () => {
    if (!newPetugas.nama.trim() || isSaving) return

    setIsSaving(true)
    setErrorMsg('')
    try {
      const result = await addPetugas({
        nama: newPetugas.nama,
        jabatan: newPetugas.jabatan || 'Petugas Penagihan',
        mitra_id: null,
        aktif: true,
      })
      // Update local state & pilih petugas baru
      setPetugasList((prev) =>
        [...prev, result].sort((a, b) => a.nama.localeCompare(b.nama)),
      )
      onChange(result.nama, result.nik)
      setNewPetugas({ nama: '', jabatan: '' })
      setErrorMsg('')
      setIsDialogOpen(false)
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan petugas. Silakan coba lagi.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  // Find NIK for current value
  const getNIKForNama = (nama: string): string | undefined => {
    const petugas = petugasList.find((p) => p.nama === nama)
    return petugas?.nik
  }

  // Filter petugas based on search
  const [searchQuery, setSearchQuery] = useState('')
  const filteredPetugas = petugasList.filter(
    (petugas) =>
      petugas.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      petugas.nik.includes(searchQuery),
  )

  const storageMode = getStorageMode()

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      {/* Dropdown Trigger */}
      <div className="flex gap-1">
        <button
          type="button"
          disabled={isLoading || disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex-1 flex items-center justify-between rounded-md border bg-white px-2 py-[3px] text-[12px] leading-[1.35] text-slate-800 outline-none transition placeholder:text-slate-300 ${
            isLoading || disabled
              ? 'border-slate-200 cursor-not-allowed opacity-50'
              : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300'
          }`}
        >
          <span className="truncate">
            {isLoading
              ? 'Memuat...'
              : value || 'Pilih Petugas Penagihan'}
          </span>
          <span className="text-slate-400 ml-1">▼</span>
        </button>

        <Btn
          type="button"
          variant="ghost"
          onClick={() => {
            setErrorMsg('')
            setIsDialogOpen(true)
          }}
          disabled={disabled}
          className="shrink-0 text-[10px] px-1.5 py-[1px]"
        >
          + Tambah
        </Btn>
      </div>

      {/* Display NIK if available */}
      {value && getNIKForNama(value) && (
        <div className="mt-[1px] text-[9.5px] font-medium text-slate-400">
          NIK: <span className="font-mono">{getNIKForNama(value)}</span>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {/* Search */}
          <div className="p-1 border-b border-slate-100">
            <input
              type="text"
              placeholder="Cari petugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded-md focus:border-indigo-400 focus:outline-none"
              autoFocus
            />
          </div>

          {/* Petugas List */}
          <div className="max-h-60 overflow-y-auto py-1">
            {loadError ? (
              <div className="px-3 py-2">
                <p className="text-[11px] text-rose-600">{loadError}</p>
                <button
                  type="button"
                  onClick={loadPetugas}
                  className="mt-1 text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  Muat ulang
                </button>
              </div>
            ) : filteredPetugas.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-400">
                Tidak ada petugas — klik “+ Tambah” untuk menambahkan.
              </div>
            ) : (
              filteredPetugas.map((petugas) => (
                <button
                  key={petugas.id}
                  type="button"
                  onClick={() => handleSelect(petugas)}
                  className={`w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50 transition ${
                    value === petugas.nama ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{petugas.nama}</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      NIK: {petugas.nik} - {petugas.jabatan}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Petugas Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Tambah Petugas Penagihan</h3>
              <p className="text-sm text-slate-500">NIK akan digenerate otomatis</p>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Nama Petugas
                </label>
                <input
                  type="text"
                  value={newPetugas.nama}
                  onChange={(e) => setNewPetugas((prev) => ({ ...prev, nama: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPetugas()
                  }}
                  placeholder="Nama petugas"
                  disabled={isSaving}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Jabatan
                </label>
                <input
                  type="text"
                  value={newPetugas.jabatan}
                  onChange={(e) => setNewPetugas((prev) => ({ ...prev, jabatan: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddPetugas()
                  }}
                  placeholder="Petugas Penagihan"
                  disabled={isSaving}
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div className="text-xs text-slate-400">
                NIK yang akan digenerate:{' '}
                <span className="font-mono font-medium">
                  {generateNIK(newPetugas.nama || 'NEW')}
                </span>
              </div>

              {errorMsg && (
                <div className="rounded-md bg-rose-50 px-3 py-2 text-[11px] leading-snug text-rose-700 ring-1 ring-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="text-[10px] text-slate-400">
                {storageMode === 'supabase'
                  ? '💾 Tersimpan ke database Supabase'
                  : '💾 Tersimpan permanen di browser ini (penyimpanan lokal)'}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
              <Btn
                variant="ghost"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="text-[11px]"
              >
                Batal
              </Btn>
              <Btn
                variant="primary"
                onClick={handleAddPetugas}
                disabled={!newPetugas.nama.trim() || isSaving}
                className="text-[11px]"
              >
                {isSaving ? 'Menyimpan…' : 'Simpan'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PetugasDropdown
