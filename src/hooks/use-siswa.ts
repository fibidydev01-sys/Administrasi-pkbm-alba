"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Siswa, SiswaInsert, SiswaUpdate } from "@/types/spp";

export function useSiswa(siswaId?: string) {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    if (!siswaId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("siswa")
        .select("*")
        .eq("id", siswaId)
        .single();
      if (err) throw err;
      setSiswa(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat siswa");
    } finally {
      setLoading(false);
    }
  }, [siswaId]);

  useEffect(() => {
    if (siswaId) load();
    else setLoading(false);
  }, [siswaId, load]);

  async function updateSiswa(data: SiswaUpdate) {
    const { error: err } = await supabase
      .from("siswa")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", siswaId!);
    if (err) throw new Error(err.message);
    await load();
  }

  async function nonaktifkanSiswa() {
    await updateSiswa({
      is_active: false,
      tanggal_keluar: new Date().toISOString().split("T")[0],
    });
  }

  return { siswa, loading, error, updateSiswa, nonaktifkanSiswa, refresh: load };
}

export function useSiswaList(lembagaId?: string, activeOnly = true) {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("siswa")
        .select("*")
        .order("nama");

      if (lembagaId) query = query.eq("lembaga_id", lembagaId);
      if (activeOnly) query = query.eq("is_active", true);

      const { data, error: err } = await query;
      if (err) throw err;
      setSiswaList(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat daftar siswa");
    } finally {
      setLoading(false);
    }
  }, [lembagaId, activeOnly]);

  useEffect(() => { load(); }, [load]);

  async function createSiswa(data: SiswaInsert) {
    const { error: err } = await supabase.from("siswa").insert(data);
    if (err) throw new Error(err.message);
    await load();
  }

  return { siswaList, loading, error, createSiswa, refresh: load };
}
