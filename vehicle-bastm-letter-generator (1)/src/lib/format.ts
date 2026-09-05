const BULAN_SINGKAT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AGT",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

const BULAN_PANJANG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function parse(iso: string): Date | null {
  if (!iso) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const parts = iso.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (
    d.getFullYear() !== parts[0] ||
    d.getMonth() !== parts[1] - 1 ||
    d.getDate() !== parts[2]
  ) {
    return null;
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 13-FEB-24 */
export function tglSingkat(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${BULAN_SINGKAT[d.getMonth()]}-${yy}`;
}

/** 13 Februari 2024 */
export function tglPanjang(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${
    BULAN_PANJANG[d.getMonth()]
  } ${d.getFullYear()}`;
}

/** Selasa, 13 Februari 2024 */
export function hariTanggal(iso: string): string {
  const d = parse(iso);
  if (!d) return "";
  return `${HARI[d.getDay()]}, ${tglPanjang(iso)}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(d.getDate()).padStart(2, "0")}`;
}
