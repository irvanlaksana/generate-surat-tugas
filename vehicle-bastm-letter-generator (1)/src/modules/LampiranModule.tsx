import { MODULE_BY_ID } from "../lib/modules";
import ModuleLayout from "../components/ModuleLayout";
import { PageCard } from "../components/PreviewStage";
import LampiranSheet from "../components/LampiranSheet";
import LampiranForm from "../components/forms/LampiranForm";
import type { ModulePageProps } from "../components/forms/formkit";

/** Modul Lampiran — unggah & cetak foto KTP/STNK secara terpisah. */
export default function LampiranModule({
  data,
  set,
  issues,
  onGotoField,
}: ModulePageProps) {
  const fotoCount = data.lampiran.ktp.length + data.lampiran.stnk.length;

  return (
    <ModuleLayout
      meta={MODULE_BY_ID.lampiran}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={<LampiranForm data={data} set={set} issues={issues} />}
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          1 halaman · {fotoCount} foto
        </span>
      }
    >
      {fotoCount === 0 && (
        <p className="no-print rounded-lg bg-amber-50 px-3 py-2 text-center text-[11.5px] font-medium text-amber-700 ring-1 ring-amber-200">
          Belum ada foto — unggah KTP / STNK di panel kiri untuk mengisi
          lampiran.
        </p>
      )}
      <PageCard label="Halaman 1" badge="Lampiran KTP & STNK">
        <LampiranSheet data={data} />
      </PageCard>
    </ModuleLayout>
  );
}
