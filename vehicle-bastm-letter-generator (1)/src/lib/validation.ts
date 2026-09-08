import type { BastData } from "../types";
import { hariTanggal } from "./format";
import type { ModuleId } from "./modules";

export type IssueLevel = "error" | "warning";

export interface ValidationIssue {
  /** kunci data, mis. "namaDebitur" atau "st.nomor" → dipakai untuk fokus field */
  path: string;
  label: string;
  message: string;
  level: IssueLevel;
  /** modul dokumen yang terdampak masalah ini (untuk gerbang cetak per modul) */
  modules: ModuleId[];
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

/** Apakah field kosong / belum ada isinya? */
function isEmpty(data: BastData, path: string): boolean {
  if (path === "kop.image") return !data.kop.image;
  if (path === "lampiran.ktp") return data.lampiran.ktp.length === 0;
  if (path === "lampiran.stnk") return data.lampiran.stnk.length === 0;
  return !valueOf(data, path).trim();
}

interface Rule {
  path: string;
  label: string;
  level: IssueLevel;
  /** modul dokumen yang terdampak bila field ini bermasalah */
  modules: ModuleId[];
  message?: string;
}

const WAJIB = "wajib diisi";

/**
 * Aturan validasi. Field yang sama bisa berdampak ke beberapa modul
 * (mis. No. Perjanjian dipakai Surat Penyerahan dan BAST).
 */
const RULES: Rule[] = [
  /* ---------- wajib ---------- */
  { path: "noBast", label: "No. BAST", level: "error", modules: ["bast"] },
  { path: "tanggalBast", label: "Tanggal BAST", level: "error", modules: ["bast"] },
  {
    path: "noPerjanjian",
    label: "No. Perjanjian",
    level: "error",
    modules: ["penyerahan", "bast"],
  },
  {
    path: "namaDebitur",
    label: "Nama Debitur",
    level: "error",
    modules: ["umum", "bast", "lampiran"],
  },
  {
    path: "namaDebitur",
    label: "Nama Debitur",
    level: "warning",
    modules: ["tugas", "penyerahan"],
    message: "untuk nama file PDF",
  },
  { path: "kecamatan", label: "Kecamatan", level: "error", modules: ["umum"] },
  {
    path: "kecamatan",
    label: "Kecamatan",
    level: "warning",
    modules: ["tugas", "penyerahan", "bast", "lampiran"],
    message: "dipakai di nama file PDF",
  },
  {
    path: "merekType",
    label: "Merk / Type kendaraan",
    level: "error",
    modules: ["umum", "penyerahan", "bast"],
  },
  {
    path: "noPolisi",
    label: "No. Polisi",
    level: "error",
    modules: ["umum", "penyerahan", "bast"],
  },
  {
    path: "mitraNama",
    label: "Nama perusahaan mitra",
    level: "error",
    modules: ["umum", "tugas", "bast"],
  },
  { path: "st.nomor", label: "Nomor Surat", level: "error", modules: ["tugas"] },
  {
    path: "st.petugasNama",
    label: "Petugas Surat Tugas",
    level: "error",
    modules: ["tugas"],
  },
  { path: "st.nasabahNama", label: "Nama nasabah", level: "error", modules: ["tugas"] },
  {
    path: "st.tanggalSuratISO",
    label: "Tanggal Surat",
    level: "error",
    modules: ["tugas"],
  },

  /* ---------- anjuran ---------- */
  {
    path: "noSuratTugas",
    label: "No. Surat Tugas",
    level: "warning",
    modules: ["bast"],
    message: "dicetak di kaki BAST",
  },
  {
    path: "tglPerjanjian",
    label: "Tgl. Perjanjian",
    level: "warning",
    modules: ["penyerahan", "bast"],
    message: "masih kosong",
  },
  {
    path: "bpkbAtasNama",
    label: "STNK/BPKB a/n",
    level: "warning",
    modules: ["penyerahan", "bast"],
    message: "masih kosong",
  },
  {
    path: "st.noKontrak",
    label: "No. Kontrak",
    level: "warning",
    modules: ["tugas"],
    message: "masih kosong",
  },
  {
    path: "st.noAngsuran",
    label: "No. Angsuran",
    level: "warning",
    modules: ["tugas"],
    message: "masih kosong",
  },
  {
    path: "kop.image",
    label: "Kop surat",
    level: "warning",
    modules: ["tugas"],
    message: "belum diupload",
  },
  {
    path: "lampiran.ktp",
    label: "Foto KTP",
    level: "warning",
    modules: ["lampiran"],
    message: "belum ada",
  },
  {
    path: "lampiran.stnk",
    label: "Foto STNK",
    level: "warning",
    modules: ["lampiran"],
    message: "belum ada",
  },
];

export function validateData(data: BastData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  /* ---------- aturan field ---------- */
  for (const rule of RULES) {
    if (isEmpty(data, rule.path)) {
      issues.push({
        path: rule.path,
        label: rule.label,
        message: rule.message ?? WAJIB,
        level: rule.level,
        modules: rule.modules,
      });
    }
  }

  /* ---------- format ---------- */
  if (data.tanggalBast && !hariTanggal(data.tanggalBast)) {
    issues.push({
      path: "tanggalBast",
      label: "Tanggal BAST",
      message: "tanggal tidak valid",
      level: "error",
      modules: ["bast"],
    });
  }
  if (data.st.tanggalSuratISO && !hariTanggal(data.st.tanggalSuratISO)) {
    issues.push({
      path: "st.tanggalSuratISO",
      label: "Tanggal Surat",
      message: "tanggal tidak valid",
      level: "error",
      modules: ["tugas"],
    });
  }
  if (data.tahun.trim() && !/^\d{4}$/.test(data.tahun.trim())) {
    issues.push({
      path: "tahun",
      label: "Tahun kendaraan",
      message: "gunakan 4 angka",
      level: "error",
      modules: ["umum", "bast"],
    });
  }
  if (data.st.petugasNik.trim() && !/^\d{16}$/.test(data.st.petugasNik.trim())) {
    issues.push({
      path: "st.petugasNik",
      label: "NIK Petugas",
      message: "gunakan 16 angka",
      level: "error",
      modules: ["tugas"],
    });
  }

  return issues;
}

/** Ambil hanya masalah yang berdampak ke modul-modul tertentu. */
export function issuesForModules(
  issues: ValidationIssue[],
  mods: ModuleId[],
): ValidationIssue[] {
  return issues.filter((i) => i.modules.some((m) => mods.includes(m)));
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
