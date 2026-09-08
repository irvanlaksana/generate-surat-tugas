import { MODULE_BY_ID } from "../lib/modules";
import ModuleLayout from "../components/ModuleLayout";
import { PageCard } from "../components/PreviewStage";
import SuratPenyerahan from "../components/SuratPenyerahan";
import PenyerahanForm from "../components/forms/PenyerahanForm";
import type { ModulePageProps } from "../components/forms/formkit";

/** Modul Surat Penyerahan — form, pratinjau, & cetak terpisah. */
export default function PenyerahanModule({
  data,
  set,
  issues,
  onGotoField,
}: ModulePageProps) {
  return (
    <ModuleLayout
      meta={MODULE_BY_ID.penyerahan}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={<PenyerahanForm data={data} set={set} issues={issues} />}
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          1 halaman · F4
        </span>
      }
    >
      <PageCard label="Halaman 1" badge="Surat Penyerahan">
        <SuratPenyerahan data={data} />
      </PageCard>
    </ModuleLayout>
  );
}
