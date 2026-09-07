import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { BastData, ChecklistMap, VehicleType } from "./types";
import { BLANK_DATA, CONTOH_RODA2, CONTOH_RODA4, syncChecklist } from "./data/defaults";
import FormPanel from "./components/FormPanel";
import SuratPenyerahan from "./components/SuratPenyerahan";
import BastSheet from "./components/BastSheet";
import { SuratTugasHal1, SuratTugasHal2 } from "./components/SuratTugas";
import LampiranSheet from "./components/LampiranSheet";
import PreviewStage, { PageCard } from "./components/PreviewStage";
import PrintGate from "./components/PrintGate";
import { Btn } from "./components/ui";
import { countByLevel, focusField, validateData } from "./lib/validation";
import type { ValidationIssue } from "./lib/validation";
import { pdfFileName } from "./lib/text";

const STORAGE_KEY = "bast-generator-v1";
const APP_TITLE = "Generator Surat BAST";
const MM = 96 / 25.4;
/* Ukuran kertas F4 / Folio */
export const PAPER_W_MM = 215;
export const PAPER_H_MM = 330;
const PAPER_W = PAPER_W_MM * MM;
const PAPER_H = PAPER_H_MM * MM;

type PageMode = "both" | "bast" | "penyerahan" | "tugas";

function loadInitial(): BastData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BastData>;
      const jenis = parsed.jenis === "roda2" ? "roda2" : "roda4";
      return {
        ...BLANK_DATA,
        ...parsed,
        jenis,
        kecamatan: parsed.kecamatan ?? "",
        kop: { ...BLANK_DATA.kop, ...(parsed.kop ?? {}) },
        st: {
          ...BLANK_DATA.st,
          ...(parsed.st ?? {}),
          noAngsuran: parsed.st?.noAngsuran ?? "",
        },
        lampiran: {
          ...BLANK_DATA.lampiran,
          ...(parsed.lampiran ?? {}),
          ktp: parsed.lampiran?.ktp ?? [],
          stnk: parsed.lampiran?.stnk ?? [],
        },
        checklist: syncChecklist(jenis, parsed.checklist ?? {}),
      };
    }
  } catch {
    /* ignore */
  }
  return CONTOH_RODA4;
}

