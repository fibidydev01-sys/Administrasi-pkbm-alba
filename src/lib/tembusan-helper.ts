/**
 * Tembusan Helper Functions
 * Handle tembusan via separate surat_tembusan table
 */

import { createClient } from "@/lib/supabase/client";

export interface TembusanData {
  nama_penerima: string;
  urutan: number;
}

/**
 * Create tembusan records for a surat
 */
export async function createTembusan(
  suratId: string,
  tembusanList: string[]
): Promise<void> {
  if (!tembusanList || tembusanList.length === 0) return;

  const supabase = createClient();

  const records = tembusanList.map((nama, index) => ({
    surat_id: suratId,
    nama_penerima: nama,
    urutan: index + 1,
  }));

  const { error } = await supabase.from("surat_tembusan").insert(records);

  if (error) {
    throw new Error(`Failed to create tembusan: ${error.message}`);
  }
}

/**
 * Update tembusan for a surat
 * Strategy: Delete all existing, then insert new ones
 */
export async function updateTembusan(
  suratId: string,
  tembusanList: string[]
): Promise<void> {
  const supabase = createClient();

  // Delete existing tembusan
  const { error: deleteError } = await supabase
    .from("surat_tembusan")
    .delete()
    .eq("surat_id", suratId);

  if (deleteError) {
    throw new Error(`Failed to delete old tembusan: ${deleteError.message}`);
  }

  // Insert new tembusan if any
  if (tembusanList && tembusanList.length > 0) {
    await createTembusan(suratId, tembusanList);
  }
}

/**
 * Get tembusan for a surat
 */
export async function getTembusan(suratId: string): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("surat_tembusan")
    .select("nama_penerima")
    .eq("surat_id", suratId)
    .order("urutan", { ascending: true });

  if (error) {
    console.error("Failed to fetch tembusan:", error);
    return [];
  }

  return data.map((t) => t.nama_penerima);
}