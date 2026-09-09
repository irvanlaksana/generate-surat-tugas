import type { BastData, KopSurat } from "../types";
import { rupiah, tglPanjang } from "../lib/format";

/* ---------------- Kop surat (bisa diupload & diatur) ---------------- */
export function KopBlock({ kop }: { kop: KopSurat }) {
  if (!kop.image) return null;
  const justify =
    kop.align === "left" ? "flex-start" : kop.align === "right" ? "flex-end" : "center";
  return (
    <div style={{ marginBottom: "2mm" }}>
      <div style={{ display: "flex", justifyContent: justify }}>
        <img
          src={kop.image}
          alt="Kop Surat"
          style={{
            width: `${kop.width}mm`,
            height: "auto",
            transform: `translate(${kop.offsetX}mm, ${kop.offsetY}mm)`,
            display: "block",
          }}
        />
      </div>
      {kop.garis && (
        <div
          style={{
            marginTop: `${2 + kop.offsetY}mm`,
            borderTop: "2.2pt solid #000",
            borderBottom: "0.9pt solid #000",
            height: "1.1mm",
          }}
        />
      )}
    </div>
  );
}

function KopPlaceholder({ kop }: { kop: KopSurat }) {
  if (kop.image) return null;
  return (
    <div
      className="no-print"
      style={{
        border: "1px dashed #94a3b8",
        color: "#94a3b8",
        textAlign: "center",
        padding: "6mm 0",
        marginBottom: "3mm",
        fontFamily: "system-ui, sans-serif",
        fontSize: "9pt",
      }}
    >
      Upload kop surat di panel isian → bagian “Perusahaan &amp; Kop Surat”
    </div>
  );
}

/* ---------------- Helper tipografi ---------------- */
function H({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        textAlign: "center",
        fontWeight: "bold",
        margin: "3.5mm 0 2.5mm",
      }}
    >
      {children}
    </p>
  );
}

function P({ children, gap = "2.6mm" }: { children: React.ReactNode; gap?: string }) {
  return (
    <p style={{ textAlign: "justify", margin: `0 0 ${gap}` }}>{children}</p>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ textAlign: "justify", marginBottom: "1.2mm" }}>{children}</li>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        margin: "0 0 2.6mm",
        paddingLeft: "12mm",
        listStyleType: "disc",
      }}
    >
      {children}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex" }}>
      <span style={{ width: "42mm", flexShrink: 0 }}>{label}</span>
      <span>: {value}</span>
    </div>
  );
}

