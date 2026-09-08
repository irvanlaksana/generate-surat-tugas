import type { BastData } from "../types";
import { MODULE_BY_ID } from "../lib/modules";
import ModuleLayout from "../components/ModuleLayout";
import { PageCard } from "../components/PreviewStage";
import { SuratTugasHal1, SuratTugasHal2 } from "../components/SuratTugas";
import SuratTugasForm from "../components/forms/SuratTugasForm";
import type { ModulePageProps } from "../components/forms/formkit";

/** Modul Surat Tugas — form, pratinjau 2 halaman, & cetak terpisah. */
export default function SuratTugasModule({
  data,
  set,
  issues,
  onGotoField,
}: ModulePageProps) {
  const jenis = data.jenis === "roda2" ? "🏍️ Roda 2" : "🚗 Roda 4";

  return (
    <ModuleLayout
      meta={MODULE_BY_ID.tugas}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={<SuratTugasForm data={data} set={set} issues={issues} />}
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          2 halaman · {jenis}
        </span>
      }
      toolbarExtra={<NudgeKonten data={data} set={set} />}
    >
      <PageCard label="Halaman 1" badge="Surat Tugas — Hal. 1">
        <SuratTugasHal1 data={data} />
      </PageCard>
      <PageCard label="Halaman 2" badge="Surat Tugas — Hal. 2">
        <SuratTugasHal2 data={data} />
      </PageCard>
    </ModuleLayout>
  );
}

/** Geser isi Surat Tugas naik / turun (menyesuaikan kop) dari toolbar. */
function NudgeKonten({
  data,
  set,
}: {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
}) {
  const nudge = (d: number) =>
    set("kop", {
      ...data.kop,
      kontenY: Math.max(-60, Math.min(60, data.kop.kontenY + d)),
    });

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
      <span className="pl-1 text-[10.5px] font-medium text-slate-500">
        Isi surat
      </span>
      <button
        type="button"
        title="Naikkan isi surat"
        onClick={() => nudge(-2)}
        className="rounded px-1.5 py-0.5 text-[12px] text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
      >
        ↑
      </button>
      <span className="w-9 text-center text-[10.5px] font-semibold tabular-nums text-slate-600">
        {data.kop.kontenY}mm
      </span>
      <button
        type="button"
        title="Turunkan isi surat"
        onClick={() => nudge(2)}
        className="rounded px-1.5 py-0.5 text-[12px] text-slate-600 hover:bg-slate-100 hover:text-indigo-600"
      >
        ↓
      </button>
      <button
        type="button"
        title="Reset"
        onClick={() => set("kop", { ...data.kop, kontenY: 0 })}
        className="rounded px-1 text-[10px] text-slate-400 hover:text-slate-700"
      >
        ↺
      </button>
    </div>
  );
}
