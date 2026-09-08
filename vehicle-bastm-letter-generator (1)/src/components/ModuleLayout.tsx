import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { BastData } from "../types";
import type { ModuleMeta } from "../lib/modules";
import { fieldOwner } from "../lib/modules";
import type { ValidationIssue } from "../lib/validation";
import { countByLevel, issuesForModules } from "../lib/validation";
import { pdfFileName } from "../lib/text";
import { printWithFileName } from "../lib/print";
import PreviewStage from "./PreviewStage";
import PrintGate from "./PrintGate";
import type { GateIssue } from "./PrintGate";
import { Btn } from "./ui";

/* Ukuran kertas F4 / Folio */
const MM = 96 / 25.4;
const PAPER_W = 215 * MM;
const PAPER_H = 330 * MM;

interface Props {
  meta: ModuleMeta;
  data: BastData;
  issues: ValidationIssue[];
  /** bagian form modul (kolom kiri / kartu) */
  form: ReactNode;
  /** halaman pratinjau (PageCard). Tanpa ini modul tampil sebagai halaman form saja. */
  children?: ReactNode;
  /** konten tambahan di bawah kartu form (modul tanpa pratinjau) */
  footer?: ReactNode;
  /** chip status di toolbar pratinjau */
  statusChips?: ReactNode;
  /** kontrol tambahan di toolbar pratinjau (mis. geser isi surat) */
  toolbarExtra?: ReactNode;
  onGotoField: (path: string) => void;
}

/**
 * Kerangka tiap modul dokumen:
 * - dengan pratinjau → kolom form (kiri) + pratinjau kertas (kanan) + cetak
 * - tanpa pratinjau   → halaman form tunggal (mis. Data Umum)
 */
