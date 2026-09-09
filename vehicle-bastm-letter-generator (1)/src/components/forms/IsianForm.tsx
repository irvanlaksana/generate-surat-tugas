import type { SuratTugasData } from "../../types";
import { PERLENGKAPAN } from "../../data/perlengkapan";
import { hariTanggal } from "../../lib/format";
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
} from "../../lib/text";
import { SECTIONS, sectionAnchor } from "../../lib/modules";
import type { SectionId } from "../../lib/modules";
import ChecklistEditor from "../ChecklistEditor";
import KopEditor from "../KopEditor";
import LampiranUploads from "../LampiranUploads";
import {
  Check,
  Field,
  Grid,
  GroupTitle,
  RupiahInput,
  Segmented,
  TextArea,
  TextInput,
} from "../ui";
import { PetugasDropdown } from "../ui/PetugasDropdown";
import type { IsianFormProps } from "./formkit";
import { useIssueMaps } from "./formkit";

/* ------------------------------------------------------------------ */
/* Kerangka satu bagian form                                           */
/* ------------------------------------------------------------------ */

function Bagian({
  id,
  label,
  hint,
  children,
}: {
  id: SectionId;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={sectionAnchor(id)} className="scroll-mt-2">
      <GroupTitle hint={hint}>{label}</GroupTitle>
      {children}
    </section>
  );
}

/** Chip navigasi antar bagian — semua isian ada di satu form. */
function SectionNav() {
  const go = (id: SectionId) =>
    document
      .getElementById(sectionAnchor(id))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="thin-scroll -mx-0.5 flex gap-1 overflow-x-auto px-0.5 pb-1">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => go(s.id)}
          className="shrink-0 rounded-full bg-slate-100 px-2 py-[3px] text-[10px] font-medium text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form isian tunggal                                                  */
/* ------------------------------------------------------------------ */

/**
 * Satu-satunya form aplikasi: semua isian Surat Tugas, Surat Penyerahan,
 * BAST, dan Lampiran ada di sini. Data yang dipakai bersama hanya diisi
 * sekali (nama debitur, kendaraan, tanggal, nomor perjanjian, mitra, dst).
 */
