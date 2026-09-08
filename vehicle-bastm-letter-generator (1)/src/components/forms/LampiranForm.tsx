import type { BastData } from "../../types";
import type { ValidationIssue } from "../../lib/validation";
import { Grid, GroupTitle, UploadBox } from "../ui";
import { DebiturRingkas, useIssueMaps } from "./formkit";

interface Props {
  data: BastData;
  set: <K extends keyof BastData>(key: K, value: BastData[K]) => void;
  issues: ValidationIssue[];
}

/** Form modul Lampiran — unggah foto KTP & STNK. */
export default function LampiranForm({ data, set, issues }: Props) {
  const { W } = useIssueMaps(issues);

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

  return (
    <div className="space-y-1">
      <DebiturRingkas data={data} />

      <GroupTitle hint="KTP di atas, STNK di bawah">Unggah Dokumen</GroupTitle>
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

      <p className="mt-2 rounded-md bg-slate-50 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500 ring-1 ring-slate-200">
        Foto otomatis tersusun 2 kolom per kelompok (KTP lalu STNK) pada satu
        halaman F4. Boleh unggah lebih dari satu foto per kelompok.
      </p>
    </div>
  );
}
