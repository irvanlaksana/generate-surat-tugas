import { useMemo, useState } from "react";
import type { BastData } from "../types";
import type { ValidationIssue } from "../lib/validation";
import { countByLevel, issuesForModules } from "../lib/validation";
import { MODULES } from "../lib/modules";
import type { ModuleMeta, RouteId } from "../lib/modules";
import { fieldOwner } from "../lib/modules";
import { pdfFileName } from "../lib/text";
import { printWithFileName } from "../lib/print";
import PrintGate from "../components/PrintGate";
import type { GateIssue } from "../components/PrintGate";
import { PageCard } from "../components/PreviewStage";
import { SuratTugasHal1, SuratTugasHal2 } from "../components/SuratTugas";
import SuratPenyerahan from "../components/SuratPenyerahan";
import BastSheet from "../components/BastSheet";
import LampiranSheet from "../components/LampiranSheet";

interface Props {
  data: BastData;
  issues: ValidationIssue[];
  onRoute: (r: RouteId) => void;
  onGotoField: (path: string) => void;
  onContoh: () => void;
  onReset: () => void;
}

/** Info ringkas tiap modul untuk kartu Beranda. */
function metaInfo(m: ModuleMeta, data: BastData): string {
  switch (m.id) {
    case "umum":
      return `${data.namaDebitur || "debitur —"} · ${data.kecamatan || "kecamatan —"}`;
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
  readyLabel,
}: {
  error: number;
  warning: number;
  readyLabel: string;
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
      : readyLabel;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold ring-1 ${cls}`}
    >
      {text}
    </span>
  );
}

/** Beranda — dasbor menu modul-modul dokumen. */
export default function HomeModule({
  data,
  issues,
  onRoute,
  onGotoField,
  onContoh,
  onReset,
}: Props) {
  const [gateOpen, setGateOpen] = useState(false);

  const total = useMemo(() => countByLevel(issues), [issues]);
  const fileName = useMemo(() => pdfFileName(data), [data]);
  const gateIssues = useMemo<GateIssue[]>(
    () => issues.map((i) => ({ ...i, owner: fieldOwner(i.path) })),
    [issues],
  );

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
              Susun <b className="text-slate-100">Surat Tugas</b>,{" "}
              <b className="text-slate-100">Surat Penyerahan</b>,{" "}
              <b className="text-slate-100">BAST Kendaraan</b>, dan{" "}
              <b className="text-slate-100">Lampiran</b> sebagai modul terpisah —
              satu data bersama, tiap dokumen dicetak sendiri.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={printAll}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100 active:scale-[0.97]"
              >
                🖨️ Cetak Semua Dokumen
                <span className="rounded bg-slate-900/10 px-1.5 py-[1px] text-[10px] font-bold">
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

            <div className="mt-4">
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

          {/* ================= KARTU MODUL ================= */}
          <p className="mb-2 mt-6 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Pilih Modul Dokumen
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MODULES.map((m) => {
              const mi = issuesForModules(issues, [m.id]);
              const { error, warning } = countByLevel(mi);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onRoute(m.id)}
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
                    <StatusPill
                      error={error}
                      warning={warning}
                      readyLabel={m.id === "umum" ? "Data lengkap" : "Siap dicetak"}
                    />
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
                  <b>1.</b> Isi modul <b>Data Umum</b> — debitur, kendaraan,
                  kreditur, mitra, & kop surat.
                </li>
                <li>
                  <b>2.</b> Buka modul dokumen yang dibutuhkan (Surat Tugas /
                  Penyerahan / BAST / Lampiran) dan lengkapi detailnya.
                </li>
                <li>
                  <b>3.</b> Periksa pratinjau, lalu <b>Cetak / Simpan PDF</b> —
                  hanya dokumen modul itu yang dicetak. Nama file otomatis{" "}
                  <b>AWALAN-inisialkreditur-namadebitur-kecamatan</b>.
                </li>
                <li>
                  <b>4.</b> Gunakan <b>Cetak Semua Dokumen</b> untuk mencetak
                  sekaligus dari Beranda.
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
        issues={gateIssues}
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
