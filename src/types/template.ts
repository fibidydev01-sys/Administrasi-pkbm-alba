/**
 * Letter Template Types
 * Sistem Persuratan - Administrasi PKBM v1.0.0
 * 
 * Template Management System - 3 Layout Fixed (Keterangan, Undangan, Umum)
 * BUKAN JSON builder! BUKAN flexible layout!
 */

import type { SuratSifat } from "./index";

// =============================================
// Layout Type (3 Fixed Layouts - TIDAK BERUBAH!)
// =============================================

export type LayoutType = "keterangan" | "undangan" | "umum";

// =============================================
// Letter Template (from DB)
// =============================================

export interface LetterTemplate {
  id: string;
  name: string;
  layout_type: string; // From DB, will be cast to LayoutType when needed
  perihal: string | null;
  isi_surat: string; // Template with {{table}} and [Isi X] markers
  sifat: string; // From DB, will be cast to SuratSifat when needed
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
}

// =============================================
// Letter Template DTOs
// =============================================

export interface LetterTemplateInsert {
  name: string;
  layout_type: LayoutType;
  perihal?: string;
  isi_surat: string; // Template with {{table}} and [Isi X] markers
  sifat: SuratSifat; // Required with default "Biasa"
  created_by?: string;
}

export interface LetterTemplateUpdate {
  name?: string;
  layout_type?: LayoutType;
  perihal?: string;
  isi_surat?: string;
  sifat?: SuratSifat;
}

// =============================================
// Layout Configuration (Hardcoded - TIDAK BERUBAH!)
// =============================================

export const LAYOUT_CONFIG: Record<
  LayoutType,
  {
    label: string;
    description: string;
    features: {
      judulTengah: boolean;
      pakaiKepada: boolean;
      pakaiTembusan: boolean;
    };
    pembuka: string;
    penutup: string;
  }
> = {
  keterangan: {
    label: "Surat Keterangan",
    description: "Judul tengah, tanpa kepada, untuk menerangkan sesuatu",
    features: {
      judulTengah: true,
      pakaiKepada: false,
      pakaiTembusan: false,
    },
    pembuka: "Yang bertanda tangan di bawah ini:",
    penutup:
      "Surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.",
  },
  undangan: {
    label: "Surat Undangan/Permohonan",
    description: "Ada kepada, formal, untuk mengundang atau memohon",
    features: {
      judulTengah: false,
      pakaiKepada: true,
      pakaiTembusan: true,
    },
    pembuka: "Dengan hormat,",
    penutup:
      "Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
  },
  umum: {
    label: "Surat Umum",
    description: "Standar, isi manual, untuk keperluan umum",
    features: {
      judulTengah: false,
      pakaiKepada: true,
      pakaiTembusan: true,
    },
    pembuka: "Dengan hormat,",
    penutup:
      "Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.",
  },
};