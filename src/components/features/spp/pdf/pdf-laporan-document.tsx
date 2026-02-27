import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { TagihanWithRelations, Pengeluaran } from "@/types/spp";
import { formatRupiah, getBulanLabel } from "@/constants/spp-config";
import { formatTanggalPendek } from "@/lib/date";

Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman Bold.ttf", fontWeight: "bold" },
  ],
});

const S = StyleSheet.create({
  page:           { fontFamily: "Times-Roman", fontSize: 10, padding: "20mm 20mm 25mm 25mm", color: "#000" },
  header:         { borderBottomWidth: 2, borderBottomColor: "#000", paddingBottom: 8, marginBottom: 14 },
  lembagaNama:    { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  lembagaAlamat:  { fontSize: 9, textAlign: "center", marginTop: 2 },
  judul:          { fontSize: 13, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  subjudul:       { fontSize: 10, textAlign: "center", marginBottom: 16, color: "#444" },
  sectionTitle:   { fontSize: 11, fontWeight: "bold", marginBottom: 6, marginTop: 14 },
  tblHeader:      { flexDirection: "row", backgroundColor: "#e5e7eb", padding: "4 6", fontWeight: "bold", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  tblRow:         { flexDirection: "row", padding: "4 6", borderBottomWidth: 1, borderBottomColor: "#eee" },
  tblRowAlt:      { flexDirection: "row", padding: "4 6", borderBottomWidth: 1, borderBottomColor: "#eee", backgroundColor: "#fafafa" },
  c1:  { width: "5%"  },
  c2:  { flex: 1      },
  c3:  { width: "20%", textAlign: "right" },
  c4:  { width: "20%", textAlign: "right" },
  c5:  { width: "20%", textAlign: "right" },
  cTanggal:  { width: "18%" },
  cKat:      { width: "22%" },
  cKet:      { flex: 1      },
  cNom:      { width: "22%", textAlign: "right" },
  summaryBox:     { marginTop: 16, borderWidth: 1, borderColor: "#ccc", borderRadius: 4 },
  summaryRow:     { flexDirection: "row", justifyContent: "space-between", padding: "5 10", borderBottomWidth: 1, borderBottomColor: "#eee" },
  summaryRowLast: { flexDirection: "row", justifyContent: "space-between", padding: "6 10", backgroundColor: "#f0f0f0" },
  summaryLabel:   { fontWeight: "bold" },
  green:          { color: "#15803d" },
  red:            { color: "#dc2626" },
  blue:           { color: "#1d4ed8" },
  bold:           { fontWeight: "bold" },
  footer:         { marginTop: 30, flexDirection: "row", justifyContent: "space-between" },
  ttdBox:         { width: "40%", alignItems: "center" },
  ttdSpace:       { height: 45 },
  ttdNama:        { fontWeight: "bold", fontSize: 10, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 3 },
  pageNum:        { position: "absolute", bottom: 15, right: 20, fontSize: 9, color: "#888" },
});

interface PdfLaporanBulananProps {
  lembagaNama:   string;
  lembagaAlamat: string;
  bulan:         number;
  tahun:         number;
  tagihanList:   TagihanWithRelations[];
  pengeluaranList: Pengeluaran[];
  ttdNama:       string;
  ttdJabatan:    string;
  kota?:         string;
}

export function PdfLaporanBulananDocument({
  lembagaNama, lembagaAlamat, bulan, tahun,
  tagihanList, pengeluaranList,
  ttdNama, ttdJabatan, kota = "Madiun",
}: PdfLaporanBulananProps) {
  const totalTagihan     = tagihanList.reduce((s, t) => s + t.total_tagihan, 0);
  const totalTerkumpul   = tagihanList.reduce((s, t) => s + t.total_dibayar, 0);
  const totalTunggakan   = tagihanList.reduce((s, t) => s + t.sisa_tagihan, 0);
  const totalPengeluaran = pengeluaranList.reduce((s, p) => s + p.nominal, 0);
  const saldo            = totalTerkumpul - totalPengeluaran;

  const sudahLunas  = tagihanList.filter((t) => t.status === "paid").length;
  const sebagian    = tagihanList.filter((t) => t.status === "partial").length;
  const belumBayar  = tagihanList.filter((t) => t.status === "unpaid").length;

  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Document>
      {/* HALAMAN 1 — RINGKASAN + DETAIL PEMASUKAN */}
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.lembagaNama}>{lembagaNama}</Text>
          <Text style={S.lembagaAlamat}>{lembagaAlamat}</Text>
        </View>

        <Text style={S.judul}>LAPORAN KEUANGAN SPP BULANAN</Text>
        <Text style={S.subjudul}>
          Periode: {getBulanLabel(bulan)} {tahun}
        </Text>

        {/* Ringkasan */}
        <Text style={S.sectionTitle}>A. RINGKASAN</Text>
        <View style={S.summaryBox}>
          <View style={S.summaryRow}>
            <Text>Total Tagihan Bulan Ini</Text>
            <Text style={[S.bold, S.blue]}>{formatRupiah(totalTagihan)}</Text>
          </View>
          <View style={S.summaryRow}>
            <Text>Total Terkumpul</Text>
            <Text style={[S.bold, S.green]}>{formatRupiah(totalTerkumpul)}</Text>
          </View>
          <View style={S.summaryRow}>
            <Text>Total Tunggakan</Text>
            <Text style={[S.bold, S.red]}>{formatRupiah(totalTunggakan)}</Text>
          </View>
          <View style={S.summaryRow}>
            <Text>Total Pengeluaran</Text>
            <Text style={[S.bold, S.red]}>{formatRupiah(totalPengeluaran)}</Text>
          </View>
          <View style={S.summaryRowLast}>
            <Text style={S.bold}>Saldo (Terkumpul - Pengeluaran)</Text>
            <Text style={[S.bold, saldo >= 0 ? S.green : S.red]}>{formatRupiah(saldo)}</Text>
          </View>
        </View>

        {/* Status tagihan */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          {[
            { label: "Lunas",       val: sudahLunas,  color: S.green },
            { label: "Sebagian",    val: sebagian,    color: {} },
            { label: "Belum Bayar", val: belumBayar,  color: S.red },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8, alignItems: "center" }}>
              <Text style={[{ fontSize: 16, fontWeight: "bold" }, item.color]}>{item.val}</Text>
              <Text style={{ fontSize: 9, color: "#666", marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Detail Pemasukan */}
        <Text style={S.sectionTitle}>B. DETAIL PEMASUKAN (SPP)</Text>
        <View style={S.tblHeader}>
          <Text style={S.c1}>No</Text>
          <Text style={S.c2}>Nama Siswa / NIS</Text>
          <Text style={S.c3}>Total Tagihan</Text>
          <Text style={S.c4}>Dibayar</Text>
          <Text style={S.c5}>Sisa</Text>
        </View>
        {tagihanList.map((t, i) => (
          <View key={t.id} style={i % 2 === 0 ? S.tblRow : S.tblRowAlt}>
            <Text style={S.c1}>{i + 1}.</Text>
            <View style={S.c2}>
              <Text>{t.siswa?.nama}</Text>
              <Text style={{ fontSize: 8, color: "#888" }}>{t.siswa?.nis}</Text>
            </View>
            <Text style={S.c3}>{formatRupiah(t.total_tagihan)}</Text>
            <Text style={[S.c4, S.green]}>{formatRupiah(t.total_dibayar)}</Text>
            <Text style={[S.c5, t.sisa_tagihan > 0 ? S.red : {}]}>{formatRupiah(t.sisa_tagihan)}</Text>
          </View>
        ))}
        <View style={{ ...S.tblRow, backgroundColor: "#f0f0f0" }}>
          <Text style={{ ...S.c1 }} />
          <Text style={[S.c2, S.bold]}>TOTAL</Text>
          <Text style={[S.c3, S.bold]}>{formatRupiah(totalTagihan)}</Text>
          <Text style={[S.c4, S.bold, S.green]}>{formatRupiah(totalTerkumpul)}</Text>
          <Text style={[S.c5, S.bold, S.red]}>{formatRupiah(totalTunggakan)}</Text>
        </View>

        <Text style={S.pageNum}>Halaman 1</Text>
      </Page>

      {/* HALAMAN 2 — DETAIL PENGELUARAN + TTD */}
      <Page size="A4" style={S.page}>
        <View style={S.header}>
          <Text style={S.lembagaNama}>{lembagaNama}</Text>
          <Text style={S.lembagaAlamat}>{lembagaAlamat}</Text>
        </View>

        <Text style={S.judul}>LAPORAN KEUANGAN SPP BULANAN</Text>
        <Text style={S.subjudul}>Periode: {getBulanLabel(bulan)} {tahun} — (lanjutan)</Text>

        <Text style={S.sectionTitle}>C. DETAIL PENGELUARAN</Text>

        {pengeluaranList.length === 0 ? (
          <Text style={{ fontSize: 10, color: "#888", marginTop: 8 }}>
            Tidak ada pengeluaran yang dicatat bulan ini.
          </Text>
        ) : (
          <>
            <View style={S.tblHeader}>
              <Text style={S.cTanggal}>Tanggal</Text>
              <Text style={S.cKat}>Kategori</Text>
              <Text style={S.cKet}>Keterangan</Text>
              <Text style={S.cNom}>Nominal</Text>
            </View>
            {pengeluaranList.map((p, i) => (
              <View key={p.id} style={i % 2 === 0 ? S.tblRow : S.tblRowAlt}>
                <Text style={S.cTanggal}>{formatTanggalPendek(p.tanggal)}</Text>
                <Text style={S.cKat}>{p.kategori}</Text>
                <Text style={S.cKet}>{p.keterangan}</Text>
                <Text style={[S.cNom, S.red]}>{formatRupiah(p.nominal)}</Text>
              </View>
            ))}
            <View style={{ ...S.tblRow, backgroundColor: "#f0f0f0" }}>
              <Text style={S.cTanggal} />
              <Text style={S.cKat} />
              <Text style={[S.cKet, S.bold]}>TOTAL PENGELUARAN</Text>
              <Text style={[S.cNom, S.bold, S.red]}>{formatRupiah(totalPengeluaran)}</Text>
            </View>
          </>
        )}

        {/* Saldo Akhir */}
        <View style={{ marginTop: 16 }}>
          <View style={{ ...S.summaryRowLast, borderWidth: 1, borderColor: "#ccc", borderRadius: 4 }}>
            <Text style={S.bold}>SALDO AKHIR (Terkumpul - Pengeluaran)</Text>
            <Text style={[S.bold, { fontSize: 12 }, saldo >= 0 ? S.green : S.red]}>
              {formatRupiah(saldo)}
            </Text>
          </View>
        </View>

        {/* TTD */}
        <View style={S.footer}>
          <View />
          <View style={S.ttdBox}>
            <Text style={{ fontSize: 10 }}>{kota}, {today}</Text>
            <Text style={{ fontSize: 10, marginTop: 2 }}>{ttdJabatan},</Text>
            <View style={S.ttdSpace} />
            <Text style={S.ttdNama}>{ttdNama}</Text>
          </View>
        </View>

        <Text style={S.pageNum}>Halaman 2</Text>
      </Page>
    </Document>
  );
}
