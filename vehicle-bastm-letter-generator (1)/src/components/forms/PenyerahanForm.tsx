import type { BastData } from "../../types";
import { catatanKreditur } from "../../lib/text";
import type { ValidationIssue } from "../../lib/validation";
import { Check, Field, Grid, GroupTitle, TextInput } from "../ui";
import { DebiturRingkas, useIssueMaps } from "./formkit";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  issues: ValidationIssue[];
}

/** Form modul Surat Penyerahan. */
export default function PenyerahanForm({ data, set, issues }: Props) {
  const { E, W } = useIssueMaps(issues);

  return (
    <div className="space-y-1">
      <DebiturRingkas data={data} />

      {/* ============ PERJANJIAN ============ */}
      <GroupTitle hint="dicetak pada poin 1">Perjanjian Pembiayaan</GroupTitle>
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
      </Grid>

      {/* ============ SPESIFIKASI ============ */}
      <GroupTitle hint="sesuai STNK / BPKB">Spesifikasi Kendaraan</GroupTitle>
      <Grid cols={2}>
        <Field label="Merk / Type" required span name="merekType" error={E("merekType")}>
          <TextInput
            upper
            invalid={!!E("merekType")}
            value={data.merekType}
            placeholder="HONDA / MINIBUS"
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
        <Field label="BPKB atas Nama" name="bpkbAtasNama" warn={W("bpkbAtasNama")}>
          <TextInput
            upper
            value={data.bpkbAtasNama}
            placeholder="SULASTRI"
            onChange={(e) => set("bpkbAtasNama", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ PERUSAHAAN ============ */}
      <GroupTitle hint="dicetak pada poin 3, 4 &amp; penutup">
        Perusahaan Penerima
      </GroupTitle>
      <Field label="Nama Perusahaan">
        <TextInput
          value={data.perusahaan}
          placeholder="PT. ADIRA DINAMIKA MULTI FINANCE, Tbk"
          onChange={(e) => set("perusahaan", e.target.value)}
        />
      </Field>

      {/* ============ KALIMAT KREDITUR ============ */}
      <GroupTitle hint="poin 5 surat">Kalimat Kreditur</GroupTitle>
      <div className="pt-0.5">
        <Check
          checked={data.tampilkanCatatanPenyerahan}
          onChange={(v) => set("tampilkanCatatanPenyerahan", v)}
        >
          Tampilkan kalimat kreditur sebagai poin 5
        </Check>
      </div>
      {data.tampilkanCatatanPenyerahan && (
        <div className="mt-1 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
          <span className="mb-[1px] block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Pratinjau poin 5
          </span>
          “{catatanKreditur(data)}”
        </div>
      )}
    </div>
  );
}
