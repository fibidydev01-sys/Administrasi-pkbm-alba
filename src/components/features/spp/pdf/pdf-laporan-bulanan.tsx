import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { TagihanWithRelations, Pengeluaran } from "@/types/spp";
import { formatRupiah, getBulanLabel } from "@/constants/spp-config";

Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman Bold.ttf", fontWeight: "bold" },
  ],
});

const S = StyleSheet.create({
  page:           { fontFamily: "Times-Roman", fontSize: 10, padding: "15mm 20mm 20mm 25mm", color: "#000" },
  header:         { borderBottomWidth: 2, borderBottomColor: "#000", paddingBottom: 8, marginBottom: 14 },
  lembagaNama:    { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  lembagaAlamat:  { fontSize: 8, textAlign: "center", marginTop: 2 },
  judul:          { fontSize: 12, fontWeight: "bold", textAlign: "center", marginBottom: 2 },
  subjudul:       { fontSize: 10, textAlign: "center", marginBottom: 14 },
  sectionTitle:   { fontSize: 11, fontWeight: "bold", marginBottom: 6, marginTop: 14 },
  tabelHeader:    { flexDirection: "row", backgroundColor: "#f0f0f0", padding: "4 6", fontWeight: "bold", fontSize: 9, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  tabelRow:       { flexDirection: "row", padding: "3 6", borderBottomWidth: 1, borderBottomColor: "#eee", fontSize: 9 },
  tabelRowShaded: { flexDirection: "row", padding: "3 6", borderBottomWidth: 1, borderBottomColor: "#eee", fontSize: 9, backgroundColor: "#fafafa" },
  colNo:    { width: "6%" },
  colNama:  { flex: 1 },
  colNis:   { width: "15%" },
  colBulan: { width: "18%" },
  colTotal: { width: "18%", textAlign: "right" },
  colBayar: { width: "18%", textAlign: "right" },
  colSisa:  { width: "18%", textAlign: "right" },
  colStatus:{ width: "12%", textAlign: "center" },
  colTgl:   { width: "16%" },
  colKat:   { width: "22%" },
  colKet:   { flex: 1 },
  colNom:   { width: "20%", textAlign: "right" },
  summaryBox: {
    marginTop: 16, borderWidth: 1, borderColor: "#ccc",
    padding: 10, flexDirection: "row", justifyContent: "space-around",
  },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 8, color: "#666", marginBottom: 3 },
  summaryValue: { fontSize: 11, fontWeight: "bold" },
  summaryValueGreen: { fontSize: 11, fontWeight: "bold", color: "#16a34a" },
  summaryValueRed:   { fontSize: 11, fontWeight: "bold", color: "#dc2626" },
  totalRow: {
    flexDirection: "row", padding: "4 6",
    borderTopWidth: 1.5, borderTopColor: "#000",
    fontWeight: "bold", fontSize: 9,
  },
  saldoBox: {
    marginTop: 12, padding: 8, borderWidth: 1.5,
    borderColor: "#000", flexDirection: "row", justifyContent: "space-between",
  },
  saldoLabel: { fontSize: 11, fontWeight: "bold" },
  saldoValue: { fontSize: 11, fontWeight: "bold" },
  footer: { marginTop: 30, flexDirection: "row", justifyContent: "flex-end" },
  ttdBox: { width: "40%", alignItems: "center" },
  ttdLabel: { fontSize: 9 },
  ttdSpace: { height: 44 },
  ttdNama:  { fontWeight: "bold", fontSize: 9, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 3 },
  pageNum:  { position: "absolute", bottom: 10, right: 20, fontSize: 8, color: "#888" },
});

interface PdfLaporanBulananProps {
  lembagaNama:    string;
  lembagaAlamat:  string;
  bulan:          number;
  tahun:          number;
  tagihanList:    TagihanWithRelations[];
  pengeluaranList: Pengeluaran[];
  ttdNama:        string;
  ttdJabatan:     string;
  kota?:          string;
}

export function PdfLaporanBulanan({
  lembagaNama, lembagaAlamat, bulan, tahun,
  tagihanList, pengeluaranList, ttdNama, ttdJabatan, kota = "Madiun",
}: PdfLaporanBulananProps) {
  const totalTagihan     = tagihanList.reduce((s, t) => s + t.total_tagihan, 0);
  const totalTerkumpul   = tagihanList.reduce((s, t) => s + t.total_dibayar, 0);
  const totalTunggakan   = tagihanList.reduce((s, t) => s + t.sisa_tagihan, 0);
  const totalPengeluaran = pengeluaranList.reduce((s, p) => s + p.nominal, 0);
  const saldo            = totalTerkumpul - totalPengeluaran;
  const periodeLabel     = `${getBulanLabel(bulan)} ${tahun}`;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <Text style={S.lembagaNama}>{lembagaNama}</Text>
          <Text style={S.lembagaAlamat}>{lembagaAlamat}</Text>
        </View>

        <Text style={S.judul}>LAPORAN KEUANGAN SPP</Text>
        <Text style={S.subjudul}>Periode: {periodeLabel}</Text>

        {/* Summary cards */}
        <View style={S.summaryBox}>
          <View style={S.summaryItem}>
            <Text style={S.summaryLabel}>Total Tagihan</Text>
            <Text style={S.summaryValue}>{formatRupiah(totalTagihan)}</Text>
          </View>
          <View style={S.summaryItem}>
            <Text style={S.summaryLabel}>Terkumpul</Text>
            <Text style={S.summaryValueGreen}>{formatRupiah(totalTerkumpul)}</Text>
          </View>
          <View style={S.summaryItem}>
            <Text style={S.summaryLabel}>Tunggakan</Text>
            <Text style={S.summaryValueRed}>{formatRupiah(totalTunggakan)}</Text>
          </View>
          <View style={S.summaryItem}>
            <Text style={S.summaryLabel}>Pengeluaran</Text>
            <Text style={S.summaryValueRed}>{formatRupiah(totalPengeluaran)}</Text>
          </View>
          <View style={S.summaryItem}>
            <Text style={S.summaryLabel}>Saldo Bersih</Text>
            <Text style={saldo >= 0 ? S.summaryValueGreen : S.summaryValueRed}>
              {formatRupiah(saldo)}
            </Text>
          </View>
        </View>

        {/* Tabel Pemasukan (Tagihan) */}
        <Text style={S.sectionTitle}>A. RINCIAN PEMASUKAN (SPP)</Text>
        <View style={S.tabelHeader}>
          <Text style={S.colNo}>No</Text>
          <Text style={S.colNama}>Nama Siswa</Text>
          <Text style={S.colNis}>NIS</Text>
          <Text style={S.colTotal}>Total Tagihan</Text>
          <Text style={S.colBayar}>Terbayar</Text>
          <Text style={S.colSisa}>Sisa</Text>
          <Text style={S.colStatus}>Status</Text>
        </View>
        {tagihanList.map((t, i) => (
          <View key={t.id} style={i % 2 === 0 ? S.tabelRow : S.tabelRowShaded}>
            <Text style={S.colNo}>{i + 1}</Text>
            <Text style={S.colNama}>{t.siswa?.nama ?? "-"}</Text>
            <Text style={S.colNis}>{t.siswa?.nis ?? "-"}</Text>
            <Text style={S.colTotal}>{formatRupiah(t.total_tagihan)}</Text>
            <Text style={S.colBayar}>{formatRupiah(t.total_dibayar)}</Text>
            <Text style={S.colSisa}>{formatRupiah(t.sisa_tagihan)}</Text>
            <Text style={S.colStatus}>
              {t.status === "paid" ? "Lunas" : t.status === "partial" ? "Sebagian" : "Belum"}
            </Text>
          </View>
        ))}
        <View style={S.totalRow}>
          <Text style={{ ...S.colNama, paddingLeft: 6 }}>TOTAL PEMASUKAN</Text>
          <Text style={S.colNis} />
          <Text style={S.colTotal}>{formatRupiah(totalTagihan)}</Text>
          <Text style={S.colBayar}>{formatRupiah(totalTerkumpul)}</Text>
          <Text style={S.colSisa}>{formatRupiah(totalTunggakan)}</Text>
          <Text style={S.colStatus} />
        </View>

        {/* Tabel Pengeluaran */}
        <Text style={S.sectionTitle}>B. RINCIAN PENGELUARAN</Text>
        {pengeluaranList.length === 0 ? (
          <Text style={{ fontSize: 9, color: "#888", padding: 6 }}>Tidak ada pengeluaran pada periode ini.</Text>
        ) : (
          <>
            <View style={S.tabelHeader}>
              <Text style={S.colNo}>No</Text>
              <Text style={S.colTgl}>Tanggal</Text>
              <Text style={S.colKat}>Kategori</Text>
              <Text style={S.colKet}>Keterangan</Text>
              <Text style={S.colNom}>Nominal</Text>
            </View>
            {pengeluaranList.map((p, i) => (
              <View key={p.id} style={i % 2 === 0 ? S.tabelRow : S.tabelRowShaded}>
                <Text style={S.colNo}>{i + 1}</Text>
                <Text style={S.colTgl}>{p.tanggal}</Text>
                <Text style={S.colKat}>{p.kategori}</Text>
                <Text style={S.colKet}>{p.keterangan}</Text>
                <Text style={S.colNom}>{formatRupiah(p.nominal)}</Text>
              </View>
            ))}
            <View style={S.totalRow}>
              <Text style={{ ...S.colKet, paddingLeft: 6 }}>TOTAL PENGELUARAN</Text>
              <Text style={S.colNo} /><Text style={S.colTgl} /><Text style={S.colKat} />
              <Text style={S.colNom}>{formatRupiah(totalPengeluaran)}</Text>
            </View>
          </>
        )}

        {/* Saldo */}
        <View style={S.saldoBox}>
          <Text style={S.saldoLabel}>SALDO BERSIH PERIODE {periodeLabel.toUpperCase()}</Text>
          <Text style={S.saldoValue}>{formatRupiah(saldo)}</Text>
        </View>

        {/* TTD */}
        <View style={S.footer}>
          <View style={S.ttdBox}>
            <Text style={S.ttdLabel}>{kota}, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</Text>
            <Text style={S.ttdLabel}>{ttdJabatan},</Text>
            <View style={S.ttdSpace} />
            <Text style={S.ttdNama}>{ttdNama}</Text>
          </View>
        </View>

        <Text style={S.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}
