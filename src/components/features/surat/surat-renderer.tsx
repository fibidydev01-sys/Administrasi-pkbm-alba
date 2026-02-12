import type { SuratWithRelations } from "@/types";
import { LEMBAGA_VARIANT_MAP } from "@/constants";
import UniversalLayout from "./layouts/universal-layout";
import type { KopVariant } from "./shared/kop-surat";

interface SuratRendererProps {
  surat: SuratWithRelations;
}

export default function SuratRenderer({ surat }: SuratRendererProps) {
  const variant = (LEMBAGA_VARIANT_MAP[surat.lembaga.kode] ?? "yayasan") as KopVariant;

  return <UniversalLayout surat={surat} variant={variant} />;
}