import type { ValidationIssue } from "../lib/validation";
import { Btn } from "./ui";

/** Issue validasi yang ditampilkan sebelum cetak. */
export type GateIssue = ValidationIssue;

interface Props {
  open: boolean;
  issues: GateIssue[];
  fileName: string;
  onClose: () => void;
  onPrint: () => void;
  onGotoField: (path: string) => void;
}

/**
 * Gerbang sebelum cetak: cegah "Simpan PDF" bila data wajib belum lengkap,
 * dan tampilkan daftar peringatan supaya tidak ada field yang terlewat.
 * Tombol "perbaiki" langsung menggulir ke field di form isian.
 */
export default function PrintGate({
  open,
  issues,
  fileName,
  onClose,
  onPrint,
  onGotoField,
}: Props) {
  if (!open) return null;

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const blocking = errors.length > 0;

  const perbaiki = (path: string) => {
    onClose();
    onGotoField(path);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Validasi sebelum cetak"
        className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div
          className={`px-4 py-3 ${
            blocking ? "bg-rose-50" : "bg-amber-50"
          } border-b border-slate-200`}
        >
          <h2
            className={`text-[13px] font-bold ${
              blocking ? "text-rose-700" : "text-amber-700"
            }`}
          >
            {blocking
              ? `${errors.length} data wajib belum diisi`
              : `${warnings.length} data perlu diperiksa`}
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
            {blocking
              ? "Lengkapi dulu agar dokumen dan nama file PDF benar."
              : "Dokumen bisa dicetak, pastikan tidak ada yang terlewat."}
          </p>
          <p className="mt-1.5 rounded-md bg-white/80 px-2 py-1 text-[10.5px] text-slate-500 ring-1 ring-slate-200">
            Nama file PDF:{" "}
            <span className="font-semibold text-slate-700">{fileName}</span>
          </p>
        </div>

        <div className="thin-scroll max-h-[42vh] overflow-y-auto px-4 py-2">
          {blocking && (
            <ul className="space-y-1">
              {errors.map((issue) => (
                <li key={`e-${issue.path}`}>
                  <button
                    type="button"
                    onClick={() => perbaiki(issue.path)}
                    className="flex w-full items-center gap-2 rounded-md bg-rose-50 px-2 py-1 text-left transition hover:bg-rose-100"
                  >
                    <span className="shrink-0 text-[11px] font-semibold text-rose-700">
                      {issue.label}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-rose-500">
                      {issue.message}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-rose-400">
                      perbaiki →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {warnings.length > 0 && (
            <ul className={`space-y-1 ${blocking ? "mt-2 border-t border-slate-100 pt-2" : ""}`}>
              {warnings.map((issue) => (
                <li key={`w-${issue.path}`}>
                  <button
                    type="button"
                    onClick={() => perbaiki(issue.path)}
                    className="flex w-full items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-left transition hover:bg-amber-100"
                  >
                    <span className="shrink-0 text-[11px] font-semibold text-amber-700">
                      {issue.label}
                    </span>
                    <span className="shrink-0 text-[10.5px] text-amber-600">
                      {issue.message}
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] text-amber-400">
                      isi →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-4 py-2.5">
          <Btn onClick={onClose}>{blocking ? "Perbaiki dulu" : "Batal"}</Btn>
          <Btn
            variant={blocking ? "ghost" : "primary"}
            onClick={onPrint}
            className={blocking ? "text-slate-500" : ""}
          >
            🖨️ {blocking ? "Tetap cetak" : "Cetak / Simpan PDF"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
