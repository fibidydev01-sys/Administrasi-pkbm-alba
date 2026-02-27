import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer";
import type { TagihanWithRelations, Pembayaran } from "@/types/spp";
import { formatRupiah, getBulanLabel, METODE_PEMBAYARAN_OPTIONS } from "@/constants/spp-config";

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  lembagaNama: { fontSize: 13, fontWeight: "bold" },
  lembagaAlamat: { fontSize: 9, marginTop: 2 },
  judulKwitansi: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  nomorBukti: { textAlign: "center", fontSize: 10, marginBottom: 20, color: "#555" },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: "35%", color: "#444" },
  colon: { width: "5%" },
  value: { flex: 1, fontWeight: "bold" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 10 },
  rincianHeader: { fontWeight: "bold", marginBottom: 4, fontSize: 10 },
  rincianRow: { flexDirection: "row", justifyContent: "space-between", fontSize: 10, marginBottom: 3 },
  rincianNominal: { fontFamily: "Times-Roman" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#000",
    fontWeight: "bold",
  },
  footer: { marginTop: 40, flexDirection: "row", justifyContent: "space-between" },
  ttdBox: { width: "40%", alignItems: "center" },
  ttdLabel: { fontSize: 10 },
  ttdSpace: { height: 50 },
  ttdNama: { fontWeight: "bold", fontSize: 10, borderTopWidth: 1, borderTopColor: "#000", paddingTop: 4 },
  terbilang: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    marginTop: 10,
    fontSize: 10,
    fontStyle: "italic",
  },
});

interface PdfKwitansiDocumentProps {
  tagihan: TagihanWithRelations;
  pembayaran: Pembayaran;
  lembagaNama: string;
  lembagaAlamat: string;
  ttdNama: string;
  ttdJabatan: string;
}

function terbilang(n: number): string {
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas",
    "tujuh belas", "delapan belas", "sembilan belas"];
  if (n < 20) return satuan[n];
  if (n < 100) return satuan[Math.floor(n / 10) * 10 - (Math.floor(n / 10) >= 2 ? 0 : 0)]
    .replace("", `${satuan[Math.floor(n / 10)]} puluh${n % 10 > 0 ? " " + satuan[n % 10] : ""}`);
  if (n < 20) return satuan[n];

  // Simple terbilang for common amounts
  const ribuan = Math.floor(n / 1000);
  const sisa = n % 1000;
  let result = "";
  if (ribuan === 1) result = "seribu";
  else if (ribuan > 0) result = `${terbilang(ribuan)} ribu`;
  if (sisa > 0) result += (result ? " " : "") + terbilang(sisa);
  return result || String(n);
}

export function PdfKwitansiDocument({
  tagihan, pembayaran, lembagaNama, lembagaAlamat, ttdNama, ttdJabatan,
}: PdfKwitansiDocumentProps) {
  const metodLabel = METODE_PEMBAYARAN_OPTIONS.find((m) => m.value === pembayaran.metode)?.label ?? pembayaran.metode;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.lembagaNama}>{lembagaNama}</Text>
            <Text style={styles.lembagaAlamat}>{lembagaAlamat}</Text>
          </View>
        </View>

        <Text style={styles.judulKwitansi}>BUKTI PEMBAYARAN</Text>
        <Text style={styles.nomorBukti}>No: {pembayaran.nomor_bukti}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Diterima dari</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{tagihan.siswa?.nama}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>NIS</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{tagihan.siswa?.nis}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Periode</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{getBulanLabel(tagihan.bulan)} {tagihan.tahun}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Metode Bayar</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{metodLabel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tanggal</Text>
          <Text style={styles.colon}>:</Text>
          <Text style={styles.value}>{pembayaran.tanggal_bayar}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.rincianHeader}>Pembayaran untuk:</Text>
        {tagihan.items?.map((item, i) => (
          <View key={i} style={styles.rincianRow}>
            <Text>{item.keterangan}</Text>
            <Text style={styles.rincianNominal}>{formatRupiah(item.nominal)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text>Jumlah Dibayar</Text>
          <Text>{formatRupiah(pembayaran.jumlah)}</Text>
        </View>

        <View style={styles.terbilang}>
          <Text>Terbilang: {terbilang(pembayaran.jumlah)} rupiah</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ttdBox}>
            <Text style={styles.ttdLabel}>Penerima,</Text>
            <View style={styles.ttdSpace} />
            <Text style={styles.ttdNama}>{ttdNama}</Text>
            <Text style={{ fontSize: 9, marginTop: 2 }}>{ttdJabatan}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
