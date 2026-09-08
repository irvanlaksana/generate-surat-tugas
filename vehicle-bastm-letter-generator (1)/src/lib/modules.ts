/**
 * Definisi modul aplikasi.
 * Setiap dokumen (Surat Tugas, Surat Penyerahan, BAST, Lampiran) menjadi
 * modul terpisah dengan form & pratinjau masing-masing, sementara Data Umum
 * menampung data yang dipakai bersama.
 */

export type ModuleId = "umum" | "tugas" | "penyerahan" | "bast" | "lampiran" | "debitur";
export type RouteId = "home" | ModuleId;

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  /** nama pendek untuk chip / tanda kecil */
  short: string;
  icon: string;
  desc: string;
  /** kelas gradient Tailwind (from-… to-…) untuk ubin ikon */
  tile: string;
  /** awalan nama file PDF saat dicetak dari modul ini */
  filePrefix: string;
}

export const MODULES: ModuleMeta[] = [
  {
    id: "umum",
    label: "Data Umum",
    short: "Data Umum",
    icon: "🗂️",
    desc: "Data debitur, kendaraan, kreditur, mitra, identitas perusahaan, & kop surat — dipakai bersama semua dokumen.",
    tile: "from-slate-500 to-slate-700",
    filePrefix: "",
  },
  {
    id: "tugas",
    label: "Surat Tugas",
    short: "Surat Tugas",
    icon: "📝",
    desc: "Surat tugas penagihan untuk petugas lapangan — 2 halaman berkop surat.",
    tile: "from-indigo-500 to-violet-600",
    filePrefix: "ST",
  },
  {
    id: "penyerahan",
    label: "Surat Penyerahan",
    short: "Penyerahan",
    icon: "🤝",
    desc: "Pernyataan penyerahan kendaraan secara sukarela oleh debitur.",
    tile: "from-emerald-500 to-teal-600",
    filePrefix: "SP",
  },
  {
    id: "bast",
    label: "BAST Kendaraan",
    short: "BAST",
    icon: "📄",
    desc: "Berita Acara Serah Terima Kendaraan Bermotor + checklist perlengkapan.",
    tile: "from-amber-500 to-orange-600",
    filePrefix: "BAST",
  },
  {
    id: "lampiran",
    label: "Lampiran Dokumen",
    short: "Lampiran",
    icon: "📎",
    desc: "Lampiran foto KTP & STNK debitur dalam satu halaman.",
    tile: "from-sky-500 to-blue-600",
    filePrefix: "LAMPIRAN",
  },
  {
    id: "debitur",
    label: "Manajemen Debitur",
    short: "Debitur",
    icon: "👥",
    desc: "Manajemen data debitur dan petugas penagihan dengan database Supabase.",
    tile: "from-purple-500 to-pink-600",
    filePrefix: "DEBITUR",
  },
];

export const MODULE_BY_ID: Record<ModuleId, ModuleMeta> = {
  umum: MODULES[0],
  tugas: MODULES[1],
  penyerahan: MODULES[2],
  bast: MODULES[3],
  lampiran: MODULES[4],
  debitur: MODULES[5],
};

/**
 * Modul tempat sebuah field terutama diedit — dipakai tombol "perbaiki"
 * untuk berpindah modul saat validasi gagal.
 */
export function fieldOwner(path: string): ModuleId {
  if (path.startsWith("st.")) return "tugas";
  if (path.startsWith("lampiran")) return "lampiran";
  if (path.startsWith("kop")) return "umum";
  switch (path) {
    case "noBast":
    case "tanggalBast":
    case "hariTanggal":
    case "noSuratTugas":
    case "penyelesaian":
    case "karoseri":
    case "labelMesinBenar":
    case "tampilkanCatatanBast":
    case "tampilkanMitraBast":
    case "mitraSebagaiPenerima":
    case "ttdBertandatangan":
    case "ttdMenerima1":
    case "ttdMenyerahkan":
    case "ttdMenerima2":
    case "checklist":
      return "bast";
    case "tampilkanCatatanPenyerahan":
      return "penyerahan";
    default:
      return "umum";
  }
}
