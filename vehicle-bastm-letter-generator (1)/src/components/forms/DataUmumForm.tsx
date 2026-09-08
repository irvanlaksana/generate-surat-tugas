import {
  KREDITUR_DEFAULT,
  KREDITUR_PRESETS,
  catatanKrediturText,
  initialsOf,
} from "../../lib/text";
import type { ValidationIssue } from "../../lib/validation";
import KopEditor from "../KopEditor";
import { Field, Grid, GroupTitle, Segmented, TextArea, TextInput } from "../ui";
import type { BastData, VehicleType } from "../../types";
import { useIssueMaps } from "./formkit";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  setJenis: (j: VehicleType) => void;
  issues: ValidationIssue[];
}

/**
 * Form modul Data Umum — semua data yang dipakai bersama oleh
 * Surat Tugas, Surat Penyerahan, BAST, dan Lampiran.
 */
export default function DataUmumForm({ data, set, setJenis, issues }: Props) {
  const { E, W } = useIssueMaps(issues);
  const krediturSingkat = initialsOf(data.kreditur);

  return (
    <div className="space-y-1">
      {/* ============ JENIS KENDARAAN ============ */}
      <GroupTitle hint="menentukan checklist BAST">Jenis Kendaraan</GroupTitle>
      <Segmented
        value={data.jenis}
        onChange={setJenis}
        options={[
          { value: "roda2", label: "🏍️ Roda 2" },
          { value: "roda4", label: "🚗 Roda 4" },
        ]}
      />

      {/* ============ DEBITUR ============ */}
      <GroupTitle hint="dipakai semua dokumen">Debitur</GroupTitle>
      <Grid cols={2}>
        <Field
          label="Nama Debitur"
          required
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
        <Field
          label="Kecamatan"
          required
          name="kecamatan"
          error={E("kecamatan")}
          hint="dipakai di nama file PDF"
        >
          <TextInput
            upper
            invalid={!!E("kecamatan")}
            value={data.kecamatan}
            placeholder="WANGON"
            onChange={(e) => set("kecamatan", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ PERJANJIAN ============ */}
      <GroupTitle hint="Surat Penyerahan & BAST">Perjanjian Pembiayaan</GroupTitle>
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

      {/* ============ KENDARAAN ============ */}
      <GroupTitle hint="sesuai STNK / BPKB">Data Kendaraan</GroupTitle>
      <Grid cols={2}>
        <Field label="Merk / Type" required span name="merekType" error={E("merekType")}>
          <TextInput
            upper
            invalid={!!E("merekType")}
            value={data.merekType}
            placeholder={data.jenis === "roda2" ? "HONDA / BEAT CBS" : "HONDA / MINIBUS"}
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

      {/* ============ KREDITUR & MITRA ============ */}
      <GroupTitle hint={krediturSingkat ? `inisial: ${krediturSingkat}` : undefined}>
        Kreditur &amp; Mitra
      </GroupTitle>
      <Field
        label="Nama Kreditur"
        name="kreditur"
        hint="Dipakai di BAST, Penyerahan, Surat Tugas & nama file"
      >
        <TextInput
          value={data.kreditur}
          placeholder={KREDITUR_DEFAULT}
          onChange={(e) => set("kreditur", e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-1 pt-1">
        {KREDITUR_PRESETS.map((k) => {
          const singkat = k.match(/\(([^)]+)\)/)?.[1] ?? initialsOf(k, 4);
          return (
            <button
              key={k}
              type="button"
              title={k}
              onClick={() => set("kreditur", k)}
              className={`rounded px-1.5 py-[1px] text-[10px] font-medium transition ${
                data.kreditur === k
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {singkat}
            </button>
          );
        })}
      </div>

      <div className="pt-1.5">
        <Field label="Kalimat Kreditur" hint="Kosongkan = kalimat baku otomatis">
          <TextArea
            rows={2}
            value={data.catatanKreditur}
            placeholder={catatanKrediturText(data.kreditur)}
            onChange={(e) => set("catatanKreditur", e.target.value)}
          />
        </Field>
      </div>

      <div className="pt-1.5">
        <Grid cols={2}>
          <Field label="Nama Mitra" required span name="mitraNama" error={E("mitraNama")}>
            <TextInput
              upper
              invalid={!!E("mitraNama")}
              value={data.mitraNama}
              placeholder="PT MITRA JASATRIA INDONESIA"
              onChange={(e) => set("mitraNama", e.target.value)}
            />
          </Field>
          <Field label="No. Legalitas / AHU">
            <TextInput
              value={data.mitraLegalitas}
              placeholder="AHU-056731.AH.01.01"
              onChange={(e) => set("mitraLegalitas", e.target.value)}
            />
          </Field>
          <Field label="PIC Lapangan">
            <TextInput
              upper
              value={data.mitraPic}
              placeholder="Nama penanggung jawab"
              onChange={(e) => set("mitraPic", e.target.value)}
            />
          </Field>
          <Field label="Alamat Mitra" span>
            <TextArea
              rows={2}
              value={data.mitraAlamat}
              placeholder="Alamat kantor mitra"
              onChange={(e) => set("mitraAlamat", e.target.value)}
            />
          </Field>
        </Grid>
      </div>

      {/* ============ IDENTITAS PERUSAHAAN ============ */}
      <GroupTitle hint="kop teks BAST & Surat Penyerahan">
        Identitas Perusahaan
      </GroupTitle>
      <div className="space-y-1">
        <Field label="Nama Perusahaan">
          <TextInput
            value={data.perusahaan}
            placeholder="PT. ADIRA DINAMIKA MULTI FINANCE, Tbk"
            onChange={(e) => set("perusahaan", e.target.value)}
          />
        </Field>
        <Field label="Cabang">
          <TextInput
            upper
            value={data.cabang}
            placeholder="BANJARNEGARA-S. PARMAN"
            onChange={(e) => set("cabang", e.target.value)}
          />
        </Field>
        <Field label="Alamat Cabang">
          <TextInput
            upper
            value={data.alamat}
            placeholder="JL JEND SUDIRMAN NO 693, BANYUMAS"
            onChange={(e) => set("alamat", e.target.value)}
          />
        </Field>
      </div>

      {/* ============ KOP SURAT ============ */}
      <GroupTitle hint="upload &amp; pengaturan posisi">Kop Surat</GroupTitle>
      <div data-field="kop.image">
        <KopEditor
          kop={data.kop}
          onChange={(k) => set("kop", k)}
          warning={W("kop.image")}
        />
      </div>
    </div>
  );
}
