import type { BastData, ChecklistMap, VehicleType } from "../types";
import { allItems } from "./perlengkapan";
import { todayISO } from "../lib/format";
import { KREDITUR_DEFAULT } from "../lib/text";

export function emptyChecklist(jenis: VehicleType): ChecklistMap {
  const map: ChecklistMap = {};
  for (const item of allItems(jenis)) {
    map[item] = { p1: "", k1: "", p2: "", k2: "" };
  }
  return map;
}

/** Pastikan semua item untuk jenis kendaraan tersedia di map checklist. */
export function syncChecklist(jenis: VehicleType, current: ChecklistMap): ChecklistMap {
  const map: ChecklistMap = {};
  for (const item of allItems(jenis)) {
    map[item] = current[item] ?? { p1: "", k1: "", p2: "", k2: "" };
  }
  return map;
}

export const BLANK_DATA: BastData = {
  jenis: "roda4",
  tanggalISO: todayISO(),
  perusahaan: "PT. ADIRA DINAMIKA MULTI FINANCE, Tbk",
  cabang: "BANJARNEGARA-S. PARMAN",
  alamat: "JL JEND SUDIRMAN NO 693, , BANYUMAS",
  noBast: "",
  hariTanggal: "",
  noPerjanjian: "",
  tglPerjanjian: "",
  namaDebitur: "",
  kecamatan: "",
  alamatDebitur: "",
  bpkbAtasNama: "",
  kreditur: KREDITUR_DEFAULT,
  catatanKreditur: "",
  tampilkanCatatanBast: true,
  tampilkanCatatanPenyerahan: true,

  mitraNama: "PT MITRA JASATRIA INDONESIA",
  mitraLegalitas: "AHU-056731.AH.01.01",
  mitraAlamat:
    "JL. Menteri Supeno No. 07, Sokaraja Tengah, Banyumas, Jawa Tengah, 53181",
  mitraPic: "",
  tampilkanMitraBast: true,
  mitraSebagaiPenerima: false,
  merekType: "",
  noRangka: "",
  noMesin: "",
  noPolisi: "",
  warna: "",
  tahun: "",
  ttdBertandatangan: "",
  ttdMenerima1: "",
  ttdMenyerahkan: "",
  ttdMenerima2: "",
  penyelesaian: "",
  karoseri: "",
  labelMesinBenar: false,
  checklist: emptyChecklist("roda4"),
  lampiran: {
    ktp: [],
    stnk: [],
  },
  kop: {
    image: "",
    width: 170,
    offsetX: 0,
    offsetY: 0,
    align: "center",
    garis: true,
    semuaHalaman: false,
    kontenY: 0,
    kontenY2: 0,
  },
  st: {
    nomor: "ST-DC/MJI.KAMM/2026/08/0483",
    pemberiNama: "FILEMO HALAWA",
    pemberiJabatan: "DIREKTUR",
    petugasNama: "DIAN FITRIANINGSIH",
    petugasNik: "3302195408790001",
    petugasJabatan: "Petugas Penagihan",
    jatuhTempo: "23 MARET 2018",
    noAngsuran: "",
    angsuran: "652000",
    totalAngsuran: "11736000",
    denda: "169285000",
    berlakuDari: "29 Agustus 2026",
    berlakuSampai: "31 Agustus 2026",
    kota: "Purwokerto",
  },
};

export const CONTOH_RODA4: BastData = {
  ...BLANK_DATA,
  jenis: "roda4",
  noBast: "12496/BAST/2026",
  tanggalISO: todayISO(),
  hariTanggal: "",
  noPerjanjian: "040424210837",
  tglPerjanjian: "13-FEB-24",
  namaDebitur: "MARYANTO",
  kecamatan: "WANGON",
  alamatDebitur: "PENGADEGAN RT 001 RW 004, PENGADEGAN",
  bpkbAtasNama: "SULASTRI",
  merekType: "HONDA / MINIBUS",
  noRangka: "MHRDD1750PJ407376",
  noMesin: "L12B35431364",
  noPolisi: "R1187UC",
  warna: "MERAH",
  tahun: "2023",
  ttdBertandatangan: "",
  ttdMenerima1: "FILEMO HALAWA",
  ttdMenyerahkan: "FILEMO HALAWA",
  ttdMenerima2: "",
  penyelesaian: "TIDAK",
  karoseri: "Tidak Termasuk",
  checklist: emptyChecklist("roda4"),
  st: { ...BLANK_DATA.st, noAngsuran: "12" },
};

export const CONTOH_RODA2: BastData = {
  ...BLANK_DATA,
  jenis: "roda2",
  noBast: "12497/BAST/2026",
  tanggalISO: todayISO(),
  noPerjanjian: "040424210838",
  tglPerjanjian: "20-MAR-24",
  namaDebitur: "SUPRIYADI",
  kecamatan: "SOKARAJA",
  alamatDebitur: "JL. MERDEKA NO 12, SOKARAJA",
  bpkbAtasNama: "SUPRIYADI",
  merekType: "HONDA / BEAT CBS",
  noRangka: "MH1JM8118MK123456",
  noMesin: "JM81E1234567",
  noPolisi: "R2345UC",
  warna: "HITAM",
  tahun: "2022",
  ttdMenerima1: "FILEMO HALAWA",
  ttdMenyerahkan: "FILEMO HALAWA",
  penyelesaian: "TIDAK",
  karoseri: "Tidak Termasuk",
  checklist: emptyChecklist("roda2"),
  st: { ...BLANK_DATA.st, noAngsuran: "08" },
};
