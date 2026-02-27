/**
 * SPP Types
 * Sistem Pembayaran SPP - Administrasi PKBM
 */

// ============================================
// RAW DATABASE TYPES
// ============================================

export interface Siswa {
  id: string;
  lembaga_id: string;
  nis: string;
  nama: string;
  kelas: string | null;
  program: string | null;
  nama_wali: string | null;
  nomor_wa: string | null;
  tanggal_masuk: string | null;
  tanggal_keluar: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface JenisTagihan {
  id: string;
  lembaga_id: string;
  nama: string;
  nominal: number;
  tipe: JenisTagihanTipe;
  is_active: boolean;
  urutan: number;
  created_at: string;
}

export interface Tagihan {
  id: string;
  lembaga_id: string;
  siswa_id: string;
  nomor_tagihan: string;
  bulan: number;
  tahun: number;
  total_tagihan: number;
  total_dibayar: number;
  status: TagihanStatus;
  tanggal_jatuh_tempo: string | null;
  tanggal_lunas: string | null;
  catatan: string | null;
  pdf_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TagihanItem {
  id: string;
  tagihan_id: string;
  jenis_tagihan_id: string | null;
  keterangan: string;
  nominal: number;
  bulan_ref: number | null;
  tahun_ref: number | null;
}

export interface Pembayaran {
  id: string;
  tagihan_id: string;
  nomor_bukti: string;
  jumlah: number;
  metode: MetodePembayaran;
  tanggal_bayar: string;
  catatan: string | null;
  pdf_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Pengeluaran {
  id: string;
  lembaga_id: string;
  nomor_ref: string | null;
  kategori: string;
  keterangan: string;
  nominal: number;
  tanggal: string;
  bukti_url: string | null;
  created_by: string | null;
  created_at: string;
}

// ============================================
// ENUMS / LITERAL TYPES
// ============================================

export type TagihanStatus = "unpaid" | "partial" | "paid" | "void";
export type JenisTagihanTipe = "bulanan" | "insidental";
export type MetodePembayaran = "tunai" | "transfer" | "qris";

// ============================================
// RELATIONS / EXTENDED TYPES
// ============================================

export interface SiswaWithLembaga extends Siswa {
  lembaga: {
    id: string;
    nama: string;
    kode: string;
  };
}

export interface TagihanWithRelations extends Tagihan {
  siswa: Siswa;
  items: TagihanItem[];
  pembayaran: Pembayaran[];
  sisa_tagihan: number;
}

export interface PembayaranWithTagihan extends Pembayaran {
  tagihan: Tagihan & {
    siswa: Pick<Siswa, "id" | "nama" | "nis">;
  };
}

// ============================================
// INSERT / UPDATE DTOs
// ============================================

export interface SiswaInsert {
  lembaga_id: string;
  nis: string;
  nama: string;
  kelas?: string;
  program?: string;
  nama_wali?: string;
  nomor_wa?: string;
  tanggal_masuk?: string;
  is_active?: boolean;
}

export interface SiswaUpdate extends Partial<SiswaInsert> {
  tanggal_keluar?: string;
}

export interface JenisTagihanInsert {
  lembaga_id: string;
  nama: string;
  nominal: number;
  tipe?: JenisTagihanTipe;
  urutan?: number;
}

export interface JenisTagihanUpdate extends Partial<JenisTagihanInsert> { }

export interface TagihanInsert {
  lembaga_id: string;
  siswa_id: string;
  nomor_tagihan: string;
  bulan: number;
  tahun: number;
  total_tagihan: number;
  tanggal_jatuh_tempo?: string;
  catatan?: string;
  created_by?: string;
}

export interface TagihanItemInsert {
  tagihan_id: string;
  jenis_tagihan_id?: string;
  keterangan: string;
  nominal: number;
  bulan_ref?: number;
  tahun_ref?: number;
}

export interface PembayaranInsert {
  tagihan_id: string;
  nomor_bukti: string;
  jumlah: number;
  metode?: MetodePembayaran;
  tanggal_bayar?: string;
  catatan?: string;
  created_by?: string;
}

export interface PengeluaranInsert {
  lembaga_id: string;
  nomor_ref?: string;
  kategori: string;
  keterangan: string;
  nominal: number;
  tanggal: string;
  created_by?: string;
}

// ============================================
// GENERATE TAGIHAN TYPES
// ============================================

export interface GenerateTagihanPayload {
  lembaga_id: string;
  bulan: number;
  tahun: number;
  tanggal_jatuh_tempo?: string;
}

export interface GenerateTagihanPreviewItem {
  siswa: Siswa;
  items: TagihanItemInsert[];
  total_tagihan: number;
  has_tunggakan: boolean;
  sudah_ada: boolean;
}

// ============================================
// LAPORAN TYPES
// ============================================

export interface LaporanBulananData {
  lembaga_id: string;
  bulan: number;
  tahun: number;
  total_tagihan: number;
  total_terkumpul: number;
  total_tunggakan: number;
  total_pengeluaran: number;
  saldo: number;
  detail_pemasukan: TagihanWithRelations[];
  detail_pengeluaran: Pengeluaran[];
}

export interface RingkasanSPP {
  total_siswa_aktif: number;
  tagihan_bulan_ini: number;
  sudah_lunas: number;
  belum_lunas: number;
  sebagian_bayar: number;
  total_terkumpul: number;
  total_tunggakan: number;
}