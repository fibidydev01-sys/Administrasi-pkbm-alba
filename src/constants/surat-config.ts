import type { SuratSifat, SuratStatus } from "@/types";
import { FileEdit, CheckCircle } from "lucide-react";

/**
 * Surat sifat options
 */
export const SURAT_SIFAT_OPTIONS: { value: SuratSifat; label: string }[] = [
  { value: "Biasa", label: "Biasa" },
  { value: "Penting", label: "Penting" },
  { value: "Segera", label: "Segera" },
  { value: "Rahasia", label: "Rahasia" },
];

/**
 * Surat status options (2 values only - Part 2 Revised)
 */
export const SURAT_STATUS_OPTIONS: { value: SuratStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "final", label: "Final" },
];

/**
 * Consolidated STATUS_CONFIG (used by StatusBadge)
 */
export const STATUS_CONFIG: Record<
  SuratStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileEdit },
  final: { label: "Final", variant: "default", icon: CheckCircle },
};

/**
 * Status badge colors (backward compatibility for PDF renderer)
 */
export const SURAT_STATUS_COLORS: Record<SuratStatus, string> = {
  draft: "secondary",
  final: "default",
};

/**
 * Lembaga kode to variant mapping for surat layout
 */
export const LEMBAGA_VARIANT_MAP: Record<string, string> = {
  YYS: "yayasan",
  PKBM: "pkbm",
  RA: "ra",
  KB: "kb",
  TK: "tk",
};