export default function ModuleLayout({
  meta,
  data,
  issues,
  form,
  children,
  footer,
  statusChips,
  toolbarExtra,
  onGotoField,
}: Props) {
  const [zoom, setZoom] = useState(0.7);
  const [fitMode, setFitMode] = useState<"width" | "page" | "manual">("width");
  const [focusMode, setFocusMode] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  /* ---------- validasi khusus modul ini ---------- */
  const moduleIssues = useMemo(
    () => issuesForModules(issues, [meta.id]),
    [issues, meta.id],
  );
  const { error: errorCount, warning: warningCount } = useMemo(
    () => countByLevel(moduleIssues),
    [moduleIssues],
  );
  const gateIssues = useMemo<GateIssue[]>(
    () => moduleIssues.map((i) => ({ ...i, owner: fieldOwner(i.path) })),
    [moduleIssues],
  );

  const fileName = useMemo(
    () => pdfFileName(data, meta.filePrefix),
    [data, meta.filePrefix],
  );

  /* ---------- zoom fitting ---------- */
  const applyFit = useCallback((mode: "width" | "page") => {
    const el = viewportRef.current;
    if (!el) return;
    const availW = el.clientWidth - 56;
    const availH = el.clientHeight - 84;
    const z =
      mode === "width"
        ? availW / PAPER_W
        : Math.min(availW / PAPER_W, availH / PAPER_H);
    setZoom(Math.min(1.6, Math.max(0.2, +z.toFixed(3))));
  }, []);

  useLayoutEffect(() => {
    if (fitMode === "manual") return;
    applyFit(fitMode);
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applyFit(fitMode));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitMode, applyFit, focusMode]);

  const zoomBy = (d: number) => {
    setFitMode("manual");
    setZoom((z) => Math.min(1.6, Math.max(0.2, +(z + d).toFixed(2))));
  };

  /* ---------- cetak ---------- */
  const runPrint = useCallback(() => printWithFileName(fileName), [fileName]);

  const printDocument = () => {
    if (errorCount > 0 || warningCount > 0) {
      setGateOpen(true);
      return;
    }
    runPrint();
  };

  const copyFileName = async () => {
    try {
      await navigator.clipboard.writeText(fileName);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const tabBtn = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-[11.5px] font-medium transition ${
      active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
    }`;

  /* ================= MODUL TANPA PRATINJAU ================= */
  if (!children) {
    return (
      <div className="flex h-full flex-col">
        <div className="thin-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5">
            <div className="mb-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[19px] shadow-sm ${meta.tile}`}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-[15px] font-bold tracking-tight text-slate-900">
                  {meta.label}
                </h1>
                <p className="mt-0.5 text-[11.5px] leading-snug text-slate-500">
                  {meta.desc}
                </p>
              </div>
            </div>

            <ValidationSummary issues={moduleIssues} onGotoField={onGotoField} />

            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {form}
            </div>

            {footer}

            <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400">
              Semua isian tersimpan otomatis di browser dan langsung dipakai
              modul Surat Tugas, Surat Penyerahan, BAST, dan Lampiran.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ================= MODUL DENGAN PRATINJAU ================= */
  return (
    <div className="flex flex-col lg:h-full lg:flex-row">
      {/* ---------- FORM ---------- */}
      {!focusMode && (
        <aside className="no-print thin-scroll flex w-full flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 lg:w-[352px] lg:shrink-0 lg:overflow-y-auto">
          <div className="relative sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur">
            <span
              className={`pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r ${meta.tile}`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-[13px] ${meta.tile}`}
              >
                {meta.icon}
              </div>
              <h2 className="text-[13.5px] font-bold tracking-tight text-slate-900">
                {meta.label}
              </h2>
            </div>

            <Btn variant="primary" className="mt-2 w-full" onClick={printDocument}>
              🖨️ Cetak / Simpan PDF
            </Btn>

            <div className="mt-1.5 flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 ring-1 ring-slate-200">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                File
              </span>
              <span
                className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700"
                title={`${fileName}.pdf`}
              >
                {fileName}.pdf
              </span>
              <button
                type="button"
                onClick={() => void copyFileName()}
                title="Salin nama file"
                className="shrink-0 rounded px-1 text-[10px] font-medium text-indigo-600 transition hover:bg-indigo-50"
              >
                {copied ? "tersalin" : "salin"}
              </button>
            </div>
          </div>

          <div className="p-2.5">
            <ValidationSummary issues={moduleIssues} onGotoField={onGotoField} />
            <div className="mt-2">{form}</div>
            <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400">
              Cetak dengan ukuran <b>F4 / Folio (215 × 330 mm)</b>, margin{" "}
              <b>None</b>, aktifkan <b>Background graphics</b>.
            </p>
          </div>
        </aside>
      )}

      {/* ---------- PRATINJAU ---------- */}
      <main className="flex h-[82vh] min-w-0 flex-1 flex-col bg-[#e7eaf0] lg:h-auto">
        <div className="no-print flex flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-100/90 px-3 py-2 backdrop-blur">
          {statusChips}
          {toolbarExtra}

          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => setFitMode("width")}
                className={tabBtn(fitMode === "width")}
                title="Sesuaikan lebar"
              >
                Lebar
              </button>
              <button
                onClick={() => setFitMode("page")}
                className={tabBtn(fitMode === "page")}
                title="Satu halaman penuh"
              >
                1 Halaman
              </button>
            </div>

            <div className="flex items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => zoomBy(-0.1)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
              >
                −
              </button>
              <span className="w-11 text-center text-[11.5px] font-semibold text-slate-600">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => zoomBy(0.1)}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
              >
                +
              </button>
            </div>

            <Btn
              variant={focusMode ? "dark" : "ghost"}
              onClick={() => setFocusMode((f) => !f)}
            >
              {focusMode ? "⤡ Tampilkan Form" : "⤢ Layar Penuh"}
            </Btn>
            <Btn variant="primary" onClick={printDocument}>
              🖨️ Cetak
            </Btn>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="print-scroll thin-scroll flex-1 overflow-auto p-7 lg:min-h-0"
        >
          <div className="print-root">
            <PreviewStage zoom={zoom}>
              <div className="page-list flex flex-col items-center gap-8">
                {children}
              </div>
            </PreviewStage>
          </div>
        </div>
      </main>

      <PrintGate
        open={gateOpen}
        issues={gateIssues}
        fileName={`${fileName}.pdf`}
        currentModule={meta.id}
        onClose={() => setGateOpen(false)}
        onPrint={() => {
          setGateOpen(false);
          window.setTimeout(runPrint, 120);
        }}
        onGotoField={onGotoField}
      />
    </div>
  );
}

/* ---------------- Ringkasan validasi modul ---------------- */
function ValidationSummary({
  issues,
  onGotoField,
}: {
  issues: ValidationIssue[];
  onGotoField: (path: string) => void;
}) {
  const { error: errorCount, warning: warningCount } = countByLevel(issues);

  return (
    <div
      className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
        errorCount
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : warningCount
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      role="status"
    >
      <div className="flex items-center gap-1.5">
        <span className="font-semibold">
          {errorCount
            ? `${errorCount} wajib diisi`
            : warningCount
              ? `${warningCount} perlu diperiksa`
              : "Data modul ini lengkap"}
        </span>
        {!!(errorCount || warningCount) && (
          <button
            type="button"
            onClick={() => {
              const first =
                issues.find((i) => i.level === "error") ?? issues[0];
              if (first) onGotoField(first.path);
            }}
            className="ml-auto shrink-0 rounded bg-white/70 px-1.5 text-[10px] font-medium transition hover:bg-white"
          >
            ke field →
          </button>
        )}
      </div>
      {!!(errorCount || warningCount) && (
        <ul className="mt-1 space-y-0.5">
          {issues.slice(0, 4).map((issue) => (
            <li key={`${issue.level}-${issue.path}`}>
              <button
                type="button"
                onClick={() => onGotoField(issue.path)}
                className="flex w-full gap-1 text-left"
              >
                <span
                  className={
                    issue.level === "error" ? "text-rose-600" : "text-amber-600"
                  }
                >
                  •
                </span>
                <span className="truncate">
                  {issue.label}: {issue.message}
                </span>
              </button>
            </li>
          ))}
          {issues.length > 4 && (
            <li className="text-[10px] opacity-70">
              dan {issues.length - 4} lainnya
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
