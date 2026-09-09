import { useCallback, useEffect, useMemo, useState } from "react";
import type { BastData, ChecklistMap, SuratTugasData, VehicleType } from "./types";
import { BLANK_DATA, CONTOH_RODA2, CONTOH_RODA4, syncChecklist } from "./data/defaults";
import { digitsOnly } from "./lib/format";
import { countByLevel, focusField, issuesForDocs, validateData } from "./lib/validation";
import type { ValidationIssue } from "./lib/validation";
import { DOCS } from "./lib/modules";
import type { DocId, PreviewTab, RouteId } from "./lib/modules";
import SidebarNav from "./components/SidebarNav";
import HomeModule from "./modules/HomeModule";
import IsianModule from "./modules/IsianModule";

const STORAGE_KEY = "bast-generator-v1";
const ROUTE_KEY = "bast-generator-route";
const APP_TITLE = "Generator Surat";

/** Bentuk data lama (sebelum semua isian disatukan) — untuk migrasi otomatis. */
type LegacySt = Partial<SuratTugasData> & {
  angsuranNilai?: string; // "Rp. 652.000 / Rp. 11.736.000"
  nasabahNama?: string;
  nasabahAlamat?: string;
  merkType?: string;
  noPolisi?: string;
  perusahaan?: string;
  noKontrak?: string;
  tanggalSuratISO?: string;
};

type LegacyData = Partial<BastData> & {
  tanggalBast?: string;
  noSuratTugas?: string;
  st?: LegacySt;
};

/**
 * Muat data tersimpan + migrasi dari struktur lama: field yang dulu diduplikasi
 * per dokumen kini diambil dari isian bersama (bila isian bersama masih kosong).
 */
function migrate(parsed: LegacyData): BastData {
  const jenis: VehicleType = parsed.jenis === "roda2" ? "roda2" : "roda4";

  const { tanggalBast, noSuratTugas, st: legacySt, ...rest } = parsed;
  const stLama: LegacySt = legacySt ?? {};
  const {
    angsuranNilai,
    nasabahNama,
    nasabahAlamat,
    merkType,
    noPolisi: stNoPolisi,
    perusahaan: stPerusahaan,
    noKontrak,
    tanggalSuratISO,
    ...stRest
  } = stLama;

  /* "Rp. 652.000 / Rp. 11.736.000" → dua isian angka terpisah */
  const [angsuranLama = "", totalLama = ""] = (angsuranNilai ?? "").split("/");

  return {
    ...BLANK_DATA,
    ...rest,
    jenis,
    tanggalISO:
      parsed.tanggalISO || tanggalBast || tanggalSuratISO || BLANK_DATA.tanggalISO,
    noPerjanjian: parsed.noPerjanjian || noKontrak || "",
    namaDebitur: parsed.namaDebitur || nasabahNama || "",
    alamatDebitur: parsed.alamatDebitur ?? nasabahAlamat ?? "",
    merekType: parsed.merekType || merkType || "",
    noPolisi: parsed.noPolisi || stNoPolisi || "",
    mitraNama: parsed.mitraNama || stPerusahaan || BLANK_DATA.mitraNama,
    kecamatan: parsed.kecamatan ?? "",
    kop: { ...BLANK_DATA.kop, ...(parsed.kop ?? {}) },
    st: {
      ...BLANK_DATA.st,
      ...stRest,
      nomor: stRest.nomor || noSuratTugas || BLANK_DATA.st.nomor,
      noAngsuran: stRest.noAngsuran ?? "",
      angsuran: stRest.angsuran || digitsOnly(angsuranLama),
      totalAngsuran: stRest.totalAngsuran || digitsOnly(totalLama),
      denda: digitsOnly(stRest.denda ?? ""),
    },
    lampiran: {
      ktp: parsed.lampiran?.ktp ?? [],
      stnk: parsed.lampiran?.stnk ?? [],
    },
    checklist: syncChecklist(jenis, parsed.checklist ?? {}),
  };
}

function loadInitial(): BastData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw) as LegacyData);
  } catch {
    /* ignore */
  }
  return CONTOH_RODA4;
}

function loadRoute(): RouteId {
  try {
    const raw = localStorage.getItem(ROUTE_KEY);
    if (raw === "home" || raw === "isian") return raw;
    /* route modul lama → halaman isian tunggal */
    if (raw === "umum" || DOCS.some((d) => d.id === raw)) return "isian";
  } catch {
    /* ignore */
  }
  return "home";
}

export default function App() {
  const [data, setData] = useState<BastData>(loadInitial);
  const [route, setRoute] = useState<RouteId>(loadRoute);
  const [tab, setTab] = useState<PreviewTab>("semua");

  /* ---------- validasi ---------- */
  const validationIssues = useMemo<ValidationIssue[]>(
    () => validateData(data),
    [data],
  );

  const docCounts = useMemo(() => {
    const out = {} as Record<DocId, { error: number; warning: number }>;
    for (const d of DOCS) {
      out[d.id] = countByLevel(issuesForDocs(validationIssues, [d.id]));
    }
    return out;
  }, [validationIssues]);

  const formCounts = useMemo(
    () => countByLevel(validationIssues),
    [validationIssues],
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

  /* ---------- ingat halaman terakhir & judul ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_KEY, route);
    } catch {
      /* ignore */
    }
    document.title = route === "home" ? APP_TITLE : `${APP_TITLE} — Isian Surat`;
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

  /** Buka halaman isian, opsional langsung ke tab dokumen. */
  const openIsian = useCallback((t: PreviewTab = "semua") => {
    setTab(t);
    setRoute("isian");
  }, []);

  /**
   * Lompat ke field bermasalah — semua isian ada di satu form, jadi cukup
   * pindah ke halaman isian bila sedang di Beranda lalu fokuskan fieldnya.
   */
  const gotoField = useCallback((path: string) => {
    const here = document.querySelector(
      `[data-field="${CSS.escape(path)}"]`,
    );
    if (here) {
      focusField(path);
      return;
    }
    setRoute("isian");
    window.setTimeout(() => focusField(path), 260);
  }, []);

  const formProps = {
    data,
    set,
    setJenis,
    setChecklist,
    issues: validationIssues,
  };

  return (
    <div className="lg:flex lg:h-screen lg:overflow-hidden">
      {/* ============================ NAVIGASI ============================ */}
      <SidebarNav
        route={route}
        tab={tab}
        onRoute={setRoute}
        onOpenDoc={openIsian}
        docCounts={docCounts}
        formCounts={formCounts}
        onContoh={contoh}
        onReset={reset}
      />

      {/* ============================ KONTEN ============================ */}
      <div className="min-w-0 flex-1 lg:h-screen">
        {route === "home" && (
          <HomeModule
            data={data}
            issues={validationIssues}
            onOpen={openIsian}
            onGotoField={gotoField}
            onContoh={contoh}
            onReset={reset}
          />
        )}
        {route === "isian" && (
          <IsianModule
            {...formProps}
            tab={tab}
            onTab={setTab}
            docCounts={docCounts}
            onGotoField={gotoField}
          />
        )}
      </div>
    </div>
  );
}
