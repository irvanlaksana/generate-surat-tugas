import { useMemo, useState } from "react";
import type { BastData } from "../types";
import type { ValidationIssue } from "../lib/validation";
import { countByLevel, issuesForDocs } from "../lib/validation";
import { DOCS } from "../lib/modules";
import type { DocMeta, PreviewTab } from "../lib/modules";
import { pdfFileName } from "../lib/text";
import { printWithFileName } from "../lib/print";
import PrintGate from "../components/PrintGate";
import { PageCard } from "../components/PreviewStage";
import { SuratTugasHal1, SuratTugasHal2 } from "../components/SuratTugas";
import SuratPenyerahan from "../components/SuratPenyerahan";
import BastSheet from "../components/BastSheet";
import LampiranSheet from "../components/LampiranSheet";

interface Props {
  data: BastData;
  issues: ValidationIssue[];
  /** buka halaman isian (opsional langsung ke tab dokumen tertentu) */
  onOpen: (tab?: PreviewTab) => void;
  onGotoField: (path: string) => void;
  onContoh: () => void;
  onReset: () => void;
}

/** Info ringkas tiap dokumen untuk kartu Beranda. */
function metaInfo(m: DocMeta, data: BastData): string {
  switch (m.id) {
    case "tugas":
      return `No. ${data.st.nomor || "—"}`;
    case "penyerahan":
      return data.merekType || "kendaraan —";
    case "bast":
      return `No. ${data.noBast || "—"} · ${data.jenis === "roda2" ? "Roda 2" : "Roda 4"}`;
    case "lampiran":
      return `${data.lampiran.ktp.length + data.lampiran.stnk.length} foto`;
  }
}

