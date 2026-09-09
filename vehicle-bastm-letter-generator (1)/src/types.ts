export type VehicleType = "roda2" | "roda4";

export interface LampiranData {
  ktp: string[];
  stnk: string[];
}

export type KopAlign = "left" | "center" | "right";

export interface KopSurat {
  image: string; // dataURL, "" = belum diupload
  width: number; // mm
  offsetX: number; // mm (+ ke kanan)
  offsetY: number; // mm (+ ke bawah)
  align: KopAlign;
  garis: boolean; // garis ganda di bawah kop
  semuaHalaman: boolean;
  kontenY: number; // mm, geser isi surat naik (-) / turun (+)
  kontenY2: number; // mm, khusus halaman 2
}

/**
 * Isian yang hanya dipakai Surat Tugas.
 * Semua data lain (debitur, kendaraan, tanggal, nomor perjanjian, mitra, …)
 * berada di level atas BastData dan dipakai bersama oleh semua dokumen —
 * jadi satu isian saja untuk seluruh surat.
 */
export interface SuratTugasData {
  nomor: string; // nomor Surat Tugas — juga dicetak di kaki BAST
  pemberiNama: string;
  pemberiJabatan: string;
  petugasNama: string;
  petugasNik: string;
  petugasJabatan: string;
  jatuhTempo: string;
  noAngsuran: string; // nomor / urutan angsuran yang menunggak
  angsuran: string; // angka saja, dicetak "Rp. 652.000"
  totalAngsuran: string; // angka saja, total tagihan
  denda: string; // angka saja
  berlakuDari: string;
  berlakuSampai: string;
  kota: string;
}

export type CheckState = "" | "A" | "TA";

export interface ChecklistEntry {
  p1: CheckState;
  k1: string;
  p2: CheckState;
  k2: string;
}

export type ChecklistMap = Record<string, ChecklistEntry>;

export interface BastData {
  jenis: VehicleType;

  /* Tanggal dokumen — satu isian untuk Surat Tugas & BAST */
  tanggalISO: string; // yyyy-mm-dd

  /* Identitas perusahaan (kreditur / penerima kendaraan) */
  perusahaan: string;
  cabang: string;
  alamat: string;

  /* Nomor dokumen */
  noBast: string;
  hariTanggal: string; // teks bebas, kosong = auto dari tanggalISO
  noPerjanjian: string; // No. Kontrak = No. Perjanjian Pembiayaan
  tglPerjanjian: string;

  /* Debitur / nasabah */
  namaDebitur: string;
  kecamatan: string; // kecamatan debitur — dipakai di nama file PDF
  alamatDebitur: string; // alamat nasabah, dicetak di Surat Tugas
  bpkbAtasNama: string;

  /* Catatan kreditur */
  kreditur: string;
  catatanKreditur: string; // kosong = otomatis dari nama kreditur
  tampilkanCatatanBast: boolean;
  tampilkanCatatanPenyerahan: boolean;

  /* Perusahaan mitra (pelaksana penagihan/penarikan) */
  mitraNama: string; // juga jadi "Manajemen …" di Surat Tugas
  mitraLegalitas: string; // Nomor AHU / izin
  mitraAlamat: string;
  mitraPic: string; // penanggung jawab lapangan
  tampilkanMitraBast: boolean;
  mitraSebagaiPenerima: boolean; // nama mitra dicetak di kolom "Yang Menerima"

  /* Kendaraan */
  merekType: string;
  noRangka: string;
  noMesin: string;
  noPolisi: string;
  warna: string;
  tahun: string;

  /* Tanda tangan */
  ttdBertandatangan: string;
  ttdMenerima1: string;
  ttdMenyerahkan: string;
  ttdMenerima2: string;

  /* Opsi */
  penyelesaian: "YA" | "TIDAK" | "";
  karoseri: "Termasuk" | "Tidak Termasuk" | "";
  labelMesinBenar: boolean;

  checklist: ChecklistMap;

  /* Lampiran dokumen */
  lampiran: LampiranData;

  /* Kop surat & isian khusus Surat Tugas */
  kop: KopSurat;
  st: SuratTugasData;
}
