import { useState, useEffect, useCallback, useRef } from 'react'
import type { PetugasPenagihan } from '../../lib/supabase'
import { fetchPetugasPenagihan, addPetugas, generateNIK } from '../../lib/supabase'

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
      className={`inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition active:scale-[0.97] ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Dropdown component for selecting Petugas Penagihan with automatic NIK assignment.
 * Each petugas has their own unique NIK.
 */
export function PetugasDropdown({ value, onChange, disabled, className }: PetugasDropdownProps) {
  const [petugasList, setPetugasList] = useState<PetugasPenagihan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPetugas, setNewPetugas] = useState({ nama: '', jabatan: '' })
  const ref = useRef<HTMLDivElement>(null)

  // Fetch petugas data from Supabase
  const loadPetugas = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchPetugasPenagihan()
      setPetugasList(data)
    } catch (error) {
      console.error('Failed to load petugas:', error)
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
    if (!newPetugas.nama.trim()) return

    try {
      const nik = generateNIK(newPetugas.nama)
      const newData = {
        nama: newPetugas.nama.toUpperCase(),
        nik,
        jabatan: newPetugas.jabatan || 'Petugas Penagihan',
        mitra_id: null,
        aktif: true,
      }

      const result = await addPetugas(newData)
      if (result) {
        // Update local state
        setPetugasList(prev => [...prev, result].sort((a, b) => a.nama.localeCompare(b.nama)))
        // Select the new petugas
        onChange(result.nama, result.nik)
        setNewPetugas({ nama: '', jabatan: '' })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to add petugas:', error)
    }
  }

  // Find NIK for current value
  const getNIKForNama = (nama: string): string | undefined => {
    const petugas = petugasList.find(p => p.nama === nama)
    return petugas?.nik
  }

  // Filter petugas based on search
  const [searchQuery, setSearchQuery] = useState('')
  const filteredPetugas = petugasList.filter(petugas => 
    petugas.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    petugas.nik.includes(searchQuery)
  )

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
            {isLoading ? 'Memuat...' : value || 'Pilih Petugas Penagihan'}
          </span>
          <span className="text-slate-400 ml-1">▼</span>
        </button>
        
        <Btn
          type="button"
          variant="ghost"
          onClick={() => setIsDialogOpen(true)}
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
            {filteredPetugas.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-400">
                Tidak ada petugas
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
          <div
            className="w-full max-w-sm rounded-lg bg-white shadow-xl"
          >
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
                  onChange={(e) => setNewPetugas(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Nama petugas"
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
                  onChange={(e) => setNewPetugas(prev => ({ ...prev, jabatan: e.target.value }))}
                  placeholder="Petugas Penagihan"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[12px] focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              <div className="text-xs text-slate-400">
                NIK yang akan digenerate: <span className="font-mono font-medium">{generateNIK(newPetugas.nama || 'NEW')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
              <Btn variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[11px]">
                Batal
              </Btn>
              <Btn
                variant="primary"
                onClick={handleAddPetugas}
                disabled={!newPetugas.nama.trim()}
                className="text-[11px]"
              >
                Simpan
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PetugasDropdown
