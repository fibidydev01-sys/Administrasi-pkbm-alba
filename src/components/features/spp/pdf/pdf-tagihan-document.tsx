import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { TagihanWithRelations } from "@/types/spp";
import { formatRupiah, getBulanLabel } from "@/constants/spp-config";
import { formatTanggalSurat } from "@/lib/date";

Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/@canvas-fonts/times-new-roman@1.0.4/Times New Roman Bold.ttf", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    padding: "20mm 20mm 25mm 30mm",
    color: "#000",
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 16,
  },
  lembagaNama: { fontSize: 14, fontWeight: "bold", textAlign: "center" },
  lembagaAlamat: { fontSize: 9, textAlign: "center", marginTop: 2 },
  judul: { fontSize: 13, fontWeight: "bold", textAlign: "center", marginBottom: 4 },
  nomorTagihan: { textAlign: "center", fontSize: 10, color: "#555", marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 5 },
  label: { width: "38%", color: "#444" },
  colon: { width: "4%" },
  value: { flex: 1 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#aaa", marginVertical: 10 },
  tabelHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: "4 8",
    fontWeight: "bold",
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tabelRow: {
    flexDirection: "row",
    padding: "4 8",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontSize: 10,
  },
  colNo:         { width: "8%" },
  colKeterangan: { flex: 1 },
  colNominal:    { width: "30%", textAlign: "right" },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  totalBox: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 10,
  },
  totalGrandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 4,
    marginTop: 4,
    fontWeight: "bold",
  },
  statusBox: {
    marginTop: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    fontSize: 10,
  },
  footer: { marginTop: 30, flexDirection: "row", justifyContent: "flex-end" },
  ttdBox: { width: "45%", alignItems: "center" },
  ttdLabel: { fontSize: 10 },
  ttdSpace: { height: 50 },
  ttdNama: { fontWeight: "bold", fontSize: 10, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 4 },
});

interface PdfTagihanDocumentProps {
  tagihan: TagihanWithRelations;
  lembagaNama: string;
  lembagaAlamat: string;
  ttdNama: string;
  ttdJabatan: string;
  kota?: string;
}

export function PdfTagihanDocument({
  tagihan, lembagaNama, lembagaAlamat, ttdNama, ttdJabatan, kota = "Madiun",
}: PdfTagihanDocumentProps) {
  const sisa = tagihan.total_tagihan - tagihan.total_dibayar;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.lembagaNama}>{lembagaNama}</Text>
          <Text style={styles.lembagaAlamat}>{lembagaAlamat}</Text>
        </View>

        <Text style={styles.judul}>TAGIHAN SPP</Text>
        <Text style={styles.nomorTagihan}>No: {tagihan.nomor_tagihan}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Kepada</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{tagihan.siswa?.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NIS</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{tagihan.siswa?.nis}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Kelas / Program</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>
            {[tagihan.siswa?.kelas, tagihan.siswa?.program].filter(Boolean).join(" - ") || "-"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Periode</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{getBulanLabel(tagihan.bulan)} {tagihan.tahun}</Text>
        </View>
        {tagihan.tanggal_jatuh_tempo && (
          <View style={styles.row}>
            <Text style={styles.label}>Jatuh Tempo</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{tagihan.tanggal_jatuh_tempo}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.tabelHeader}>
          <Text style={styles.colNo}>No.</Text>
          <Text style={styles.colKeterangan}>Keterangan</Text>
          <Text style={styles.colNominal}>Jumlah (Rp)</Text>
        </View>
        {(tagihan.items ?? []).map((item, i) => (
          <View key={i} style={styles.tabelRow}>
            <Text style={styles.colNo}>{i + 1}.</Text>
            <Text style={styles.colKeterangan}>{item.keterangan}</Text>
            <Text style={styles.colNominal}>{formatRupiah(item.nominal)}</Text>
          </View>
        ))}

        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text>Total Tagihan</Text>
              <Text>{formatRupiah(tagihan.total_tagihan)}</Text>
            </View>
            {tagihan.total_dibayar > 0 && (
              <View style={styles.totalRow}>
                <Text>Sudah Dibayar</Text>
                <Text>({formatRupiah(tagihan.total_dibayar)})</Text>
              </View>
            )}
            <View style={styles.totalGrandRow}>
              <Text>Sisa Tagihan</Text>
              <Text>{formatRupiah(sisa)}</Text>
            </View>
          </View>
        </View>

        {tagihan.status === "paid" && (
          <View style={{ ...styles.statusBox, borderColor: "#16a34a" }}>
            <Text style={{ color: "#16a34a", fontWeight: "bold" }}>
              ✓ LUNAS — {tagihan.tanggal_lunas ?? ""}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.ttdBox}>
            <Text style={styles.ttdLabel}>
              {kota}, {formatTanggalSurat(new Date(), kota).split(", ")[1]}
            </Text>
            <Text style={styles.ttdLabel}>{ttdJabatan},</Text>
            <View style={styles.ttdSpace} />
            <Text style={styles.ttdNama}>{ttdNama}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