function StatusPill({
  error,
  warning,
}: {
  error: number;
  warning: number;
}) {
  const cls = error
    ? "bg-rose-50 text-rose-700 ring-rose-200"
    : warning
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  const text = error
    ? `${error} wajib diisi`
    : warning
      ? `${warning} perlu diperiksa`
      : "Siap dicetak";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold ring-1 ${cls}`}
    >
      {text}
    </span>
  );
}

/** Beranda — ringkasan data & pintasan ke form isian tunggal. */
export default function HomeModule({
  data,
  issues,
  onOpen,
  onGotoField,
  onContoh,
  onReset,
}: Props) {
  const [gateOpen, setGateOpen] = useState(false);

  const total = useMemo(() => countByLevel(issues), [issues]);
  const fileName = useMemo(() => pdfFileName(data), [data]);

  const fotoCount = data.lampiran.ktp.length + data.lampiran.stnk.length;
  const pageCount = 2 + 1 + 1 + (fotoCount > 0 ? 1 : 0);

  const printAll = () => {
    if (total.error > 0 || total.warning > 0) {
      setGateOpen(true);
      return;
    }
    printWithFileName(fileName);
  };

  return (
    <>
      <div className="no-print thin-scroll lg:h-screen lg:overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:py-7">
          {/* ================= HERO ================= */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-7">
            <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-violet-500/20 blur-2xl" />

            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-indigo-300">
              Aplikasi pembuat dokumen
            </p>
            <h2 className="mt-1 text-[24px] font-bold tracking-tight sm:text-[28px]">
              Generator Surat
            </h2>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-slate-300">
              Isi <b className="text-slate-100">satu form</b> untuk{" "}
              <b className="text-slate-100">Surat Tugas</b>,{" "}
              <b className="text-slate-100">Lampiran</b>,{" "}
              <b className="text-slate-100">Surat Penyerahan</b>, dan{" "}
              <b className="text-slate-100">BASTK</b> — data yang sama hanya
              diisi sekali, tidak ada isian ganda.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpen()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.97]"
              >
                🗂️ Isi Data Surat
              </button>
              <button
                type="button"
                onClick={printAll}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20 active:scale-[0.97]"
              >
                🖨️ Cetak Semua Dokumen
                <span className="rounded bg-slate-900/30 px-1.5 py-[1px] text-[10px] font-bold">
                  {pageCount} hal.
                </span>
              </button>
              <button
                type="button"
                onClick={onContoh}
                className="rounded-lg bg-white/10 px-3.5 py-2 text-[12px] font-medium text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20"
              >
                Contoh Data
              </button>
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg bg-white/10 px-3.5 py-2 text-[12px] font-medium text-white ring-1 ring-inset ring-white/20 transition hover:bg-rose-500/25"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
              <span className="rounded-md bg-white/10 px-2 py-1 ring-1 ring-inset ring-white/15">
                Debitur: <b className="text-white">{data.namaDebitur || "—"}</b>
                {data.kecamatan.trim() ? ` · Kec. ${data.kecamatan.trim()}` : ""}
              </span>
              <span className="rounded-md bg-white/10 px-2 py-1 ring-1 ring-inset ring-white/15">
                Unit: <b className="text-white">{data.merekType || "—"}</b>{" "}
                {data.noPolisi || ""}
              </span>
              {total.error > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-semibold text-rose-300 ring-1 ring-rose-400/30">
                  ● {total.error} data wajib belum diisi
                </span>
              ) : total.warning > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                  ● {total.warning} data perlu diperiksa
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  ● Semua dokumen siap dicetak
                </span>
              )}
            </div>
          </div>

          {/* ================= KARTU DOKUMEN ================= */}
          <p className="mb-2 mt-6 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Dokumen — buka pratinjau &amp; cetak
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {DOCS.map((m) => {
              const di = issuesForDocs(issues, [m.id]);
              const { error, warning } = countByLevel(di);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onOpen(m.id)}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-[18px] shadow-sm ${m.tile}`}
                    >
                      {m.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[13px] font-bold text-slate-900">
                        {m.label}
                      </h3>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">
                        {m.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-[14px] text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500">
                      →
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <StatusPill error={error} warning={warning} />
                    <span className="ml-auto min-w-0 truncate text-[10px] text-slate-400">
                      {metaInfo(m, data)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ================= PANDUAN ================= */}
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-slate-900">Cara Pakai</h3>
              <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
                <li>
                  <b>1.</b> Buka <b>Isian Surat</b> dan lengkapi satu form —
                  debitur, perjanjian, kendaraan, petugas, nomor &amp; tanggal,
                  kreditur/mitra, kop, checklist, dan lampiran foto.
                </li>
                <li>
                  <b>2.</b> Pratinjau di panel kanan mengikuti isian secara
                  langsung. Pilih tab dokumen bila hanya ingin melihat/mencetak
                  satu dokumen.
                </li>
                <li>
                  <b>3.</b> Klik <b>Cetak / Simpan PDF</b>. Nama file otomatis{" "}
                  <b>AWALAN-inisialkreditur-namadebitur-kecamatan</b>.
                </li>
                <li>
                  <b>4.</b> Gunakan <b>Cetak Semua Dokumen</b> untuk mencetak
                  seluruh dokumen sekaligus.
                </li>
              </ol>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-[12px] font-bold text-slate-900">
                Pengaturan Cetak
              </h3>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-slate-600">
                <li>
                  • Ukuran kertas <b>F4 / Folio (215 × 330 mm)</b>
                </li>
                <li>
                  • Margin <b>None</b> (tanpa margin)
                </li>
                <li>
                  • Aktifkan <b>Background graphics</b> agar garis & tabel tercetak
                </li>
                <li>
                  • Isian tersimpan otomatis di browser — aman bila halaman
                  tertutup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ============ wadah khusus cetak: semua dokumen ============ */}
      <div className="print-root hidden">
        <div className="page-list flex flex-col items-center gap-8">
          <PageCard label="Halaman 1" badge="Surat Tugas — Hal. 1">
            <SuratTugasHal1 data={data} />
          </PageCard>
          <PageCard label="Halaman 2" badge="Surat Tugas — Hal. 2">
            <SuratTugasHal2 data={data} />
          </PageCard>
          <PageCard label="Halaman 3" badge="Surat Penyerahan">
            <SuratPenyerahan data={data} />
          </PageCard>
          <PageCard
            label="Halaman 4"
            badge={`Berita Acara Serah Terima — ${
              data.jenis === "roda2" ? "Roda 2" : "Roda 4"
            }`}
          >
            <BastSheet data={data} />
          </PageCard>
          {fotoCount > 0 && (
            <PageCard label="Halaman 5" badge="Lampiran KTP & STNK">
              <LampiranSheet data={data} />
            </PageCard>
          )}
        </div>
      </div>

      <PrintGate
        open={gateOpen}
        issues={issues}
        fileName={`${fileName}.pdf`}
        onClose={() => setGateOpen(false)}
        onPrint={() => {
          setGateOpen(false);
          window.setTimeout(() => printWithFileName(fileName), 120);
        }}
        onGotoField={onGotoField}
      />
    </>
  );
}
