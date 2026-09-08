import type { BastData } from "../types";
import { hariTanggal } from "./format";

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  /** kunci data, mis. "namaDebitur" atau "st.nomor" → dipakai untuk fokus field */
  path: string;
  label: string;
  message: string;
  level: IssueLevel;
}

/** Ambil nilai string dari data, termasuk path bertingkat "st.nomor". */
function valueOf(data: BastData, path: string): string {
  if (path.startsWith("st.")) {
    const v = data.st[path.slice(3) as keyof BastData["st"]];
    return typeof v === "string" ? v : "";
  }
  const v = (data as unknown as Record<string, unknown>)[path];
  return typeof v === "string" ? v : "";
}

/** Field wajib: [path, label] */
const REQUIRED: [string, string][] = [
  ["noBast", "No. BAST"],
  ["tanggalBast", "Tanggal BAST"],
  ["noPerjanjian", "No. Perjanjian"],
  ["namaDebitur", "Nama Debitur"],
  ["kecamatan", "Kecamatan"],
  ["merekType", "Merk / Type kendaraan"],
  ["noPolisi", "No. Polisi"],
  ["mitraNama", "Nama perusahaan mitra"],
  ["st.nomor", "Nomor Surat"],
  ["st.petugasNama", "Petugas Surat Tugas"],
  ["st.nasabahNama", "Nama nasabah Surat Tugas"],
  ["st.tanggalSuratISO", "Tanggal Surat Tugas"],
];

/** Field yang sebaiknya ada, tapi tidak menghalangi cetak: [path, label, pesan] */
const RECOMMENDED: [string, string, string][] = [
  ["noSuratTugas", "No. Surat Tugas", "dicetak di kaki BAST"],
  ["tglPerjanjian", "Tgl. Perjanjian", "masih kosong"],
  ["bpkbAtasNama", "STNK/BPKB a/n", "masih kosong"],
  ["st.noKontrak", "No. Kontrak", "masih kosong"],
  ["st.noAngsuran", "No. Angsuran", "masih kosong"],
  ["kop.image", "Kop surat", "belum diupload"],
  ["lampiran.ktp", "Foto KTP", "belum ada"],
  ["lampiran.stnk", "Foto STNK", "belum ada"],
];

export function validateData(data: BastData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  /* ---------- wajib ---------- */
  for (const [path, label] of REQUIRED) {
    if (!valueOf(data, path).trim()) {
      issues.push({ path, label, message: "wajib diisi", level: "error" });
    }
  }

  /* ---------- format ---------- */
  if (data.tanggalBast && !hariTanggal(data.tanggalBast)) {
    issues.push({
      path: "tanggalBast",
      label: "Tanggal BAST",
      message: "tanggal tidak valid",
      level: "error",
    });
  }
  if (data.st.tanggalSuratISO && !hariTanggal(data.st.tanggalSuratISO)) {
    issues.push({
      path: "st.tanggalSuratISO",
      label: "Tanggal Surat Tugas",
      message: "tanggal tidak valid",
      level: "error",
    });
  }
  if (data.tahun.trim() && !/^\d{4}$/.test(data.tahun.trim())) {
    issues.push({
      path: "tahun",
      label: "Tahun kendaraan",
      message: "gunakan 4 angka",
      level: "error",
    });
  }
  if (data.st.petugasNik.trim() && !/^\d{16}$/.test(data.st.petugasNik.trim())) {
    issues.push({
      path: "st.petugasNik",
      label: "NIK Petugas",
      message: "gunakan 16 angka",
      level: "error",
    });
  }

  /* ---------- anjuran ---------- */
  for (const [path, label, message] of RECOMMENDED) {
    if (path === "kop.image") {
      if (!data.kop.image) issues.push({ path, label, message, level: "warning" });
      continue;
    }
    if (path === "lampiran.ktp") {
      if (!data.lampiran.ktp.length)
        issues.push({ path, label, message, level: "warning" });
      continue;
    }
    if (path === "lampiran.stnk") {
      if (!data.lampiran.stnk.length)
        issues.push({ path, label, message, level: "warning" });
      continue;
    }
    if (!valueOf(data, path).trim()) {
      issues.push({ path, label, message, level: "warning" });
    }
  }

  return issues;
}

/** Petakan path → pesan (dipakai untuk warna & teks di bawah input). */
export function issueMap(
  issues: ValidationIssue[],
  level: IssueLevel = "error",
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    if (issue.level === level && !map[issue.path]) map[issue.path] = issue.message;
  }
  return map;
}

export function countByLevel(issues: ValidationIssue[]): {
  error: number;
  warning: number;
} {
  let error = 0;
  let warning = 0;
  for (const issue of issues) {
    if (issue.level === "error") error += 1;
    else warning += 1;
  }
  return { error, warning };
}

/** Geser scroll & fokus ke field yang bermasalah. */
export function focusField(path: string): void {
  if (typeof document === "undefined") return;
  const el = document.querySelector<HTMLElement>(
    `[data-field="${CSS.escape(path)}"]`,
  );
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const control = el.querySelector<HTMLElement>(
    "input, textarea, select, button",
  );
  window.setTimeout(() => control?.focus({ preventScroll: true }), 220);
}
