import BastSheet from "../components/BastSheet";
import IsianLayout from "../components/IsianLayout";
import LampiranSheet from "../components/LampiranSheet";
import { PageCard } from "../components/PreviewStage";
import SuratPenyerahan from "../components/SuratPenyerahan";
import { SuratTugasHal1, SuratTugasHal2 } from "../components/SuratTugas";
import IsianForm from "../components/forms/IsianForm";
import type { IsianFormProps } from "../components/forms/formkit";
import type { DocId, PreviewTab } from "../lib/modules";

interface Props extends IsianFormProps {
  tab: PreviewTab;
  onTab: (t: PreviewTab) => void;
  docCounts: Record<DocId, { error: number; warning: number }>;
  onGotoField: (path: string) => void;
}

/**
 * Satu-satunya halaman kerja: semua isian surat di panel kiri, pratinjau
 * seluruh dokumen di panel kanan (pilih dokumen lewat tab untuk mencetak).
 */
export default function IsianModule({
  data,
  set,
  setJenis,
  setChecklist,
  issues,
  tab,
  onTab,
  docCounts,
  onGotoField,
}: Props) {
  const fotoCount = data.lampiran.ktp.length + data.lampiran.stnk.length;
  const show = (d: DocId) => tab === "semua" || tab === d;

  const pageCount =
    (show("tugas") ? 2 : 0) +
    (show("penyerahan") ? 1 : 0) +
    (show("bast") ? 1 : 0) +
    (show("lampiran") && fotoCount > 0 ? 1 : 0);

  return (
    <IsianLayout
      data={data}
      issues={issues}
      tab={tab}
      onTab={onTab}
      docCounts={docCounts}
      onGotoField={onGotoField}
      statusChips={
        <span className="hidden rounded-md bg-white px-2 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 sm:inline">
          {pageCount} halaman · {data.jenis === "roda2" ? "🏍️ Roda 2" : "🚗 Roda 4"}
        </span>
      }
      form={
        <IsianForm
          data={data}
          set={set}
          setJenis={setJenis}
          setChecklist={setChecklist}
          issues={issues}
        />
      }
    >
      {show("tugas") && (
        <>
          <PageCard label="Halaman 1" badge="Surat Tugas — Hal. 1">
            <SuratTugasHal1 data={data} />
          </PageCard>
          <PageCard label="Halaman 2" badge="Surat Tugas — Hal. 2">
            <SuratTugasHal2 data={data} />
          </PageCard>
        </>
      )}

      {show("penyerahan") && (
        <PageCard label="Halaman 3" badge="Surat Penyerahan">
          <SuratPenyerahan data={data} />
        </PageCard>
      )}

      {show("bast") && (
        <PageCard
          label="Halaman 4"
          badge={`Berita Acara Serah Terima — ${
            data.jenis === "roda2" ? "Roda 2" : "Roda 4"
          }`}
        >
          <BastSheet data={data} />
        </PageCard>
      )}

      {show("lampiran") &&
        (fotoCount > 0 ? (
          <PageCard label="Halaman 5" badge="Lampiran KTP & STNK">
            <LampiranSheet data={data} />
          </PageCard>
        ) : (
          <p className="no-print rounded-lg bg-amber-50 px-3 py-2 text-center text-[11.5px] font-medium text-amber-700 ring-1 ring-amber-200">
            Belum ada foto — unggah KTP / STNK di bagian “Lampiran Foto” pada
            panel isian.
          </p>
        ))}
    </IsianLayout>
  );
}
