import { useState, useEffect, useCallback, useRef } from 'react'
import type { Debitur, PetugasPenagihan } from '../../lib/supabase'
import { fetchPetugasPenagihan, fetchDebitur, addDebitur, updateDebitur, deleteDebitur } from '../../lib/supabase'
import { Btn } from '../ui'

interface DebiturFormProps {
  onDebiturSelected?: (debitur: Partial<Debitur>) => void
  selectedDebiturId?: number | null
}

/**
 * Button component for dialog actions
 */
function DialogButton({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-md font-medium transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"

  const variants = {
    primary: "bg-indigo-600 text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    outline: "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    destructive: "bg-rose-600 text-white shadow-sm shadow-rose-200 hover:bg-rose-700",
  }

  const sizes = {
    sm: "h-7 px-2 text-[11px]",
    md: "h-8 px-3 text-[12px]",
    lg: "h-9 px-4 text-[13px]",
  }

  return (
    <button
      {...rest}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
    >
      {children}
    </button>
  )
}

/**
 * Input component for form fields
 */
function FormInput({
  invalid,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`w-full rounded-md border bg-white px-2 py-[3px] text-[12px] leading-[1.35] text-slate-800 outline-none transition placeholder:text-slate-300 ${
        invalid
          ? 'border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
          : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      } ${className || ''}`}
    />
  )
}

/**
 * Select component for dropdowns
 */
