import type { BastData, SuratTugasData } from "../../types";
import { countForDate, generateNomorST, nextCountForDate } from "../../lib/text";
import type { ValidationIssue } from "../../lib/validation";
import { Field, Grid, GroupTitle, TextArea, TextInput } from "../ui";
import { PetugasDropdown } from "../ui/PetugasDropdown";
import { useIssueMaps } from "./formkit";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  issues: ValidationIssue[];
}

/** Form modul Surat Tugas — hanya field milik Surat Tugas. */
export default function SuratTugasForm({ data, set, issues }: Props) {
  const { E, W } = useIssueMaps(issues);

  const st = <K extends keyof SuratTugasData>(k: K, v: SuratTugasData[K]) =>
    set("st", { ...data.st, [k]: v });

  return (
    <div className="space-y-1">
      {/* ============ NOMOR & TANGGAL ============ */}
      <GroupTitle hint="nomor & tanggal terbit">Nomor Surat</GroupTitle>
      <Grid cols={2}>
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
        <Field label="No. Angsuran" name="st.noAngsuran" warn={W("st.noAngsuran")}>
          <TextInput
            value={data.st.noAngsuran}
            placeholder="12"
            inputMode="numeric"
            onChange={(e) => st("noAngsuran", e.target.value.replace(/[^\d]/g, ""))}
          />
        </Field>
      </Grid>

      {/* ============ PEMBERI TUGAS ============ */}
      <GroupTitle hint="manajemen mitra">Pemberi Tugas</GroupTitle>
      <Grid cols={2}>
        <Field label="Nama">
          <TextInput
            upper
            value={data.st.pemberiNama}
            placeholder="FILEMO HALAWA"
            onChange={(e) => st("pemberiNama", e.target.value)}
          />
        </Field>
        <Field label="Jabatan">
          <TextInput
            upper
            value={data.st.pemberiJabatan}
            placeholder="DIREKTUR"
            onChange={(e) => st("pemberiJabatan", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ PETUGAS ============ */}
      <GroupTitle hint="penerima tugas / pelaksana lapangan">Petugas</GroupTitle>
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
            placeholder="Petugas Penagihan"
            onChange={(e) => st("petugasJabatan", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ NASABAH ============ */}
      <GroupTitle hint="data penagihan dari kreditur">Nasabah</GroupTitle>
      <Grid cols={2}>
        <Field label="No. Kontrak" name="st.noKontrak" warn={W("st.noKontrak")}>
          <TextInput
            value={data.st.noKontrak}
            placeholder="02900325"
            onChange={(e) => st("noKontrak", e.target.value)}
          />
        </Field>
        <Field
          label="Nama Nasabah"
          required
          name="st.nasabahNama"
          error={E("st.nasabahNama")}
        >
          <TextInput
            upper
            invalid={!!E("st.nasabahNama")}
            value={data.st.nasabahNama}
            placeholder="ADE IRAWAN"
            onChange={(e) => st("nasabahNama", e.target.value)}
          />
        </Field>
        <Field
          label="Alamat Nasabah"
          span
          hint={data.kecamatan ? `Kec. ${data.kecamatan} ditambahkan otomatis` : undefined}
        >
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
        <Field label="Denda">
          <TextInput
            value={data.st.denda}
            placeholder="Rp. 169.285.000"
            onChange={(e) => st("denda", e.target.value)}
          />
        </Field>
        <Field label="Angsuran / Total" span hint="Nilai angsuran / total tagihan">
          <TextInput
            value={data.st.angsuranNilai}
            placeholder="Rp. 652.000 / Rp. 11.736.000"
            onChange={(e) => st("angsuranNilai", e.target.value)}
          />
        </Field>
      </Grid>
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
        ⤵ Salin data kendaraan &amp; debitur dari Data Umum
      </button>

      {/* ============ KENDARAAN (ST) ============ */}
      <GroupTitle hint="spesifikasi di surat">Kendaraan</GroupTitle>
      <Grid cols={2}>
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
            placeholder="R4806KN"
            onChange={(e) => st("noPolisi", e.target.value)}
          />
        </Field>
      </Grid>

      {/* ============ MASA BERLAKU ============ */}
      <GroupTitle hint="efektif terhitung">Masa Berlaku &amp; Kota</GroupTitle>
      <Grid cols={2}>
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
        <Field label="Kota Penandatanganan">
          <TextInput
            value={data.st.kota}
            placeholder="Purwokerto"
            onChange={(e) => st("kota", e.target.value)}
          />
        </Field>
      </Grid>
    </div>
  );
}
