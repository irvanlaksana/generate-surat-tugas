import { useMemo } from "react";
import type { BastData, ChecklistMap, VehicleType } from "../types";
import type { SuratTugasData } from "../types";
import { PERLENGKAPAN } from "../data/perlengkapan";
import { hariTanggal } from "../lib/format";
import {
  KREDITUR_DEFAULT,
  KREDITUR_PRESETS,
  catatanKreditur,
  catatanKrediturText,
  countForDate,
  generateNomorST,
  initialsOf,
  mitraLine,
  nextCountForDate,
} from "../lib/text";
import { issueMap } from "../lib/validation";
import type { ValidationIssue } from "../lib/validation";
import ChecklistEditor from "./ChecklistEditor";
import KopEditor from "./KopEditor";
import {
  Check,
  Field,
  Grid,
  GroupTitle,
  Segmented,
  TextArea,
  TextInput,
  UploadBox,
} from "./ui";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  setJenis: (j: VehicleType) => void;
  setChecklist: (c: ChecklistMap) => void;
  issues: ValidationIssue[];
}

export default function FormPanel({
  data,
  set,
  setJenis,
  setChecklist,
  issues,
}: Props) {
  const isR2 = data.jenis === "roda2";

  /** pesan error per field → ditampilkan di bawah input */
  const errors = useMemo(() => issueMap(issues, "error"), [issues]);
  const warns = useMemo(() => issueMap(issues, "warning"), [issues]);
  const E = (path: string) => errors[path];
  const W = (path: string) => warns[path];

  const st = <K extends keyof SuratTugasData>(k: K, v: SuratTugasData[K]) =>
    set("st", { ...data.st, [k]: v });

  const filledChecklist = Object.values(data.checklist).filter(
    (e) => e.p1 || e.p2,
  ).length;

  const addLampiran = async (jenis: "ktp" | "stnk", files: FileList | null) => {
    if (!files?.length) return;
    const images = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    set("lampiran", {
      ...data.lampiran,
      [jenis]: [...data.lampiran[jenis], ...images],
    });
  };

  const removeLampiran = (jenis: "ktp" | "stnk", index: number) =>
    set("lampiran", {
      ...data.lampiran,
      [jenis]: data.lampiran[jenis].filter((_, i) => i !== index),
    });

  const krediturSingkat = initialsOf(data.kreditur);

  return (
    <div className="space-y-1">
      {/* ============ JENIS KENDARAAN ============ */}
      <Segmented<VehicleType>
        value={data.jenis}
        onChange={setJenis}
        options={[
          { value: "roda2", label: "🏍️ Roda 2" },
          { value: "roda4", label: "🚗 Roda 4" },
        ]}
      />

      {/* ============ DEBITUR & DOKUMEN ============ */}
      <GroupTitle>Debitur &amp; Dokumen</GroupTitle>
      <Grid cols={2}>
        <Field label="Nama Debitur" required name="namaDebitur" error={E("namaDebitur")}>
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

        <Field
          label="Nomor Surat"
          required
          span
          name="st.nomor"
          error={E("st.nomor")}
          hint={
            countForDate(data.st.tanggalSuratISO) > 0
              ? `Sudah ${countForDate(data.st.tanggalSuratISO)} surat tercatat untuk tanggal ini`
              : "Format: ST-DC/{mitra}.{kreditur}/{thn}/{bln}/{seri}"
          }
        >
          <div className="flex gap-1">
            <TextInput
              invalid={!!E("st.nomor")}
              value={data.st.nomor}
              placeholder="ST-DC/MJI.KAMM/2026/08/0483"
              onChange={(e) => st("nomor", e.target.value)}
            />
            <button
              type="button"
              onClick={() => {
                const n = nextCountForDate(data.st.tanggalSuratISO);
                st(
                  "nomor",
                  generateNomorST(
                    {
                      mitraNama: data.mitraNama,
                      kreditur: data.kreditur,
                      tanggalSuratISO: data.st.tanggalSuratISO,
                    },
                    n,
                  ),
                );
              }}
              title="Buat nomor surat otomatis"
              className="shrink-0 rounded-md bg-indigo-600 px-2 text-[11px] font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
            >
              🎲 Acak
            </button>
          </div>
        </Field>

        <Field label="No. Angsuran" name="st.noAngsuran" warn={W("st.noAngsuran")}>
          <TextInput
            value={data.st.noAngsuran}
            placeholder="12"
            inputMode="numeric"
            onChange={(e) => st("noAngsuran", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
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
        <Field label="No. Perjanjian" required name="noPerjanjian" error={E("noPerjanjian")}>
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
        <Field label="STNK / BPKB a/n" name="bpkbAtasNama" warn={W("bpkbAtasNama")}>
          <TextInput
            upper
            value={data.bpkbAtasNama}
            placeholder="SULASTRI"
            onChange={(e) => set("bpkbAtasNama", e.target.value)}
          />
        </Field>

        <Field
          label="No. Surat Tugas (kaki BAST)"
          name="noSuratTugas"
          warn={W("noSuratTugas")}
        >
          <TextInput
            upper
            value={data.noSuratTugas}
            placeholder="040426C01061"
            onChange={(e) => set("noSuratTugas", e.target.value)}
          />
        </Field>
        <Field label="Hari & Tanggal" hint={`Auto: ${hariTanggal(data.tanggalBast) || "-"}`}>
          <TextInput
            value={data.hariTanggal}
            placeholder={hariTanggal(data.tanggalBast)}
            onChange={(e) => set("hariTanggal", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ KOP SURAT ============ */}
      <GroupTitle hint="upload &amp; pengaturan posisi">Kop Surat</GroupTitle>
      <div data-field="kop.image">
        <KopEditor
          kop={data.kop}
          onChange={(k) => set("kop", k)}
          warning={W("kop.image")}
        />
      </div>

      {/* ============ LAMPIRAN ============ */}
      <GroupTitle hint="KTP di atas, STNK di bawah">Lampiran Foto</GroupTitle>
      <Grid cols={2}>
        <div data-field="lampiran.ktp">
          <UploadBox
            label="Upload KTP"
            hint={W("lampiran.ktp") ?? "klik / seret foto"}
            icon="🪪"
            invalid={!!W("lampiran.ktp")}
            images={data.lampiran.ktp}
            onFiles={(files) => void addLampiran("ktp", files)}
            onRemove={(i) => removeLampiran("ktp", i)}
          />
        </div>
        <div data-field="lampiran.stnk">
          <UploadBox
            label="Upload STNK"
            hint={W("lampiran.stnk") ?? "klik / seret foto"}
            icon="📄"
            invalid={!!W("lampiran.stnk")}
            images={data.lampiran.stnk}
            onFiles={(files) => void addLampiran("stnk", files)}
            onRemove={(i) => removeLampiran("stnk", i)}
          />
        </div>
      </Grid>

      {/* ============ DATA KENDARAAN ============ */}
      <GroupTitle>Data Kendaraan</GroupTitle>
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
      </Grid>
      <div className="pt-1.5">
        <Grid cols={3}>
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
        </Grid>
      </div>

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
        <Field label="Kalimat Penyerahan" hint="Kosongkan = kalimat baku otomatis">
          <TextArea
            rows={2}
            value={data.catatanKreditur}
            placeholder={catatanKrediturText(data.kreditur)}
            onChange={(e) => set("catatanKreditur", e.target.value)}
          />
        </Field>
      </div>
      <div className="pt-0.5">
        <Check
          checked={data.tampilkanCatatanBast}
          onChange={(v) => set("tampilkanCatatanBast", v)}
        >
          Tampilkan kalimat kreditur di BAST
        </Check>
        <Check
          checked={data.tampilkanCatatanPenyerahan}
          onChange={(v) => set("tampilkanCatatanPenyerahan", v)}
        >
          Tampilkan di Surat Penyerahan (poin 5)
        </Check>
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
      <div className="pt-0.5">
        <Check
          checked={data.tampilkanMitraBast}
          onChange={(v) => set("tampilkanMitraBast", v)}
        >
          Tampilkan kalimat mitra di BAST
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
          {data.tampilkanCatatanBast && <p className="mb-0.5">“{catatanKreditur(data)}”</p>}
          {data.tampilkanMitraBast && data.mitraNama && <p>“{mitraLine(data)}”</p>}
        </div>
      )}

      {/* ============ SURAT TUGAS ============ */}
      <GroupTitle hint="pemberi &amp; penerima tugas">Surat Tugas</GroupTitle>
      <Grid cols={2}>
        <Field label="Pemberi Tugas">
          <TextInput
            upper
            value={data.st.pemberiNama}
            onChange={(e) => st("pemberiNama", e.target.value)}
          />
        </Field>
        <Field label="Jabatan">
          <TextInput
            upper
            value={data.st.pemberiJabatan}
            onChange={(e) => st("pemberiJabatan", e.target.value)}
          />
        </Field>
        <Field label="Petugas" required span name="st.petugasNama" error={E("st.petugasNama")}>
          <TextInput
            upper
            invalid={!!E("st.petugasNama")}
            value={data.st.petugasNama}
            onChange={(e) => st("petugasNama", e.target.value)}
          />
        </Field>
        <Field label="NIK Petugas" name="st.petugasNik" error={E("st.petugasNik")}>
          <TextInput
            invalid={!!E("st.petugasNik")}
            value={data.st.petugasNik}
            placeholder="16 angka"
            inputMode="numeric"
            maxLength={16}
            onChange={(e) => st("petugasNik", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
        <Field label="Jabatan Petugas">
          <TextInput
            value={data.st.petugasJabatan}
            onChange={(e) => st("petugasJabatan", e.target.value)}
          />
        </Field>
      </Grid>

      <div className="pt-1.5">
        <Grid cols={2}>
          <Field label="No. Kontrak" name="st.noKontrak" warn={W("st.noKontrak")}>
            <TextInput
              value={data.st.noKontrak}
              placeholder="02900325"
              onChange={(e) => st("noKontrak", e.target.value)}
            />
          </Field>
          <Field label="Nama Nasabah" required name="st.nasabahNama" error={E("st.nasabahNama")}>
            <TextInput
              upper
              invalid={!!E("st.nasabahNama")}
              value={data.st.nasabahNama}
              onChange={(e) => st("nasabahNama", e.target.value)}
            />
          </Field>
          <Field label="Alamat Nasabah" span hint={data.kecamatan ? `Kec. ${data.kecamatan}` : undefined}>
            <TextArea
              rows={2}
              value={data.st.nasabahAlamat}
              placeholder="PENGADEGAN RT 001 RW 004, PENGADEGAN, WANGON"
              onChange={(e) => st("nasabahAlamat", e.target.value)}
            />
          </Field>
          <Field label="Jatuh Tempo">
            <TextInput
              upper
              value={data.st.jatuhTempo}
              placeholder="23 MARET 2018"
              onChange={(e) => st("jatuhTempo", e.target.value)}
            />
          </Field>
          <Field label="Angsuran / Total" span hint="Nilai angsuran / total tagihan">
            <TextInput
              value={data.st.angsuranNilai}
              placeholder="Rp. 652.000 / Rp. 11.736.000"
              onChange={(e) => st("angsuranNilai", e.target.value)}
            />
          </Field>
          <Field label="Denda">
            <TextInput
              value={data.st.denda}
              placeholder="Rp. 169.285.000"
              onChange={(e) => st("denda", e.target.value)}
            />
          </Field>
          <Field label="Merk / Type">
            <TextInput
              value={data.st.merkType}
              placeholder="HONDA / BeAT"
              onChange={(e) => st("merkType", e.target.value)}
            />
          </Field>
          <Field label="Nomor Polisi">
            <TextInput
              upper
              value={data.st.noPolisi}
              onChange={(e) => st("noPolisi", e.target.value)}
            />
          </Field>
          <Field label="Berlaku Dari">
            <TextInput
              value={data.st.berlakuDari}
              placeholder="29 Agustus 2026"
              onChange={(e) => st("berlakuDari", e.target.value)}
            />
          </Field>
          <Field label="Berlaku Sampai">
            <TextInput
              value={data.st.berlakuSampai}
              placeholder="31 Agustus 2026"
              onChange={(e) => st("berlakuSampai", e.target.value)}
            />
          </Field>
          <Field label="Kota">
            <TextInput
              value={data.st.kota}
              placeholder="Purwokerto"
              onChange={(e) => st("kota", e.target.value)}
            />
          </Field>
          <Field
            label="Tanggal Surat"
            required
            name="st.tanggalSuratISO"
            error={E("st.tanggalSuratISO")}
          >
            <TextInput
              type="date"
              invalid={!!E("st.tanggalSuratISO")}
              value={data.st.tanggalSuratISO}
              onChange={(e) => st("tanggalSuratISO", e.target.value)}
            />
          </Field>
        </Grid>
      </div>
      <button
        type="button"
        onClick={() =>
          set("st", {
            ...data.st,
            merkType: data.merekType || data.st.merkType,
            noPolisi: data.noPolisi || data.st.noPolisi,
            nasabahNama: data.namaDebitur || data.st.nasabahNama,
          })
        }
        className="mt-1.5 w-full rounded bg-slate-100 py-[3px] text-[10.5px] font-medium text-slate-600 transition hover:bg-slate-200"
      >
        ⤵ Salin data kendaraan &amp; debitur dari BAST
      </button>

      {/* ============ TANDA TANGAN ============ */}
      <GroupTitle>Tanda Tangan</GroupTitle>
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

      {/* ============ OPSI & KOP TEKS ============ */}
      <GroupTitle hint="kop teks &amp; opsi dokumen">Opsi &amp; Kop BAST</GroupTitle>
      <div className="space-y-1">
        <TextInput
          value={data.perusahaan}
          placeholder="Nama perusahaan"
          onChange={(e) => set("perusahaan", e.target.value)}
        />
        <TextInput
          upper
          value={data.cabang}
          placeholder="Cabang"
          onChange={(e) => set("cabang", e.target.value)}
        />
        <TextInput
          upper
          value={data.alamat}
          placeholder="Alamat cabang"
          onChange={(e) => set("alamat", e.target.value)}
        />
      </div>
      <div className="pt-1.5">
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
      </div>
      <div className="pt-0.5">
        <Check checked={data.labelMesinBenar} onChange={(v) => set("labelMesinBenar", v)}>
          Perbaiki label kolom jadi “No. Mesin”
        </Check>
      </div>
    </div>
  );
}
