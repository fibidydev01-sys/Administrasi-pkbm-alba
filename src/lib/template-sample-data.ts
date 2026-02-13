/**
 * Template Sample Data Generator
 * Generate realistic dummy data for template preview
 */

import { getTemplateFields } from "./template-parser";

/**
 * Comprehensive sample data pool
 * Used to auto-fill template fields for preview
 */
const SAMPLE_DATA_POOL: Record<string, string> = {
  // Personal Info
  nama: "Ahmad Fauzi",
  nama_peserta: "Muhammad Rizky Aditya",
  nama_ditugaskan: "Dra. Siti Nurhaliza, M.Pd.",
  ttl: "Jakarta, 15 Agustus 2005",
  ttl_peserta: "Bandung, 23 Mei 2006",

  // Identification
  nisn: "0051234567",
  nip_ditugaskan: "198501012010011001",
  nik: "3201012305060001",

  // Education
  program: "Paket C IPA",
  program_paket: "Paket C IPA",
  semester: "6 (Enam)",
  tahun_ajaran: "2025/2026",
  tahun: "2025/2026",
  jabatan_ditugaskan: "Tutor Paket C",

  // Event Details (CRITICAL: tanggal BEDA dari ttl!)
  tanggal: "Senin, 10 Februari 2026",
  hari_tanggal: "Senin, 10 Februari 2026",
  nama_acara: "Rapat Koordinasi Bulanan",
  nama_kegiatan: "Workshop Peningkatan Kompetensi Tutor",
  waktu: "09.00 - 12.00 WIB",
  tempat: "Aula PKBM Al-Hikmah, Jl. Pendidikan No. 123, Jakarta",
  acara: "Workshop Peningkatan Kompetensi Tutor",
  peserta: "50 orang",
  jumlah_peserta: "50 orang",

  // Purpose & Description
  keperluan: "Melengkapi persyaratan pendaftaran universitas",
  uraian_tugas: "Mengikuti Bimbingan Teknis Penyusunan Kurikulum Merdeka untuk PKBM tingkat nasional yang diselenggarakan oleh Direktorat PAUD, Pendidikan Dasar dan Menengah Kemendikbud RI",
  paragraf_pembuka: "Sehubungan dengan akan dilaksanakannya kegiatan Rapat Koordinasi Bulanan dalam rangka evaluasi program pembelajaran semester berjalan dan perencanaan program semester mendatang, kami mengundang Bapak/Ibu untuk hadir pada acara tersebut.",
  perihal_detail: "Izin Penggunaan Gedung untuk Kegiatan Ujian Akhir Semester",

  // Additional Context
  keterangan: "Peserta didik aktif dan memiliki prestasi akademik yang baik",
  catatan: "Diharapkan membawa alat tulis dan laptop",
};

/**
 * Generate sample data for template preview
 * Auto-fills all fields with realistic dummy values
 */
export function generateSampleData(bodyTemplate: string): Record<string, string> {
  const fields = getTemplateFields(bodyTemplate);
  const result: Record<string, string> = {};

  fields.forEach((field) => {
    const fieldName = field.fieldName;

    // Try to get from pool first
    if (SAMPLE_DATA_POOL[fieldName]) {
      result[fieldName] = SAMPLE_DATA_POOL[fieldName];
    } else {
      // Fallback: generate contextual sample based on field name
      result[fieldName] = generateContextualSample(field.label, fieldName);
    }
  });

  return result;
}

/**
 * Generate contextual sample based on field name/label
 * Fallback for fields not in the pool
 */
function generateContextualSample(label: string, fieldName: string): string {
  const lowerLabel = label.toLowerCase();
  const lowerFieldName = fieldName.toLowerCase();

  // Name patterns
  if (lowerLabel.includes("nama") || lowerFieldName.includes("nama")) {
    return "Ahmad Fauzi";
  }

  // Date patterns (CRITICAL: tanggal vs ttl!)
  if (lowerLabel.includes("ttl") || lowerFieldName.includes("ttl") ||
    lowerLabel.includes("lahir") || lowerFieldName.includes("lahir")) {
    return "Jakarta, 15 Agustus 2005"; // TTL format
  }

  if (lowerLabel.includes("tanggal") || lowerFieldName.includes("tanggal") ||
    lowerLabel.includes("hari") || lowerFieldName.includes("hari")) {
    return "Senin, 10 Februari 2026"; // Event date format
  }

  // Time patterns
  if (lowerLabel.includes("waktu") || lowerFieldName.includes("waktu") ||
    lowerLabel.includes("jam") || lowerFieldName.includes("jam")) {
    return "09.00 - 12.00 WIB";
  }

  // Place patterns
  if (lowerLabel.includes("tempat") || lowerFieldName.includes("tempat") ||
    lowerLabel.includes("lokasi") || lowerFieldName.includes("lokasi")) {
    return "Aula PKBM Al-Hikmah";
  }

  // Number patterns
  if (lowerLabel.includes("nomor") || lowerFieldName.includes("nomor") ||
    lowerLabel.includes("nisn") || lowerFieldName.includes("nisn") ||
    lowerLabel.includes("nip") || lowerFieldName.includes("nip")) {
    return "0123456789";
  }

  // Generic fallback
  return `Contoh ${label}`;
}

/**
 * Generate sample perihal based on template
 */
export function generateSamplePerihal(templateName: string): string {
  const perihalMap: Record<string, string> = {
    "Surat Keterangan Aktif": "Surat Keterangan Aktif Peserta Didik",
    "Surat Undangan": "Undangan Rapat Koordinasi Bulanan",
    "Surat Tugas": "Surat Tugas Mengikuti Bimbingan Teknis",
    "Surat Pemberitahuan": "Pemberitahuan Perubahan Jadwal Pembelajaran",
    "Surat Permohonan": "Permohonan Izin Penggunaan Gedung",
  };

  return perihalMap[templateName] || "Surat Resmi";
}