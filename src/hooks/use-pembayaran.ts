"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Pembayaran, PembayaranInsert } from "@/types/spp";

export function usePembayaranList(tagihanId?: string) {
  const [pembayaranList, setPembayaranList] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    if (!tagihanId) { setLoading(false); return; }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pembayaran")
        .select("*")
        .eq("tagihan_id", tagihanId)
        .order("tanggal_bayar", { ascending: false });
      if (error) throw error;
      setPembayaranList(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tagihanId]);

  useEffect(() => { load(); }, [load]);

  async function createPembayaran(data: PembayaranInsert) {
    const res = await fetch("/api/spp/pembayaran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan pembayaran");
    await load();
    return json.data;
  }

  return { pembayaranList, loading, createPembayaran, refresh: load };
}
