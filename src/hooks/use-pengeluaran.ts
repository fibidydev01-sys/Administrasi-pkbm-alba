"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pengeluaran, PengeluaranInsert } from "@/types/spp";

export function usePengeluaranList(params?: {
  lembagaId?: string;
  bulan?:     number;
  tahun?:     number;
}) {
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const supabase                              = createClient();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("pengeluaran")
        .select("*")
        .order("tanggal", { ascending: false });

      if (params?.lembagaId) query = query.eq("lembaga_id", params.lembagaId);

      if (params?.bulan && params?.tahun) {
        const y  = params.tahun;
        const m  = String(params.bulan).padStart(2, "0");
        const lastDay = new Date(y, params.bulan, 0).getDate();
        query = query
          .gte("tanggal", `${y}-${m}-01`)
          .lte("tanggal", `${y}-${m}-${lastDay}`);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setPengeluaranList(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat pengeluaran");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  async function createPengeluaran(data: PengeluaranInsert) {
    const res = await fetch("/api/spp/pengeluaran", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan pengeluaran");
    await load();
    return json.data;
  }

  async function deletePengeluaran(id: string) {
    const { error: err } = await supabase.from("pengeluaran").delete().eq("id", id);
    if (err) throw new Error(err.message);
    await load();
  }

  const totalPengeluaran = pengeluaranList.reduce((s, p) => s + p.nominal, 0);

  return {
    pengeluaranList,
    loading,
    error,
    totalPengeluaran,
    createPengeluaran,
    deletePengeluaran,
    refresh: load,
  };
}