export default function App() {
  const [data, setData] = useState<BastData>(loadInitial);
  const [pageMode, setPageMode] = useState<PageMode>("both");
  const [zoom, setZoom] = useState(0.7);
  const [fitMode, setFitMode] = useState<"width" | "page" | "manual">("width");
  const [focus, setFocus] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  /* ---------- validasi & nama file ---------- */
  const validationIssues = useMemo<ValidationIssue[]>(
    () => validateData(data),
    [data],
  );
  const { error: errorCount, warning: warningCount } = useMemo(
    () => countByLevel(validationIssues),
    [validationIssues],
  );
  const fileName = useMemo(
    () =>
      pdfFileName({
        kreditur: data.kreditur,
        namaDebitur: data.namaDebitur,
        kecamatan: data.kecamatan,
      }),
    [data.kreditur, data.namaDebitur, data.kecamatan],
  );

  /* ---------- autosave ---------- */
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // gambar kop terlalu besar → simpan tanpa gambar
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...data,
              kop: { ...data.kop, image: "" },
              lampiran: { ktp: [], stnk: [] },
            }),
          );
        } catch {
          /* ignore */
        }
      }
    }, 300);
    return () => clearTimeout(id);
  }, [data]);

  /* ---------- judul aplikasi ---------- */
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  /* ---------- zoom fitting ---------- */
  const applyFit = useCallback(
    (mode: "width" | "page") => {
      const el = viewportRef.current;
      if (!el) return;
      const availW = el.clientWidth - 56;
      const availH = el.clientHeight - 84;
      const z =
        mode === "width"
          ? availW / PAPER_W
          : Math.min(availW / PAPER_W, availH / PAPER_H);
      setZoom(Math.min(1.6, Math.max(0.2, +z.toFixed(3))));
    },
    [],
  );

  useLayoutEffect(() => {
    if (fitMode === "manual") return;
    applyFit(fitMode);
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applyFit(fitMode));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitMode, applyFit, focus]);

  /* ---------- helpers ---------- */
  const set = useCallback(
    <K extends keyof BastData>(key: K, value: BastData[K]) =>
      setData((d) => ({ ...d, [key]: value })),
    [],
  );

  const setJenis = useCallback(
    (j: VehicleType) =>
      setData((d) => ({ ...d, jenis: j, checklist: syncChecklist(j, d.checklist) })),
    [],
  );

  const setChecklist = useCallback(
    (c: ChecklistMap) => setData((d) => ({ ...d, checklist: c })),
    [],
  );

  /** Setelan yang selalu dipertahankan saat Contoh / Reset. */
  const keep = (d: BastData) => ({
    kop: d.kop,
    st: d.st,
    perusahaan: d.perusahaan,
    cabang: d.cabang,
    alamat: d.alamat,
    kreditur: d.kreditur,
    mitraNama: d.mitraNama,
    mitraLegalitas: d.mitraLegalitas,
    mitraAlamat: d.mitraAlamat,
    mitraPic: d.mitraPic,
  });

  const contoh = () =>
    setData((d) => ({
      ...(d.jenis === "roda2" ? CONTOH_RODA2 : CONTOH_RODA4),
      ...keep(d),
    }));

  const reset = () =>
    setData((d) => ({
      ...BLANK_DATA,
      jenis: d.jenis,
      ...keep(d),
      checklist: syncChecklist(d.jenis, {}),
    }));

  /** geser isi Surat Tugas naik (-) / turun (+) dalam mm */
  const nudgeKonten = (d: number) =>
    setData((prev) => ({
      ...prev,
      kop: {
        ...prev.kop,
        kontenY: Math.max(-60, Math.min(60, prev.kop.kontenY + d)),
      },
    }));

  const zoomBy = (d: number) => {
    setFitMode("manual");
    setZoom((z) => Math.min(1.6, Math.max(0.2, +(z + d).toFixed(2))));
  };

  /**
   * Cetak / Simpan PDF.
   * Nama file PDF selalu {inisial kreditur}-{nama debitur}-{kecamatan},
   * karena browser memakai document.title sebagai nama file bawaan.
   */
  const runPrint = useCallback(() => {
    const previousTitle = document.title;
    document.title = pdfFileName({
      kreditur: data.kreditur,
      namaDebitur: data.namaDebitur,
      kecamatan: data.kecamatan,
    });
    const restore = () => {
      document.title = previousTitle;
    };
    window.addEventListener("afterprint", restore, { once: true });
    window.setTimeout(restore, 2000);
    window.print();
  }, [data.kreditur, data.namaDebitur, data.kecamatan]);

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

  const showTugas = pageMode === "both" || pageMode === "tugas";
  const showPenyerahan = pageMode === "both" || pageMode === "penyerahan";
  const showBast = pageMode === "both" || pageMode === "bast";
  const showLampiran = data.lampiran.ktp.length > 0 || data.lampiran.stnk.length > 0;
  const pageCount =
    (showTugas ? 2 : 0) +
    (showPenyerahan ? 1 : 0) +
    (showBast ? 1 : 0) +
    (showLampiran ? 1 : 0);

  let pageNo = 0;
  const nextPage = () => `Halaman ${++pageNo}`;

  const tabBtn = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-[11.5px] font-medium transition ${
      active ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
    }`;

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      {/* ============================ SIDEBAR ============================ */}
      {!focus && (
        <aside className="no-print thin-scroll flex w-full flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 lg:w-[368px] lg:shrink-0 lg:overflow-y-auto">
          <div className="relative sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur">
            <span className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-indigo-600" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-[13px]">
                📝
              </div>
              <h1 className="text-[13.5px] font-bold tracking-tight text-slate-900">
                Generator Surat BAST
              </h1>
              <div className="ml-auto flex gap-1">
                <Btn onClick={contoh}>Contoh</Btn>
                <Btn onClick={reset}>Reset</Btn>
              </div>
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
            {/* ---------- ringkasan validasi ---------- */}
            <div
              className={`mb-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${
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
                      : "Data siap dicetak"}
                </span>
                {!!(errorCount || warningCount) && (
                  <button
                    type="button"
                    onClick={() => {
                      const first =
                        validationIssues.find((i) => i.level === "error") ??
                        validationIssues[0];
                      if (first) focusField(first.path);
                    }}
                    className="ml-auto shrink-0 rounded bg-white/70 px-1.5 text-[10px] font-medium transition hover:bg-white"
                  >
                    ke field →
                  </button>
                )}
              </div>
              {!!(errorCount || warningCount) && (
                <ul className="mt-1 space-y-0.5">
                  {validationIssues.slice(0, 4).map((issue) => (
                    <li key={`${issue.level}-${issue.path}`}>
                      <button
                        type="button"
                        onClick={() => focusField(issue.path)}
                        className="flex w-full gap-1 text-left"
                      >
                        <span
                          className={
                            issue.level === "error"
                              ? "text-rose-600"
                              : "text-amber-600"
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
                  {validationIssues.length > 4 && (
                    <li className="text-[10px] opacity-70">
                      dan {validationIssues.length - 4} lainnya
                    </li>
                  )}
                </ul>
              )}
            </div>

            {/* ---------- form pengisian (satu aliran) ---------- */}
            <FormPanel
              data={data}
              set={set}
              setJenis={setJenis}
              setChecklist={setChecklist}
              issues={validationIssues}
            />

            <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400">
              Tersimpan otomatis di browser. Saat menyimpan PDF, nama file otomatis{" "}
              <b>inisial kreditur-nama debitur-kecamatan</b>. Pilih ukuran{" "}
              <b>F4 / Folio (215 × 330 mm)</b>, margin <b>None</b>, aktifkan{" "}
              <b>Background graphics</b>.
            </p>
          </div>
        </aside>
      )}

      {/* ============================ PREVIEW ============================ */}
      <main className="flex h-[82vh] min-w-0 flex-1 flex-col bg-[#e7eaf0] lg:h-auto">
        {/* toolbar */}
        <div className="no-print flex flex-wrap items-center gap-2 border-b border-slate-300 bg-slate-100/90 px-3 py-2 backdrop-blur">
          <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
            {(
              [
                ["both", "Semua"],
                ["tugas", "Surat Tugas"],
                ["penyerahan", "Penyerahan"],
                ["bast", "BAST"],
              ] as [PageMode, string][]
            ).map(([v, l]) => (
              <button key={v} onClick={() => setPageMode(v)} className={tabBtn(pageMode === v)}>
                {l}
              </button>
            ))}
          </div>

          <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
            {pageCount} halaman · {data.jenis === "roda2" ? "🏍️ Roda 2" : "🚗 Roda 4"}
          </span>

          {/* geser isi Surat Tugas langsung dari toolbar */}
          {showTugas && (
            <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <span className="pl-1 text-[10.5px] font-medium text-slate-500">
                Isi surat
              </span>
              <button
                title="Naikkan isi surat"
                onClick={() => nudgeKonten(-2)}
                className="rounded px-1.5 py-0.5 text-[12px] text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
              >
                ↑
              </button>
              <span className="w-9 text-center text-[10.5px] font-semibold tabular-nums text-slate-600">
                {data.kop.kontenY}mm
              </span>
              <button
                title="Turunkan isi surat"
                onClick={() => nudgeKonten(2)}
                className="rounded px-1.5 py-0.5 text-[12px] text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
              >
                ↓
              </button>
              <button
                title="Reset"
                onClick={() => set("kop", { ...data.kop, kontenY: 0 })}
                className="rounded px-1 text-[10px] text-slate-400 hover:text-slate-700"
              >
                ↺
              </button>
            </div>
          )}

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

            <Btn variant={focus ? "dark" : "ghost"} onClick={() => setFocus((f) => !f)}>
              {focus ? "⤡ Tampilkan Form" : "⤢ Layar Penuh"}
            </Btn>
            <Btn variant="primary" onClick={printDocument}>
              🖨️ Cetak
            </Btn>
          </div>
        </div>

        {/* viewport */}
        <div
          ref={viewportRef}
          className="print-scroll thin-scroll flex-1 overflow-auto p-7 lg:min-h-0"
        >
          <div className="print-root">
            <PreviewStage zoom={zoom}>
              <div className="page-list flex flex-col items-center gap-8">
                {showTugas && (
                  <>
                    <PageCard label={nextPage()} badge="Surat Tugas — Hal. 1">
                      <SuratTugasHal1 data={data} />
                    </PageCard>
                    <PageCard label={nextPage()} badge="Surat Tugas — Hal. 2">
                      <SuratTugasHal2 data={data} />
                    </PageCard>
                  </>
                )}
                {showPenyerahan && (
                  <PageCard label={nextPage()} badge="Surat Penyerahan">
                    <SuratPenyerahan data={data} />
                  </PageCard>
                )}
                {showBast && (
                  <PageCard
                    label={nextPage()}
                    badge={`Berita Acara Serah Terima — ${
                      data.jenis === "roda2" ? "Roda 2" : "Roda 4"
                    }`}
                  >
                    <BastSheet data={data} />
                  </PageCard>
                )}
                {showLampiran && (
                  <PageCard label={nextPage()} badge="Lampiran KTP & STNK">
                    <LampiranSheet data={data} />
                  </PageCard>
                )}
              </div>
            </PreviewStage>
          </div>
        </div>
      </main>

      {/* ============================ GERBANG CETAK ============================ */}
      <PrintGate
        open={gateOpen}
        issues={validationIssues}
        fileName={`${fileName}.pdf`}
        onClose={() => setGateOpen(false)}
        onPrint={() => {
          setGateOpen(false);
          window.setTimeout(runPrint, 120);
        }}
      />
    </div>
  );
}
