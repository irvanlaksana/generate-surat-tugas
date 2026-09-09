/**
 * Definisi dokumen & bagian form.
 *
 * Semua isian surat berada dalam **satu form** (modul "isian"); data yang
 * dipakai bersama hanya diisi sekali. Dokumen (Surat Tugas, Surat Penyerahan,
 * BAST, Lampiran) tinggal dipilih di pratinjau untuk dicetak.
 */

export type DocId = "tugas" | "penyerahan" | "bast" | "lampiran";
export type RouteId = "home" | "isian";
/** Dokumen yang sedang dilihat / dicetak di pratinjau. */
export type PreviewTab = "semua" | DocId;

export interface DocMeta {
  id: DocId;
  label: string;
  /** label ringkas khusus untuk menu utama */
  menuLabel?: string;
  short: string;
  icon: string;
  desc: string;
  /** kelas gradient Tailwind (from-… to-…) untuk ubin ikon */
  tile: string;
  /** awalan nama file PDF saat dokumen ini dicetak sendiri */
  filePrefix: string;
}

/** Urutan ini juga dipakai oleh menu, tab pratinjau, dan kartu Beranda. */
export const DOCS: DocMeta[] = [
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
    id: "lampiran",
    label: "Lampiran Dokumen",
    menuLabel: "Lampiran",
    short: "Lampiran",
    icon: "📎",
    desc: "Lampiran foto KTP & STNK debitur dalam satu halaman.",
    tile: "from-sky-500 to-blue-600",
    filePrefix: "LAMPIRAN",
  },
  {
    id: "penyerahan",
    label: "Surat Penyerahan",
    menuLabel: "Penyerahan",
    short: "Penyerahan",
    icon: "🤝",
    desc: "Pernyataan penyerahan kendaraan secara sukarela oleh debitur.",
    tile: "from-emerald-500 to-teal-600",
    filePrefix: "SP",
  },
  {
    id: "bast",
    label: "BAST Kendaraan",
    menuLabel: "BASTK",
    short: "BASTK",
    icon: "📄",
    desc: "Berita Acara Serah Terima Kendaraan Bermotor + checklist perlengkapan.",
    tile: "from-amber-500 to-orange-600",
    filePrefix: "BAST",
  },
];

export const DOC_BY_ID: Record<DocId, DocMeta> = {
  tugas: DOCS[0],
  lampiran: DOCS[1],
  penyerahan: DOCS[2],
  bast: DOCS[3],
};

/* ------------------------------------------------------------------ */
/* Bagian (grup) di dalam satu form isian                              */
/* ------------------------------------------------------------------ */

export type SectionId =
  | "debitur"
  | "perjanjian"
  | "kendaraan"
  | "petugas"
  | "nomor"
  | "kreditur"
  | "perusahaan"
  | "checklist"
  | "opsi"
  | "lampiran";

export interface SectionMeta {
  id: SectionId;
  label: string;
  hint: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: "debitur", label: "Debitur", hint: "jenis kendaraan & identitas debitur" },
  { id: "perjanjian", label: "Perjanjian & Tagihan", hint: "kontrak, angsuran, denda" },
  { id: "kendaraan", label: "Data Kendaraan", hint: "sesuai STNK / BPKB" },
  { id: "petugas", label: "Petugas & Pemberi Tugas", hint: "pelaksana lapangan" },
  { id: "nomor", label: "Nomor, Tanggal & Masa Berlaku", hint: "Surat Tugas & BAST" },
  { id: "kreditur", label: "Kreditur & Mitra", hint: "pemilik piutang & pelaksana" },
  { id: "perusahaan", label: "Perusahaan & Kop Surat", hint: "kop teks & gambar" },
  { id: "checklist", label: "Checklist Perlengkapan", hint: "tabel BAST" },
  { id: "opsi", label: "Opsi & Tanda Tangan", hint: "kalimat cetak & kolom TTD" },
  { id: "lampiran", label: "Lampiran Foto", hint: "KTP & STNK" },
];

/** Peta field → bagian form, dipakai tombol "perbaiki" & navigasi antar grup. */
const SECTION_OF: Record<string, SectionId> = {
  /* Debitur */
  jenis: "debitur",
  namaDebitur: "debitur",
  kecamatan: "debitur",
  alamatDebitur: "debitur",

  /* Perjanjian & tagihan */
  noPerjanjian: "perjanjian",
  tglPerjanjian: "perjanjian",
  "st.jatuhTempo": "perjanjian",
  "st.noAngsuran": "perjanjian",
  "st.angsuran": "perjanjian",
  "st.totalAngsuran": "perjanjian",
  "st.denda": "perjanjian",

  /* Kendaraan */
  merekType: "kendaraan",
  noRangka: "kendaraan",
  noMesin: "kendaraan",
  noPolisi: "kendaraan",
  warna: "kendaraan",
  tahun: "kendaraan",
  bpkbAtasNama: "kendaraan",

  /* Petugas */
  "st.petugasNama": "petugas",
  "st.petugasNik": "petugas",
  "st.petugasJabatan": "petugas",
  "st.pemberiNama": "petugas",
  "st.pemberiJabatan": "petugas",

  /* Nomor, tanggal & masa berlaku */
  "st.nomor": "nomor",
  tanggalISO: "nomor",
  noBast: "nomor",
  hariTanggal: "nomor",
  "st.berlakuDari": "nomor",
  "st.berlakuSampai": "nomor",
  "st.kota": "nomor",

  /* Kreditur & mitra */
  kreditur: "kreditur",
  catatanKreditur: "kreditur",
  mitraNama: "kreditur",
  mitraLegalitas: "kreditur",
  mitraAlamat: "kreditur",
  mitraPic: "kreditur",

  /* Perusahaan & kop */
  perusahaan: "perusahaan",
  cabang: "perusahaan",
  alamat: "perusahaan",

  /* Opsi & tanda tangan */
  penyelesaian: "opsi",
  karoseri: "opsi",
  labelMesinBenar: "opsi",
  tampilkanCatatanBast: "opsi",
  tampilkanCatatanPenyerahan: "opsi",
  tampilkanMitraBast: "opsi",
  mitraSebagaiPenerima: "opsi",
  ttdBertandatangan: "opsi",
  ttdMenerima1: "opsi",
  ttdMenyerahkan: "opsi",
  ttdMenerima2: "opsi",

  /* Checklist & lampiran */
  checklist: "checklist",
};

/** Bagian form tempat sebuah field diedit. */
export function sectionOf(path: string): SectionId {
  if (SECTION_OF[path]) return SECTION_OF[path];
  if (path.startsWith("kop")) return "perusahaan";
  if (path.startsWith("lampiran")) return "lampiran";
  if (path.startsWith("st.")) return "nomor";
  return "debitur";
}

/** id HTML anchor tiap bagian form. */
export const sectionAnchor = (id: SectionId): string => `bagian-${id}`;
