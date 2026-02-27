export { ROUTES } from "./routes";
export { ROLE_PERMISSIONS, ROLE_LABELS } from "./permissions";
export {
  SURAT_SIFAT_OPTIONS,
  SURAT_STATUS_OPTIONS,
  SURAT_STATUS_COLORS,
  LEMBAGA_VARIANT_MAP,
} from "./surat-config";
export {
  PAPER_SIZE,
  MARGIN,
  SURAT_TYPOGRAPHY,
  KOP_CONFIG,
  SIGNATURE_CONFIG,
  DEFAULT_PAPER_SIZE,
} from "./paper-config";
export type { PaperSize } from "./paper-config";
export {
  TEMPLATE_REGISTRY,
  getTemplate,
  getTemplateOptions,
} from "./template-registry";
export {
  TAGIHAN_STATUS_CONFIG,
  METODE_PEMBAYARAN_OPTIONS,
  JENIS_TAGIHAN_TIPE_OPTIONS,
  KATEGORI_PENGELUARAN_OPTIONS,
  PROGRAM_OPTIONS,
  BULAN_OPTIONS,
  getBulanLabel,
  formatRupiah,
  getSisaTagihan,
  getCurrentBulan,
  getCurrentTahun,
  getTahunOptions,
} from "./spp-config";
export type { KategoriPengeluaran } from "./spp-config";