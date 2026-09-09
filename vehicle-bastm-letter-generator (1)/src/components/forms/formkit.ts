import { useMemo } from "react";
import type { BastData, ChecklistMap, VehicleType } from "../../types";
import { issueMap } from "../../lib/validation";
import type { ValidationIssue } from "../../lib/validation";

/** Props form isian tunggal (semua dokumen dalam satu form). */
export interface IsianFormProps {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  setJenis: (j: VehicleType) => void;
  setChecklist: (c: ChecklistMap) => void;
  issues: ValidationIssue[];
}

/** Peta pesan error & warning per field. */
export function useIssueMaps(issues: ValidationIssue[]) {
  const errors = useMemo(() => issueMap(issues, "error"), [issues]);
  const warns = useMemo(() => issueMap(issues, "warning"), [issues]);
  return {
    E: (path: string) => errors[path],
    W: (path: string) => warns[path],
  };
}
