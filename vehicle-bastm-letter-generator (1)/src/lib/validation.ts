import type { BastData } from "../types";
import { hariTanggal } from "./format";

export interface ValidationIssue {
  label: string;
  message: string;
}

export function validateData(data: BastData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required: [string, string][] = [
    ["noBast", "No. BAST"],
    ["tanggalBast", "Tanggal BAST"],
    ["noPerjanjian", "No. Perjanjian"],
    ["namaDebitur", "Nama Debitur"],
    ["merekType", "Merk / Type kendaraan"],
    ["noPolisi", "No. Polisi"],
    ["mitraNama", "Nama perusahaan mitra"],
    ["st.nomor", "Nomor Surat Tugas"],
    ["st.petugasNama", "Petugas Surat Tugas"],
    ["st.nasabahNama", "Nama nasabah Surat Tugas"],
    ["st.tanggalSuratISO", "Tanggal Surat Tugas"],
  ];

  for (const [path, label] of required) {
    const value = path.startsWith("st.")
      ? data.st[path.slice(3) as keyof BastData["st"]]
      : data[path as keyof BastData];
    if (typeof value !== "string" || !value.trim()) {
      issues.push({ label, message: "wajib diisi" });
    }
  }

  if (data.tanggalBast && !hariTanggal(data.tanggalBast)) {
    issues.push({ label: "Tanggal BAST", message: "tanggal tidak valid" });
  }
  if (data.st.tanggalSuratISO && !hariTanggal(data.st.tanggalSuratISO)) {
    issues.push({ label: "Tanggal Surat Tugas", message: "tanggal tidak valid" });
  }
  if (data.tahun && !/^\d{4}$/.test(data.tahun.trim())) {
    issues.push({ label: "Tahun kendaraan", message: "gunakan 4 angka" });
  }
  if (data.st.petugasNik && !/^\d{16}$/.test(data.st.petugasNik.trim())) {
    issues.push({ label: "NIK Petugas", message: "gunakan 16 angka" });
  }

  return issues;
}