function FormSelect({
  value,
  onChange,
  children,
  className,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className || ''}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex-1 flex items-center justify-between rounded-md border bg-white px-2 py-[3px] text-[12px] leading-[1.35] text-slate-800 outline-none transition placeholder:text-slate-300 ${
          disabled
            ? 'border-slate-200 cursor-not-allowed opacity-50'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300'
        }`}
      >
        <span className="truncate">{children || 'Pilih opsi'}</span>
        <span className="text-slate-400 ml-1">▼</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">{children}</div>
        </div>
      )}
    </div>
  )
}

/**
 * Form for managing Debitur data with Supabase integration
 */
export default function DebiturForm({ onDebiturSelected, selectedDebiturId }: DebiturFormProps) {
  const [debiturList, setDebiturList] = useState<Debitur[]>([])
  const [petugasList, setPetugasList] = useState<PetugasPenagihan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Omit<Debitur, 'id' | 'created_at'>> & { id?: number }>({
    nama: '',
    alamat: '',
    no_kontrak: '',
    no_ktp: '',
    telepon: '',
    email: '',
    status: 'aktif' as const,
    mitra_id: null,
    petugas_id: null,
  })
  const [isEditing, setIsEditing] = useState(false)

  // Fetch data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [debitur, petugas] = await Promise.all([
        fetchDebitur(),
        fetchPetugasPenagihan(),
      ])
      setDebiturList(debitur)
      setPetugasList(petugas)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load selected debitur for editing
  useEffect(() => {
    if (selectedDebiturId) {
      const debitur = debiturList.find(d => d.id === selectedDebiturId)
      if (debitur) {
        setFormData({
          id: debitur.id,
          nama: debitur.nama,
          alamat: debitur.alamat,
          no_kontrak: debitur.no_kontrak,
          no_ktp: debitur.no_ktp,
          telepon: debitur.telepon,
          email: debitur.email,
          status: debitur.status,
          mitra_id: debitur.mitra_id,
          petugas_id: debitur.petugas_id,
        })
        setIsEditing(true)
      }
    }
  }, [selectedDebiturId, debiturList])

  // Filter debitur based on search
  const filteredDebitur = debiturList.filter(debitur => 
    debitur.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debitur.no_kontrak.toLowerCase().includes(searchQuery.toLowerCase()) ||
    debitur.no_ktp.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle form input changes
  const handleInputChange = (field: keyof typeof formData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.nama?.trim()) return

    try {
      let result: Debitur | null
      
      if (isEditing && formData.id) {
        // Update existing debitur
        result = await updateDebitur(formData.id, {
          nama: formData.nama?.toUpperCase(),
          alamat: formData.alamat,
          no_kontrak: formData.no_kontrak,
          no_ktp: formData.no_ktp,
          telepon: formData.telepon,
          email: formData.email,
          status: formData.status,
          mitra_id: formData.mitra_id,
          petugas_id: formData.petugas_id,
        })
      } else {
        // Add new debitur
        result = await addDebitur({
          nama: formData.nama?.toUpperCase() || '',
          alamat: formData.alamat || '',
          no_kontrak: formData.no_kontrak || '',
          no_ktp: formData.no_ktp || '',
          telepon: formData.telepon || '',
          email: formData.email || '',
          status: formData.status || 'aktif',
          mitra_id: formData.mitra_id,
          petugas_id: formData.petugas_id,
        })
      }

      if (result) {
        await loadData()
        setIsDialogOpen(false)
        setFormData({
          nama: '',
          alamat: '',
          no_kontrak: '',
          no_ktp: '',
          telepon: '',
          email: '',
          status: 'aktif',
          mitra_id: null,
          petugas_id: null,
        })
        setIsEditing(false)
        
        // Notify parent if a debitur was selected
        if (onDebiturSelected) {
          onDebiturSelected({
            nama: result.nama,
            alamat: result.alamat,
            no_kontrak: result.no_kontrak,
          })
        }
      }
    } catch (error) {
      console.error('Failed to save debitur:', error)
    }
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus debitur ini?')) return
    
    try {
      const success = await deleteDebitur(id)
      if (success) {
        await loadData()
      }
    } catch (error) {
      console.error('Failed to delete debitur:', error)
    }
  }

  // Handle edit
  const handleEdit = (debitur: Debitur) => {
    setFormData({
      id: debitur.id,
      nama: debitur.nama,
      alamat: debitur.alamat,
      no_kontrak: debitur.no_kontrak,
      no_ktp: debitur.no_ktp,
      telepon: debitur.telepon,
      email: debitur.email,
      status: debitur.status,
      mitra_id: debitur.mitra_id,
      petugas_id: debitur.petugas_id,
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  // Handle select debitur
  const handleSelect = (debitur: Debitur) => {
    if (onDebiturSelected) {
      onDebiturSelected({
        nama: debitur.nama,
        alamat: debitur.alamat,
        no_kontrak: debitur.no_kontrak,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex gap-2">
        <FormInput
          type="text"
          placeholder="Cari debitur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Btn
          type="button"
          variant="ghost"
          onClick={() => {
            setIsEditing(false)
            setFormData({
              nama: '',
              alamat: '',
              no_kontrak: '',
              no_ktp: '',
              telepon: '',
              email: '',
              status: 'aktif',
              mitra_id: null,
              petugas_id: null,
            })
            setIsDialogOpen(true)
          }}
        >
          + Tambah Debitur
        </Btn>
      </div>

      {/* Debitur List */}
      <div className="max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400">Memuat...</div>
        ) : filteredDebitur.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            {searchQuery ? 'Tidak ada debitur yang cocok' : 'Tidak ada debitur. Tambahkan terlebih dahulu.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Nama</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">No. Kontrak</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">No. KTP</th>
                <th className="px-3 py-2 text-left font-medium text-slate-500">Status</th>
                <th className="px-3 py-2 text-right font-medium text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebitur.map((debitur) => (
                <tr
                  key={debitur.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleSelect(debitur)}
                >
                  <td className="px-3 py-2 text-slate-800">{debitur.nama}</td>
                  <td className="px-3 py-2 text-slate-600">{debitur.no_kontrak}</td>
                  <td className="px-3 py-2 text-slate-600">{debitur.no_ktp}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      debitur.status === 'aktif' ? 'bg-green-100 text-green-700' :
                      debitur.status === 'lunas' ? 'bg-blue-100 text-blue-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {debitur.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Btn
                        type="button"
                        variant="ghost"
                        onClick={() => handleEdit(debitur)}
                        className="h-6 px-2 text-[10px]"
                      >
                        Edit
                      </Btn>
                      <Btn
                        type="button"
                        variant="ghost"
                        onClick={() => handleDelete(debitur.id)}
                        className="h-6 px-2 text-[10px] text-rose-600 hover:text-rose-700"
                      >
                        Hapus
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
            <div className="px-4 py-3 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Debitur' : 'Tambah Debitur'}
              </h3>
              <p className="text-sm text-slate-500">
                {isEditing ? 'Edit data debitur yang sudah ada' : 'Tambahkan debitur baru ke database'}
              </p>
            </div>
            
            <div className="p-4 grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Nama Debitur
                  </label>
                  <FormInput
                    value={formData.nama || ''}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    placeholder="Nama debitur"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    No. Kontrak
                  </label>
                  <FormInput
                    value={formData.no_kontrak || ''}
                    onChange={(e) => handleInputChange('no_kontrak', e.target.value)}
                    placeholder="No. kontrak"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    No. KTP
                  </label>
                  <FormInput
                    value={formData.no_ktp || ''}
                    onChange={(e) => handleInputChange('no_ktp', e.target.value)}
                    placeholder="No. KTP"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Telepon
                  </label>
                  <FormInput
                    value={formData.telepon || ''}
                    onChange={(e) => handleInputChange('telepon', e.target.value)}
                    placeholder="Telepon"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Email
                  </label>
                  <FormInput
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Email"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Alamat
                  </label>
                  <FormInput
                    value={formData.alamat || ''}
                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                    placeholder="Alamat debitur"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Status
                  </label>
                  <FormSelect
                    value={formData.status || 'aktif'}
                    onChange={(value) => handleInputChange('status', value as 'aktif' | 'lunas' | 'macet')}
                  >
                    <span>
                      {formData.status === 'aktif' ? 'Aktif' : 
                       formData.status === 'lunas' ? 'Lunas' : 'Macet'}
                    </span>
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('status', 'aktif')
                          setIsOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50"
                      >
                        Aktif
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('status', 'lunas')
                          setIsOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50"
                      >
                        Lunas
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('status', 'macet')
                          setIsOpen(false)
                        }}
                        className="w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50"
                      >
                        Macet
                      </button>
                    </div>
                  </FormSelect>
                </div>
                <div>
                  <label className="block text-[9.5px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Petugas Penagihan
                  </label>
                  <FormSelect
                    value={formData.petugas_id?.toString() || ''}
                    onChange={(value) => handleInputChange('petugas_id', value ? parseInt(value) : null)}
                  >
                    <span>
                      {petugasList.find(p => p.id.toString() === formData.petugas_id?.toString())?.nama || 'Pilih petugas'}
                    </span>
                    <div className="py-1">
                      {petugasList.map((petugas) => (
                        <button
                          key={petugas.id}
                          type="button"
                          onClick={() => {
                            handleInputChange('petugas_id', petugas.id)
                            setIsOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left text-[11px] hover:bg-slate-50"
                        >
                          {petugas.nama}
                        </button>
                      ))}
                    </div>
                  </FormSelect>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-3 border-t border-slate-200">
              <DialogButton variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Batal
              </DialogButton>
              <DialogButton
                variant="primary"
                onClick={handleSubmit}
                disabled={!formData.nama?.trim()}
              >
                {isEditing ? 'Simpan Perubahan' : 'Simpan'}
              </DialogButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
