import { MODULE_BY_ID } from "../lib/modules";
import ModuleLayout from "../components/ModuleLayout";
import { PageCard } from "../components/PreviewStage";
import BastSheet from "../components/BastSheet";
import BastForm from "../components/forms/BastForm";
import type { ModulePageProps } from "../components/forms/formkit";

/** Modul BAST — form + checklist, pratinjau, & cetak terpisah. */
export default function BastModule({
  data,
  set,
  setJenis,
  setChecklist,
  issues,
  onGotoField,
}: ModulePageProps) {
  const jenis = data.jenis === "roda2" ? "🏍️ Roda 2" : "🚗 Roda 4";

  return (
    <ModuleLayout
      meta={MODULE_BY_ID.bast}
      data={data}
      issues={issues}
      onGotoField={onGotoField}
      form={
        <BastForm
          data={data}
          set={set}
          setJenis={setJenis}
          setChecklist={setChecklist}
          issues={issues}
        />
      }
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          1 halaman · {jenis}
        </span>
      }
    >
      <PageCard
        label="Halaman 1"
        badge={`Berita Acara Serah Terima — ${
          data.jenis === "roda2" ? "Roda 2" : "Roda 4"
        }`}
      >
        <BastSheet data={data} />
      </PageCard>
    </ModuleLayout>
  );
}
