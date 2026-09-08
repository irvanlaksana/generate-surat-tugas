import type { BastData } from "../types";

function FotoGroup({ label, images }: { label: string; images: string[] }) {
  if (!images.length) return null;
  return (
    <section className="attachment-group">
      <h2>{label}</h2>
      <div className="attachment-grid">
        {images.map((image, index) => (
          <figure key={`${label}-${index}`} className="attachment-photo">
            <img src={image} alt={`${label} ${index + 1}`} />
            <figcaption>{label} {index + 1}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export default function LampiranSheet({ data }: { data: BastData }) {
  return (
    <div className="sheet sheet-lampiran">
      <h1>LAMPIRAN DOKUMEN</h1>
      <p className="attachment-debitur">
        Nama Debitur: {data.namaDebitur || "-"}
        {data.kecamatan.trim() ? ` · Kec. ${data.kecamatan.trim()}` : ""}
      </p>
      <FotoGroup label="KTP" images={data.lampiran.ktp} />
      <FotoGroup label="STNK" images={data.lampiran.stnk} />
    </div>
  );
}