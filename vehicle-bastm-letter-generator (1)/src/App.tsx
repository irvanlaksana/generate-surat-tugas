import { useCallback, useEffect, useMemo, useState } from "react";
import type { BastData, ChecklistMap, VehicleType } from "./types";
import { BLANK_DATA, CONTOH_RODA2, CONTOH_RODA4, syncChecklist } from "./data/defaults";
import { countByLevel, focusField, issuesForModules, validateData } from "./lib/validation";
import type { ValidationIssue } from "./lib/validation";
import { MODULES, MODULE_BY_ID, fieldOwner } from "./lib/modules";
import type { ModuleId, RouteId } from "./lib/modules";
import SidebarNav from "./components/SidebarNav";
import HomeModule from "./modules/HomeModule";
import DataUmumModule from "./modules/DataUmumModule";
import SuratTugasModule from "./modules/SuratTugasModule";
import PenyerahanModule from "./modules/PenyerahanModule";
import BastModule from "./modules/BastModule";
import LampiranModule from "./modules/LampiranModule";

const STORAGE_KEY = "bast-generator-v1";
const ROUTE_KEY = "bast-generator-route";
const APP_TITLE = "Generator Surat";

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

function loadRoute(): RouteId {
  try {
    const raw = localStorage.getItem(ROUTE_KEY);
    if (raw === "home" || MODULES.some((m) => m.id === raw)) {
      return raw as RouteId;
    }
  } catch {
    /* ignore */
  }
  return "home";
}

export default function App() {
  const [data, setData] = useState<BastData>(loadInitial);
  const [route, setRoute] = useState<RouteId>(loadRoute);

  /* ---------- validasi ---------- */
  const validationIssues = useMemo<ValidationIssue[]>(
    () => validateData(data),
    [data],
  );

  const moduleCounts = useMemo(() => {
    const out = {} as Record<ModuleId, { error: number; warning: number }>;
    for (const m of MODULES) {
      out[m.id] = countByLevel(issuesForModules(validationIssues, [m.id]));
    }
    return out;
  }, [validationIssues]);

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

  /* ---------- ingat modul terakhir & judul ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_KEY, route);
    } catch {
      /* ignore */
    }
    document.title =
      route === "home"
        ? APP_TITLE
        : `${APP_TITLE} — ${MODULE_BY_ID[route].label}`;
  }, [route]);

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

  /** Pindah modul. */
  const gotoModule = useCallback((r: RouteId) => setRoute(r), []);

  /**
   * Lompat ke field bermasalah — bila field tidak ada di modul aktif,
   * pindah dulu ke modul pemiliknya lalu fokuskan.
   */
  const gotoField = useCallback((path: string) => {
    const here = document.querySelector(
      `[data-field="${CSS.escape(path)}"]`,
    );
    if (here) {
      focusField(path);
      return;
    }
    setRoute(fieldOwner(path));
    window.setTimeout(() => focusField(path), 260);
  }, []);

  const pageProps = {
    data,
    set,
    setJenis,
    setChecklist,
    issues: validationIssues,
    onGotoField: gotoField,
  };

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      {/* ============================ NAVIGASI MODUL ============================ */}
      <SidebarNav
        route={route}
        onRoute={gotoModule}
        moduleCounts={moduleCounts}
        onContoh={contoh}
        onReset={reset}
      />

      {/* ============================ KONTEN MODUL ============================ */}
      <div className="min-w-0 flex-1 lg:h-screen">
        {route === "home" && (
          <HomeModule
            data={data}
            issues={validationIssues}
            onRoute={gotoModule}
            onGotoField={gotoField}
            onContoh={contoh}
            onReset={reset}
          />
        )}
        {route === "umum" && (
          <DataUmumModule {...pageProps} onRoute={gotoModule} />
        )}
        {route === "tugas" && <SuratTugasModule {...pageProps} />}
        {route === "penyerahan" && <PenyerahanModule {...pageProps} />}
        {route === "bast" && <BastModule {...pageProps} />}
        {route === "lampiran" && <LampiranModule {...pageProps} />}
      </div>
    </div>
  );
}
