import { MODULES, MODULE_BY_ID } from "../lib/modules";
import type { RouteId } from "../lib/modules";
import ModuleLayout from "../components/ModuleLayout";
import DataUmumForm from "../components/forms/DataUmumForm";
import type { ModulePageProps } from "../components/forms/formkit";

interface Props extends ModulePageProps {
  onRoute: (r: RouteId) => void;
}

/** Modul Data Umum — data bersama semua dokumen (tanpa pratinjau cetak). */
export default function DataUmumModule({
  data,
  set,
  setJenis,
  issues,
  onGotoField,
  onRoute,
}: Props) {
  return (
    <ModuleLayout
      meta={MODULE_BY_ID.umum}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={<DataUmumForm data={data} set={set} setJenis={setJenis} issues={issues} />}
      footer={<NextModules onRoute={onRoute} />}
    />
  );
}

/** Pintasan lanjut ke modul dokumen setelah data umum terisi. */
function NextModules({ onRoute }: { onRoute: (r: RouteId) => void }) {
  const next = MODULES.filter((m) => m.id !== "umum");
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Lanjut buat dokumen
      </p>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {next.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onRoute(m.id)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[13px] ${m.tile}`}
            >
              {m.icon}
            </span>
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-slate-800">
              {m.label}
            </span>
            <span className="shrink-0 text-[12px] text-slate-300">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
