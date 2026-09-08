import { PERLENGKAPAN } from "../../data/perlengkapan";
import type { BastData, ChecklistMap, VehicleType } from "../../types";
import { hariTanggal } from "../../lib/format";
import { catatanKreditur, mitraLine } from "../../lib/text";
import type { ValidationIssue } from "../../lib/validation";
import ChecklistEditor from "../ChecklistEditor";
import {
  Check,
  Field,
  Grid,
  GroupTitle,
  Segmented,
  TextInput,
} from "../ui";
import { useIssueMaps } from "./formkit";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  setJenis: (j: VehicleType) => void;
  setChecklist: (c: ChecklistMap) => void;
  issues: ValidationIssue[];
}

/** Form modul BAST — Berita Acara Serah Terima Kendaraan. */
export default function BastForm({
  data,
  set,
  setJenis,
  setChecklist,
  issues,
}: Props) {
  const { E, W } = useIssueMaps(issues);
  const isR2 = data.jenis === "roda2";

  const filledChecklist = Object.values(data.checklist).filter(
    (e) => e.p1 || e.p2,
  ).length;

  return (
    <div className="space-y-1">
      {/* ============ NOMOR & TANGGAL ============ */}
      <GroupTitle hint="identitas dokumen">Nomor &amp; Tanggal</GroupTitle>
      <Grid cols={2}>
        <Field label="No. BAST" required name="noBast" error={E("noBast")}>
          <TextInput
            invalid={!!E("noBast")}
            value={data.noBast}
            placeholder="12496/BAST/2026"
            onChange={(e) => set("noBast", e.target.value)}
          />
        </Field>
        <Field label="Tanggal BAST" required name="tanggalBast" error={E("tanggalBast")}>
          <TextInput
            type="date"
            invalid={!!E("tanggalBast")}
            value={data.tanggalBast}
            onChange={(e) => set("tanggalBast", e.target.value)}
          />
        </Field>
        <Field
          label="Hari &amp; Tanggal"
          span
          hint={`Auto: ${hariTanggal(data.tanggalBast) || "-"}`}
        >
          <TextInput
            value={data.hariTanggal}
            placeholder={hariTanggal(data.tanggalBast)}
            onChange={(e) => set("hariTanggal", e.target.value)}
          />
        </Field>
        <Field
          label="No. Surat Tugas"
          span
          name="noSuratTugas"
          warn={W("noSuratTugas")}
          hint="dicetak di kaki BAST"
        >
          <TextInput
            upper
            value={data.noSuratTugas}
            placeholder="040426C01061"
            onChange={(e) => set("noSuratTugas", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ PERJANJIAN & DEBITUR ============ */}
      <GroupTitle hint="dicetak di paragraf pembuka">Perjanjian &amp; Debitur</GroupTitle>
      <Grid cols={2}>
        <Field
          label="No. Perjanjian"
          required
          name="noPerjanjian"
          error={E("noPerjanjian")}
        >
          <TextInput
            invalid={!!E("noPerjanjian")}
            value={data.noPerjanjian}
            placeholder="040424210837"
            onChange={(e) => set("noPerjanjian", e.target.value)}
          />
        </Field>
        <Field label="Tgl. Perjanjian" name="tglPerjanjian" warn={W("tglPerjanjian")}>
          <TextInput
            upper
            value={data.tglPerjanjian}
            placeholder="13-FEB-24"
            onChange={(e) => set("tglPerjanjian", e.target.value)}
          />
        </Field>
        <Field
          label="Nama Debitur"
          required
          span
          name="namaDebitur"
          error={E("namaDebitur")}
        >
          <TextInput
            upper
            invalid={!!E("namaDebitur")}
            value={data.namaDebitur}
            placeholder="MARYANTO"
            onChange={(e) => set("namaDebitur", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ JENIS KENDARAAN ============ */}
      <GroupTitle hint="checklist menyesuaikan">Jenis Kendaraan</GroupTitle>
      <Segmented
        value={data.jenis}
        onChange={setJenis}
        options={[
          { value: "roda2", label: "🏍️ Roda 2" },
          { value: "roda4", label: "🚗 Roda 4" },
        ]}
      />

      {/* ============ SPESIFIKASI ============ */}
      <GroupTitle hint="sesuai STNK / BPKB">Spesifikasi Kendaraan</GroupTitle>
      <Grid cols={2}>
        <Field label="Merk / Type" required span name="merekType" error={E("merekType")}>
          <TextInput
            upper
            invalid={!!E("merekType")}
            value={data.merekType}
            placeholder={isR2 ? "HONDA / BEAT CBS" : "HONDA / MINIBUS"}
            onChange={(e) => set("merekType", e.target.value)}
          />
        </Field>
        <Field label="No. Rangka">
          <TextInput
            upper
            value={data.noRangka}
            placeholder="MHRDD1750PJ407376"
            onChange={(e) => set("noRangka", e.target.value)}
          />
        </Field>
        <Field label="No. Mesin">
          <TextInput
            upper
            value={data.noMesin}
            placeholder="L12B35431364"
            onChange={(e) => set("noMesin", e.target.value)}
          />
        </Field>
        <Field label="No. Polisi" required name="noPolisi" error={E("noPolisi")}>
          <TextInput
            upper
            invalid={!!E("noPolisi")}
            value={data.noPolisi}
            placeholder="R1187UC"
            onChange={(e) => set("noPolisi", e.target.value)}
          />
        </Field>
        <Field label="Warna">
          <TextInput
            upper
            value={data.warna}
            placeholder="MERAH"
            onChange={(e) => set("warna", e.target.value)}
          />
        </Field>
        <Field label="Tahun" name="tahun" error={E("tahun")}>
          <TextInput
            invalid={!!E("tahun")}
            value={data.tahun}
            placeholder="2023"
            inputMode="numeric"
            maxLength={4}
            onChange={(e) => set("tahun", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
        <Field label="STNK / BPKB a/n" name="bpkbAtasNama" warn={W("bpkbAtasNama")}>
          <TextInput
            upper
            value={data.bpkbAtasNama}
            placeholder="SULASTRI"
            onChange={(e) => set("bpkbAtasNama", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ CHECKLIST ============ */}
      <GroupTitle
        hint={`${PERLENGKAPAN[data.jenis].label} · ${filledChecklist} terisi`}
      >
        Checklist Perlengkapan
      </GroupTitle>
      <ChecklistEditor
        jenis={data.jenis}
        checklist={data.checklist}
        onChange={setChecklist}
      />

      {/* ============ OPSI ============ */}
      <GroupTitle hint="opsi cetak BAST">Opsi Dokumen</GroupTitle>
      <Grid cols={2}>
        <Field label="Penyelesaian">
          <Segmented
            value={data.penyelesaian}
            onChange={(v) => set("penyelesaian", v)}
            options={[
              { value: "", label: "—" },
              { value: "YA", label: "YA" },
              { value: "TIDAK", label: "TIDAK" },
            ]}
          />
        </Field>
        <Field label={isR2 ? "Aksesoris" : "Karoseri"}>
          <Segmented
            value={data.karoseri}
            onChange={(v) => set("karoseri", v)}
            options={[
              { value: "", label: "—" },
              { value: "Termasuk", label: "Ya" },
              { value: "Tidak Termasuk", label: "Tidak" },
            ]}
          />
        </Field>
      </Grid>
      <div className="pt-0.5">
        <Check
          checked={data.labelMesinBenar}
          onChange={(v) => set("labelMesinBenar", v)}
        >
          Perbaiki label kolom jadi “No. Mesin”
        </Check>
        <Check
          checked={data.tampilkanCatatanBast}
          onChange={(v) => set("tampilkanCatatanBast", v)}
        >
          Tampilkan kalimat kreditur di BAST
        </Check>
        <Check
          checked={data.tampilkanMitraBast}
          onChange={(v) => set("tampilkanMitraBast", v)}
        >
          Tampilkan kalimat mitra pelaksana
        </Check>
        <Check
          checked={data.mitraSebagaiPenerima}
          onChange={(v) => set("mitraSebagaiPenerima", v)}
        >
          Cetak nama mitra di kolom “Yang Menerima”
        </Check>
      </div>
      {(data.tampilkanCatatanBast || (data.tampilkanMitraBast && data.mitraNama)) && (
        <div className="mt-1 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
          <span className="mb-[1px] block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Pratinjau kalimat BAST
          </span>
          {data.tampilkanCatatanBast && (
            <p className="mb-0.5">“{catatanKreditur(data)}”</p>
          )}
          {data.tampilkanMitraBast && data.mitraNama && (
            <p>“{mitraLine(data)}”</p>
          )}
        </div>
      )}

      {/* ============ TANDA TANGAN ============ */}
      <GroupTitle hint="kolom tanda tangan">Tanda Tangan</GroupTitle>
      <Grid cols={2}>
        <Field label="Yang Bertandatangan">
          <TextInput
            upper
            value={data.ttdBertandatangan}
            placeholder="Nama konsumen"
            onChange={(e) => set("ttdBertandatangan", e.target.value)}
          />
        </Field>
        <Field label="Yang Menerima 1">
          <TextInput
            upper
            value={data.ttdMenerima1}
            placeholder="FILEMO HALAWA"
            onChange={(e) => set("ttdMenerima1", e.target.value)}
          />
        </Field>
        <Field label="Yang Menyerahkan">
          <TextInput
            upper
            value={data.ttdMenyerahkan}
            placeholder="FILEMO HALAWA"
            onChange={(e) => set("ttdMenyerahkan", e.target.value)}
          />
        </Field>
        <Field label="Yang Menerima 2">
          <TextInput
            upper
            value={data.ttdMenerima2}
            placeholder="Petugas gudang"
            onChange={(e) => set("ttdMenerima2", e.target.value)}
          />
        </Field>
      </Grid>
    </div>
  );
}
