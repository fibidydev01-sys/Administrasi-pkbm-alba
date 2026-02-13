/**
 * Mock Surat Generator
 * Generate mock SuratWithRelations for template preview
 */

import type { SuratWithRelations, Lembaga, LetterTemplate, SnapshotTTD } from "@/types";
import { composeBody } from "./template-parser";
import { generateSamplePerihal } from "./template-sample-data";
import { formatNomorSurat } from "./date";

/**
 * Create mock SuratWithRelations for template preview
 */
export function createMockSurat(
  template: LetterTemplate,
  lembaga: Lembaga,
  sampleData: Record<string, string>
): SuratWithRelations {
  const today = new Date();
  const nomorSurat = formatNomorSurat(123, lembaga.nomor_prefix, today);
  const perihal = template.perihal || generateSamplePerihal(template.name);

  // Compose body from template with sample data
  const isiSurat = composeBody(template.isi_surat, sampleData);

  // Create snapshot TTD from lembaga
  const snapshotTTD: SnapshotTTD = {
    jabatan: lembaga.ttd_jabatan,
    nama: lembaga.ttd_nama,
    nip: lembaga.ttd_nip,
    image_url: lembaga.ttd_image_url,
    captured_at: today.toISOString(),
  };

  const mockSurat: SuratWithRelations = {
    id: "preview-mock-id",
    lembaga_id: lembaga.id,
    nomor_surat: nomorSurat,
    tanggal_surat: today.toISOString().split("T")[0],
    perihal: perihal,
    kepada: "Yth. Bapak/Ibu Penerima Surat",
    alamat_tujuan: "Jakarta",
    isi_surat: isiSurat,
    lampiran: "-",
    sifat: template.sifat,
    snapshot_ttd: snapshotTTD as unknown as never,
    pdf_url: null,
    pdf_generated_at: null,
    status: "final",
    template_id: template.id,
    layout_type: template.layout_type, // 🔥 CRITICAL FIX: Include layout_type!
    created_by: null,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
    approved_by: null,
    approved_at: null,
    deleted_at: null,
    deleted_by: null,
    lembaga: lembaga,
    tembusan: [
      {
        id: "tembusan-1",
        surat_id: "preview-mock-id",
        nama_penerima: "Kepala Dinas Pendidikan Kota",
        urutan: 1,
        created_at: today.toISOString(),
      },
      {
        id: "tembusan-2",
        surat_id: "preview-mock-id",
        nama_penerima: "Arsip",
        urutan: 2,
        created_at: today.toISOString(),
      },
    ],
  };

  return mockSurat;
}