/* ================= HALAMAN 1 ================= */
export function SuratTugasHal1({ data }: { data: BastData }) {
  const s = data.st;
  const mitra = data.mitraNama;
  const kreditur = data.kreditur;

  /** Alamat nasabah + kecamatan (kecamatan hanya ditambah bila belum ada) */
  const kec = data.kecamatan.trim().toUpperCase();
  const alamatNasabah = [
    data.alamatDebitur.trim(),
    kec && !data.alamatDebitur.toUpperCase().includes(kec) ? `Kec. ${kec}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  /** "Rp. 652.000 / Rp. 11.736.000" dari dua isian terpisah */
  const angsuranTotal = [rupiah(s.angsuran), rupiah(s.totalAngsuran)]
    .filter(Boolean)
    .join(" / ");

  const cell: React.CSSProperties = {
    border: "1px solid #d0d0d0",
    padding: "1.6mm 2.5mm",
  };

  return (
    <div className="sheet sheet-tugas">
      <KopBlock kop={data.kop} />
      <KopPlaceholder kop={data.kop} />

      <div style={{ marginTop: `${data.kop.kontenY}mm` }}>

      <p
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "14pt",
          textDecoration: "underline",
          margin: "0 0 1mm",
        }}
      >
        SURAT TUGAS
      </p>
      <p style={{ textAlign: "center", fontWeight: "bold", margin: "0 0 3.5mm" }}>
        Nomor: {s.nomor}
      </p>

      <P>
        Yang bertanda tangan di bawah ini, mewakili Manajemen{" "}
        <b>{mitra}</b>:
      </P>

      <table
        style={{
          borderCollapse: "collapse",
          width: "96%",
          margin: "0 auto 3mm",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...cell, width: "32%", fontWeight: "bold" }}>Nama</td>
            <td style={cell}>
              <b>: {s.pemberiNama}</b>
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, fontWeight: "bold" }}>Jabatan</td>
            <td style={cell}>
              <b>: {s.pemberiJabatan}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <P>
        Dengan ini memberikan tugas penuh, wewenang, dan tanggung jawab penagihan
        di lapangan kepada :
      </P>

      <table
        style={{
          borderCollapse: "collapse",
          width: "78%",
          margin: "0 0 3mm 4%",
          tableLayout: "fixed",
        }}
      >
        <tbody>
          <tr>
            <td style={{ ...cell, width: "40%", fontWeight: "bold" }}>Nama</td>
            <td style={{ ...cell, width: "31%", fontWeight: "bold" }}>NIK</td>
            <td style={{ ...cell, fontWeight: "bold" }}>Jabatan</td>
          </tr>
          <tr>
            <td style={cell}>{s.petugasNama}</td>
            <td style={cell}>{s.petugasNik}</td>
            <td style={cell}>{s.petugasJabatan}</td>
          </tr>
        </tbody>
      </table>

      <P>
        Untuk melakukan konfirmasi, penagihan, dan negosiasi penyelesaian
        kewajiban pembayaran atas nama Debitur/Nasabah dari <b>{kreditur}</b>{" "}
        yang penagihannya dikuasakan kepada <b>{mitra}</b>.
      </P>

      <div style={{ marginBottom: "3mm" }}>
        <div>Berikut data nasabah :</div>
        <Row label="No. Kontrak" value={data.noPerjanjian} />
        <Row label="Nama" value={data.namaDebitur} />
        <Row label="Alamat" value={alamatNasabah} />
        <Row label="Tanggal Jatuh Tempo" value={s.jatuhTempo} />
        {!!s.noAngsuran.trim() && (
          <Row label="No. Angsuran" value={s.noAngsuran} />
        )}
        <Row label="Angsuran / Total" value={angsuranTotal} />
        <Row label="DENDA" value={rupiah(s.denda)} />
      </div>

      <div style={{ marginBottom: "5mm" }}>
        <div>Adapun spessifikasi kendaraan sebagai berikut :</div>
        <Row label="Merk/Type" value={data.merekType} />
        <Row label="Nomor Polisi" value={data.noPolisi} />
      </div>

      <P>
        Pelaksanaan Surat Tugas ini wajib tunduk dan patuh pada ketentuan sebagai
        berikut:
      </P>

      <H>MASA BERLAKU SURAT TUGAS</H>

      <P>
        Surat Tugas ini berlaku efektif terhitung sejak tanggal{" "}
        <b>{s.berlakuDari}</b> sampai dengan tanggal <b>{s.berlakuSampai}</b>.
        Apabila masa berlaku telah berakhir, Surat Tugas ini dinyatakan tidak
        berlaku lagi dan wajib diperpanjang melalui persetujuan Manajemen{" "}
        <b>{mitra}.</b>
      </P>

      <H>WEWENANG DAN TANGGUNG JAWAB PETUGAS</H>

      <P gap="1.5mm">
        Dalam menjalankan tugas penagihan di lapangan, Tim Penagihan berwenang:
      </P>

      <List>
        <Bullet>
          Mendatangi alamat domisili, kantor, atau lokasi tempat usaha Debitur
          sesuai data resmi yang tercantum dalam lembar kerja penagihan.
        </Bullet>
        <Bullet>
          Melakukan konfirmasi, negosiasi, dan menyampaikan Surat Peringatan (SP)
          atau tagihan resmi yang diterbitkan oleh Perusahaan/Kreditur/Mitra
          Perusahaan.
        </Bullet>
      </List>
      </div>
    </div>
  );
}

/* ================= HALAMAN 2 ================= */
export function SuratTugasHal2({ data }: { data: BastData }) {
  const s = data.st;
  const mitra = data.mitraNama;

  return (
    <div className="sheet sheet-tugas">
      {data.kop.semuaHalaman && <KopBlock kop={data.kop} />}

      <div style={{ marginTop: `${data.kop.kontenY2}mm` }}>

      <List>
        <Bullet>
          Untuk keperluan diatas, PENERIMA TUGAS berhak untuk menerima jaminan
          piutang/jaminan fidusia, menandatangani dokumen - dokumen, meminta
          tanda tangan, serta melakukan tindakan yang dianggap perlu dalam
          melaksanakan tugas tersebut/meminta bantuan pihak berwajib jika
          diperlukan.
        </Bullet>
      </List>

      <H>LARANGAN DAN KEPATUHAN</H>

      <List>
        <Bullet>
          <b>Dilarang menerima pembayaran tunai (cash) secara langsung</b> dari
          Debitur dalam bentuk apa pun, kecuali menggunakan Virtual Account resmi
          atau tanda terima sah dari sistem perusahaan.
        </Bullet>
        <Bullet>
          <b>
            Dilarang menggunakan ancaman, kekerasan fisik, intimidasi, penekanan
            secara psikologis, atau tindakan melawan hukum
          </b>{" "}
          yang melanggar Kode Etik Penagihan Bank Indonesia (BI), Otoritas Jasa
          Keuangan (OJK), serta Peraturan Perundang-undangan Republik Indonesia.
        </Bullet>
        <Bullet>
          Petugas wajib bersikap sopan, profesional, mengenakan pakaian rapi dan
          sopan selama berada di lapangan.
        </Bullet>
        <Bullet>
          Petugas wajib melaporkan hasil penagihan (Field Report) secara
          real-time melalui sistem aplikasi penagihan resmi{" "}
          <b>{mitra}</b> pada hari yang sama.
        </Bullet>
      </List>

      <H>SANKSI DAN TANGGUNG JAWAB HUKUM</H>

      <List>
        <Bullet>
          Setiap pelanggaran terhadap kode etik, penyalahgunaan wewenang,
          penggelapan dana penagihan, atau tindakan penyimpangan yang dilakukan
          oleh Petugas Penagihan akan dikenakan sanksi tegas berupa Pemutusan
          Hubungan Kerja (PHK) secara tidak hormat.
        </Bullet>
        <Bullet>
          Tindakan pelanggaran hukum yang dilakukan oleh Petugas di luar prosedur
          resmi Perusahaan menjadi tanggung jawab pribadi petugas bersangkutan
          secara pidana maupun perdata ({mitra} membebaskan diri dari
          segala tuntutan hukum akibat penyimpangan oknum).
        </Bullet>
      </List>

      <P>
        Demikian Surat Tugas ini diterbitkan untuk dipergunakan sebagaimana
        mestinya dan dilaksanakan dengan penuh rasa tanggung jawab demi menjaga
        integritas, profesionalisme, dan nama baik <b>{mitra}</b> serta
        Kreditur.
      </P>

      <div style={{ height: "10mm" }} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "52%" }}>
              {s.kota}, {tglPanjang(data.tanggalISO) || data.tanggalISO}
            </td>
            <td />
          </tr>
          <tr>
            <td>Pemberi Tugas,</td>
            <td>Penerima Tugas,</td>
          </tr>
          <tr>
            <td>{mitra}</td>
            <td>PETUGAS PENAGIHAN</td>
          </tr>
          <tr style={{ height: "26mm" }}>
            <td colSpan={2} />
          </tr>
          <tr>
            <td>{s.pemberiNama}</td>
            <td>{s.petugasNama}</td>
          </tr>
          <tr>
            <td>{s.pemberiJabatan}</td>
            <td />
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}
