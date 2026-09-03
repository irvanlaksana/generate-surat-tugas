import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BastData, ChecklistMap, VehicleType } from "./types";
import { BLANK_DATA, CONTOH_RODA2, CONTOH_RODA4, syncChecklist } from "./data/defaults";
import FormPanel from "./components/FormPanel";
import SuratPenyerahan from "./components/SuratPenyerahan";
import BastSheet from "./components/BastSheet";
import { SuratTugasHal1, SuratTugasHal2 } from "./components/SuratTugas";
import PreviewStage, { PageCard } from "./components/PreviewStage";
import { Btn } from "./components/ui";

const STORAGE_KEY = "bast-generator-v1";
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
      return {
        ...BLANK_DATA,
        ...parsed,
        kop: { ...BLANK_DATA.kop, ...(parsed.kop ?? {}) },
        st: { ...BLANK_DATA.st, ...(parsed.st ?? {}) },
        checklist: syncChecklist(parsed.jenis ?? "roda4", parsed.checklist ?? {}),
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
  const viewportRef = useRef<HTMLDivElement>(null);

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
            JSON.stringify({ ...data, kop: { ...data.kop, image: "" } }),
          );
        } catch {
          /* ignore */
        }
      }
    }, 300);
    return () => clearTimeout(id);
  }, [data]);

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

  const showTugas = pageMode === "both" || pageMode === "tugas";
  const showPenyerahan = pageMode === "both" || pageMode === "penyerahan";
  const showBast = pageMode === "both" || pageMode === "bast";
  const pageCount =
    (showTugas ? 2 : 0) + (showPenyerahan ? 1 : 0) + (showBast ? 1 : 0);

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
        <aside className="no-print thin-scroll flex w-full flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 lg:w-[350px] lg:shrink-0 lg:overflow-y-auto">
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
            <Btn variant="primary" className="mt-2 w-full" onClick={() => window.print()}>
              🖨️ Cetak / Simpan PDF
            </Btn>
          </div>

          <div className="p-2.5">
            <FormPanel
              data={data}
              set={set}
              setJenis={setJenis}
              setChecklist={setChecklist}
            />
            <p className="mt-3 px-1 text-[10px] leading-relaxed text-slate-400">
              Tersimpan otomatis di browser. Saat mencetak pilih ukuran{" "}
              <b>F4 / Folio (215 × 330 mm)</b>, margin{" "}
              <b>None</b>, aktifkan <b>Background graphics</b>.
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
            {pageCount} halaman ·{" "}
            {data.jenis === "roda2" ? "🏍️ Roda 2" : "🚗 Roda 4"}
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
            <Btn variant="primary" onClick={() => window.print()}>
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
              </div>
            </PreviewStage>
          </div>
        </div>
      </main>
    </div>
  );
}
