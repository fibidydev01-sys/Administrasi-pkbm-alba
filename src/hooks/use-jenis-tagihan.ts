"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JenisTagihan, JenisTagihanInsert, JenisTagihanUpdate } from "@/types/spp";

export function useJenisTagihanList(lembagaId?: string, activeOnly = false) {
  const [jenisTagihanList, setJenisTagihanList] = useState<JenisTagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("jenis_tagihan")
        .select("*")
        .order("urutan");

      if (lembagaId) query = query.eq("lembaga_id", lembagaId);
      if (activeOnly) query = query.eq("is_active", true);

      const { data, error: err } = await query;
      if (err) throw err;
      setJenisTagihanList(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat jenis tagihan");
    } finally {
      setLoading(false);
    }
  }, [lembagaId, activeOnly]);

  useEffect(() => { load(); }, [load]);

  async function createJenisTagihan(data: JenisTagihanInsert) {
    const { error: err } = await supabase.from("jenis_tagihan").insert(data);
    if (err) throw new Error(err.message);
    await load();
  }

  async function updateJenisTagihan(id: string, data: JenisTagihanUpdate) {
    const { error: err } = await supabase
      .from("jenis_tagihan")
      .update(data)
      .eq("id", id);
    if (err) throw new Error(err.message);
    await load();
  }

  async function toggleAktif(id: string, is_active: boolean) {
    await updateJenisTagihan(id, { is_active });
  }

  async function deleteJenisTagihan(id: string) {
    const { error: err } = await supabase
      .from("jenis_tagihan")
      .delete()
      .eq("id", id);
    if (err) throw new Error(err.message);
    await load();
  }

  return {
    jenisTagihanList,
    loading,
    error,
    createJenisTagihan,
    updateJenisTagihan,
    toggleAktif,
    deleteJenisTagihan,
    refresh: load,
  };
}
