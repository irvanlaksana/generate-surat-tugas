import { useMemo } from "react";
import type { BastData, ChecklistMap, VehicleType } from "../../types";
import { issueMap } from "../../lib/validation";
import type { ValidationIssue } from "../../lib/validation";

/** Props yang diterima semua form modul. */
export interface ModuleFormProps {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  setJenis: (j: VehicleType) => void;
  setChecklist: (c: ChecklistMap) => void;
  issues: ValidationIssue[];
}

/** Props halaman modul (form + navigasi ke field bermasalah). */
export interface ModulePageProps extends ModuleFormProps {
  onGotoField: (path: string) => void;
}

/** Peta pesan error & warning per field (dipakai semua form modul). */
export function useIssueMaps(issues: ValidationIssue[]) {
  const errors = useMemo(() => issueMap(issues, "error"), [issues]);
  const warns = useMemo(() => issueMap(issues, "warning"), [issues]);
  return {
    E: (path: string) => errors[path],
    W: (path: string) => warns[path],
  };
}

/** Baris ringkasan data debitur (diedit di modul Data Umum). */
export function DebiturRingkas({ data }: { data: BastData }) {
  return (
    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-[10.5px] leading-snug text-slate-500 ring-1 ring-slate-200">
      Debitur: <b className="text-slate-700">{data.namaDebitur || "—"}</b>
      {data.kecamatan.trim() ? ` · Kec. ${data.kecamatan.trim()}` : ""}{" "}
      <span className="text-slate-400">(ubah di modul Data Umum)</span>
    </div>
  );
}
