import { CheckCircle, Clock, AlertCircle, Ban } from "lucide-react";
import type { TagihanStatus, MetodePembayaran, JenisTagihanTipe } from "@/types/spp";

// ============================================
// STATUS TAGIHAN
// ============================================

export const TAGIHAN_STATUS_CONFIG: Record<
  TagihanStatus,
  { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "warning" | "success"; icon: React.ElementType }
> = {
  unpaid:  { label: "Belum Bayar", variant: "destructive", icon: AlertCircle },
  partial: { label: "Sebagian",    variant: "warning",     icon: Clock       },
  paid:    { label: "Lunas",       variant: "success",     icon: CheckCircle },
  void:    { label: "Batal",       variant: "outline",     icon: Ban         },
};

// ============================================
// METODE PEMBAYARAN
// ============================================

export const METODE_PEMBAYARAN_OPTIONS: { value: MetodePembayaran; label: string }[] = [
  { value: "tunai",    label: "Tunai" },
  { value: "transfer", label: "Transfer Bank" },
  { value: "qris",     label: "QRIS" },
];

// ============================================
// JENIS TAGIHAN TIPE
// ============================================

export const JENIS_TAGIHAN_TIPE_OPTIONS: { value: JenisTagihanTipe; label: string }[] = [
  { value: "bulanan",    label: "Bulanan (auto generate)" },
  { value: "insidental", label: "Insidental (manual)" },
];

// ============================================
// KATEGORI PENGELUARAN
// ============================================

export const KATEGORI_PENGELUARAN_OPTIONS = [
  "Gaji/Honor",
  "ATK",
  "Listrik/Air",
  "Transport",
  "Pemeliharaan",
  "Kegiatan Siswa",
  "Kebersihan",
  "Lain-lain",
] as const;

export type KategoriPengeluaran = (typeof KATEGORI_PENGELUARAN_OPTIONS)[number];

// ============================================
// PROGRAM PKBM
// ============================================

export const PROGRAM_OPTIONS = [
  { value: "Paket A", label: "Paket A (setara SD)" },
  { value: "Paket B", label: "Paket B (setara SMP)" },
  { value: "Paket C", label: "Paket C (setara SMA)" },
] as const;

// ============================================
// BULAN
// ============================================

export const BULAN_OPTIONS = [
  { value: 1,  label: "Januari" },
  { value: 2,  label: "Februari" },
  { value: 3,  label: "Maret" },
  { value: 4,  label: "April" },
  { value: 5,  label: "Mei" },
  { value: 6,  label: "Juni" },
  { value: 7,  label: "Juli" },
  { value: 8,  label: "Agustus" },
  { value: 9,  label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
] as const;

export function getBulanLabel(bulan: number): string {
  return BULAN_OPTIONS.find((b) => b.value === bulan)?.label ?? "";
}

// ============================================
// HELPERS
// ============================================

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(nominal);
}

export function getSisaTagihan(total_tagihan: number, total_dibayar: number): number {
  return Math.max(0, total_tagihan - total_dibayar);
}

export function getCurrentBulan(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentTahun(): number {
  return new Date().getFullYear();
}

export function getTahunOptions(range = 3): { value: number; label: string }[] {
  const current = getCurrentTahun();
  return Array.from({ length: range + 1 }, (_, i) => ({
    value: current - i,
    label: String(current - i),
  }));
}