export default function IsianForm({
  data,
  set,
  setJenis,
  setChecklist,
  issues,
}: IsianFormProps) {
  const { E, W } = useIssueMaps(issues);
  const isR2 = data.jenis === "roda2";
  const krediturSingkat = initialsOf(data.kreditur);

  const st = <K extends keyof SuratTugasData>(k: K, v: SuratTugasData[K]) =>
    set("st", { ...data.st, [k]: v });

  const filledChecklist = Object.values(data.checklist).filter(
    (e) => e.p1 || e.p2,
  ).length;

  return (
    <div className="space-y-1">
      <SectionNav />

      {/* ============ 1. DEBITUR ============ */}
      <Bagian id="debitur" label="Debitur" hint="dipakai semua dokumen">
        <div className="pb-1.5">
          <Segmented
            value={data.jenis}
            onChange={setJenis}
            options={[
              { value: "roda2", label: "🏍️ Roda 2" },
              { value: "roda4", label: "🚗 Roda 4" },
            ]}
          />
          <p className="mt-1 text-[9.5px] text-slate-400">
            Jenis kendaraan menentukan checklist BAST &amp; label kolom.
          </p>
        </div>
        <Grid cols={2}>
          <Field
            label="Nama Debitur / Nasabah"
            required
            span
            name="namaDebitur"
            error={E("namaDebitur")}
            hint="dicetak di Surat Tugas, BAST, Lampiran & nama file"
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
            hint="alamat & nama file PDF"
          >
            <TextInput
              upper
              invalid={!!E("kecamatan")}
              value={data.kecamatan}
              placeholder="WANGON"
              onChange={(e) => set("kecamatan", e.target.value)}
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
            label="Alamat Debitur"
            span
            name="alamatDebitur"
            warn={W("alamatDebitur")}
            hint={
              data.kecamatan
                ? `Kec. ${data.kecamatan} ditambahkan otomatis di Surat Tugas`
                : "dicetak di Surat Tugas"
            }
          >
            <TextArea
              rows={2}
              value={data.alamatDebitur}
              placeholder="PENGADEGAN RT 001 RW 004, PENGADEGAN"
              onChange={(e) => set("alamatDebitur", e.target.value)}
            />
          </Field>
        </Grid>
      </Bagian>

      {/* ============ 2. PERJANJIAN & TAGIHAN ============ */}
      <Bagian
        id="perjanjian"
        label="Perjanjian &amp; Tagihan"
        hint="kontrak, angsuran, denda"
      >
        <Grid cols={2}>
          <Field
            label="No. Kontrak / Perjanjian"
            required
            span
            name="noPerjanjian"
            error={E("noPerjanjian")}
            hint="satu nomor untuk Surat Tugas, Surat Penyerahan & BAST"
          >
            <TextInput
              invalid={!!E("noPerjanjian")}
              value={data.noPerjanjian}
              placeholder="040424210837"
              onChange={(e) => set("noPerjanjian", e.target.value)}
            />
          </Field>
          <Field
            label="Tgl. Perjanjian"
            name="tglPerjanjian"
            warn={W("tglPerjanjian")}
          >
            <TextInput
              upper
              value={data.tglPerjanjian}
              placeholder="13-FEB-24"
              onChange={(e) => set("tglPerjanjian", e.target.value)}
            />
          </Field>
          <Field label="Jatuh Tempo" name="st.jatuhTempo">
            <TextInput
              upper
              value={data.st.jatuhTempo}
              placeholder="23 MARET 2018"
              onChange={(e) => st("jatuhTempo", e.target.value)}
            />
          </Field>
          <Field
            label="No. Angsuran"
            name="st.noAngsuran"
            warn={W("st.noAngsuran")}
          >
            <TextInput
              value={data.st.noAngsuran}
              placeholder="12"
              inputMode="numeric"
              onChange={(e) => st("noAngsuran", e.target.value.replace(/[^\d]/g, ""))}
            />
          </Field>
          <Field
            label="Angsuran"
            span
            name="st.angsuran"
            hint="nominal satu kali angsuran — ketik angka, format Rp otomatis"
          >
            <RupiahInput
              value={data.st.angsuran}
              onValue={(v) => st("angsuran", v)}
              placeholder="652.000"
            />
          </Field>
          <Field
            label="Total Angsuran"
            span
            name="st.totalAngsuran"
            hint="total tagihan seluruh angsuran"
          >
            <RupiahInput
              value={data.st.totalAngsuran}
              onValue={(v) => st("totalAngsuran", v)}
              placeholder="11.736.000"
            />
          </Field>
          <Field label="Denda" span name="st.denda">
            <RupiahInput
              value={data.st.denda}
              onValue={(v) => st("denda", v)}
              placeholder="169.285.000"
            />
          </Field>
        </Grid>
      </Bagian>

      {/* ============ 3. DATA KENDARAAN ============ */}
      <Bagian id="kendaraan" label="Data Kendaraan" hint="sesuai STNK / BPKB">
        <Grid cols={2}>
          <Field
            label="Merk / Type"
            required
            span
            name="merekType"
            error={E("merekType")}
          >
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
        </Grid>
      </Bagian>

      {/* ============ 4. PETUGAS & PEMBERI TUGAS ============ */}
      <Bagian
        id="petugas"
        label="Petugas &amp; Pemberi Tugas"
        hint="pelaksana lapangan & manajemen mitra"
      >
        <Grid cols={2}>
          <Field
            label="Nama Petugas"
            required
            span
            name="st.petugasNama"
            error={E("st.petugasNama")}
          >
            <PetugasDropdown
              value={data.st.petugasNama}
              onChange={(nama, nik) => {
                // Update together so the NIK update cannot overwrite the selected name.
                set("st", {
                  ...data.st,
                  petugasNama: nama,
                  petugasNik: nik ?? data.st.petugasNik,
                });
              }}
            />
          </Field>
          <Field
            label="NIK Petugas"
            name="st.petugasNik"
            error={E("st.petugasNik")}
          >
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
              placeholder="Petugas Penagihan"
              onChange={(e) => st("petugasJabatan", e.target.value)}
            />
          </Field>
          <Field label="Nama Pemberi Tugas" name="st.pemberiNama">
            <TextInput
              upper
              value={data.st.pemberiNama}
              placeholder="FILEMO HALAWA"
              onChange={(e) => st("pemberiNama", e.target.value)}
            />
          </Field>
          <Field label="Jabatan Pemberi Tugas" name="st.pemberiJabatan">
            <TextInput
              upper
              value={data.st.pemberiJabatan}
              placeholder="DIREKTUR"
              onChange={(e) => st("pemberiJabatan", e.target.value)}
            />
          </Field>
        </Grid>
      </Bagian>

      {/* ============ 5. NOMOR, TANGGAL & MASA BERLAKU ============ */}
      <Bagian
        id="nomor"
        label="Nomor, Tanggal &amp; Masa Berlaku"
        hint="Surat Tugas & BAST"
      >
        <Grid cols={2}>
          <Field
            label="Nomor Surat Tugas"
            required
            span
            name="st.nomor"
            error={E("st.nomor")}
            hint={
              countForDate(data.tanggalISO) > 0
                ? `Sudah ${countForDate(data.tanggalISO)} surat tercatat untuk tanggal ini`
                : "dicetak di Surat Tugas & kaki BAST"
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
                  const n = nextCountForDate(data.tanggalISO);
                  st(
                    "nomor",
                    generateNomorST(
                      {
                        mitraNama: data.mitraNama,
                        kreditur: data.kreditur,
                        tanggalISO: data.tanggalISO,
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
          <Field
            label="Tanggal Dokumen"
            required
            name="tanggalISO"
            error={E("tanggalISO")}
            hint="satu tanggal untuk Surat Tugas & BAST"
          >
            <TextInput
              type="date"
              invalid={!!E("tanggalISO")}
              value={data.tanggalISO}
              onChange={(e) => set("tanggalISO", e.target.value)}
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
          <Field
            label="Hari &amp; Tanggal BAST"
            span
            hint={`Auto: ${hariTanggal(data.tanggalISO) || "-"}`}
          >
            <TextInput
              value={data.hariTanggal}
              placeholder={hariTanggal(data.tanggalISO)}
              onChange={(e) => set("hariTanggal", e.target.value)}
            />
          </Field>
          <Field label="Berlaku Dari" name="st.berlakuDari">
            <TextInput
              value={data.st.berlakuDari}
              placeholder="29 Agustus 2026"
              onChange={(e) => st("berlakuDari", e.target.value)}
            />
          </Field>
          <Field label="Berlaku Sampai" name="st.berlakuSampai">
            <TextInput
              value={data.st.berlakuSampai}
              placeholder="31 Agustus 2026"
              onChange={(e) => st("berlakuSampai", e.target.value)}
            />
          </Field>
          <Field label="Kota Penandatanganan" span name="st.kota">
            <TextInput
              value={data.st.kota}
              placeholder="Purwokerto"
              onChange={(e) => st("kota", e.target.value)}
            />
          </Field>
        </Grid>
      </Bagian>

      {/* ============ 6. KREDITUR & MITRA ============ */}
      <Bagian
        id="kreditur"
        label="Kreditur &amp; Mitra"
        hint={krediturSingkat ? `inisial: ${krediturSingkat}` : undefined}
      >
        <Field
          label="Nama Kreditur"
          name="kreditur"
          hint="dipakai di semua dokumen & nama file"
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
          <Field
            label="Kalimat Kreditur"
            name="catatanKreditur"
            hint="kosongkan = kalimat baku otomatis"
          >
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
            <Field
              label="Nama Mitra"
              required
              span
              name="mitraNama"
              error={E("mitraNama")}
              hint="manajemen pemberi tugas & pelaksana penerimaan unit"
            >
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
      </Bagian>

      {/* ============ 7. PERUSAHAAN & KOP SURAT ============ */}
      <Bagian
        id="perusahaan"
        label="Perusahaan &amp; Kop Surat"
        hint="kop teks BAST & Surat Penyerahan"
      >
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
        <div className="pt-1.5" data-field="kop.image">
          <KopEditor
            kop={data.kop}
            onChange={(k) => set("kop", k)}
            warning={W("kop.image")}
          />
        </div>
      </Bagian>

      {/* ============ 8. CHECKLIST ============ */}
      <Bagian
        id="checklist"
        label="Checklist Perlengkapan"
        hint={`${PERLENGKAPAN[data.jenis].label} · ${filledChecklist} terisi`}
      >
        <ChecklistEditor
          jenis={data.jenis}
          checklist={data.checklist}
          onChange={setChecklist}
        />
      </Bagian>

      {/* ============ 9. OPSI & TANDA TANGAN ============ */}
      <Bagian id="opsi" label="Opsi &amp; Tanda Tangan" hint="kalimat cetak & kolom TTD">
        <Grid cols={2}>
          <Field label="Penyelesaian Kewajiban">
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
        <div className="pt-1">
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
            Tampilkan kalimat kreditur di Surat Penyerahan (poin 5)
          </Check>
          <Check
            checked={data.tampilkanMitraBast}
            onChange={(v) => set("tampilkanMitraBast", v)}
          >
            Tampilkan kalimat mitra pelaksana di BAST
          </Check>
          <Check
            checked={data.mitraSebagaiPenerima}
            onChange={(v) => set("mitraSebagaiPenerima", v)}
          >
            Cetak nama mitra di kolom “Yang Menerima” BAST
          </Check>
          <Check
            checked={data.labelMesinBenar}
            onChange={(v) => set("labelMesinBenar", v)}
          >
            Perbaiki label kolom jadi “No. Mesin”
          </Check>
        </div>

        {(data.tampilkanCatatanBast ||
          data.tampilkanCatatanPenyerahan ||
          (data.tampilkanMitraBast && data.mitraNama)) && (
          <div className="mt-1 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
            <span className="mb-[1px] block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Pratinjau kalimat
            </span>
            {(data.tampilkanCatatanBast || data.tampilkanCatatanPenyerahan) && (
              <p className="mb-0.5">“{catatanKreditur(data)}”</p>
            )}
            {data.tampilkanMitraBast && data.mitraNama && (
              <p>“{mitraLine(data)}”</p>
            )}
          </div>
        )}

        <Grid cols={2}>
          <Field label="TTD — Yang Bertandatangan">
            <TextInput
              upper
              value={data.ttdBertandatangan}
              placeholder="Nama konsumen"
              onChange={(e) => set("ttdBertandatangan", e.target.value)}
            />
          </Field>
          <Field label="TTD — Yang Menerima 1">
            <TextInput
              upper
              value={data.ttdMenerima1}
              placeholder="FILEMO HALAWA"
              onChange={(e) => set("ttdMenerima1", e.target.value)}
            />
          </Field>
          <Field label="TTD — Yang Menyerahkan">
            <TextInput
              upper
              value={data.ttdMenyerahkan}
              placeholder="FILEMO HALAWA"
              onChange={(e) => set("ttdMenyerahkan", e.target.value)}
            />
          </Field>
          <Field label="TTD — Yang Menerima 2">
            <TextInput
              upper
              value={data.ttdMenerima2}
              placeholder="Petugas gudang"
              onChange={(e) => set("ttdMenerima2", e.target.value)}
            />
          </Field>
        </Grid>
      </Bagian>

      {/* ============ 10. LAMPIRAN ============ */}
      <Bagian id="lampiran" label="Lampiran Foto" hint="KTP di atas, STNK di bawah">
        <LampiranUploads data={data} set={set} warn={W} />
      </Bagian>

      <p className="mt-2 px-1 text-[10px] leading-relaxed text-slate-400">
        Semua isian di atas dipakai bersama oleh <b>Surat Tugas</b>,{" "}
        <b>Surat Penyerahan</b>, <b>BAST</b>, dan <b>Lampiran</b> — tidak ada
        isian ganda. Tersimpan otomatis di browser.
      </p>
    </div>
  );
}
