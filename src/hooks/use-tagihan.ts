"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Tagihan, TagihanWithRelations,
  GenerateTagihanPayload, GenerateTagihanPreviewItem,
} from "@/types/spp";

export function useTagihan(tagihanId?: string) {
  const [tagihan, setTagihan] = useState<TagihanWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    if (!tagihanId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("tagihan")
        .select(`
          *,
          siswa (*),
          items:tagihan_item (*),
          pembayaran (*)
        `)
        .eq("id", tagihanId)
        .single();
      if (err) throw err;
      setTagihan({
        ...data,
        sisa_tagihan: data.total_tagihan - data.total_dibayar,
      } as TagihanWithRelations);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat tagihan");
    } finally {
      setLoading(false);
    }
  }, [tagihanId]);

  useEffect(() => {
    if (tagihanId) load();
    else setLoading(false);
  }, [tagihanId, load]);

  return { tagihan, loading, error, refresh: load };
}

export function useTagihanList(params?: {
  lembagaId?: string;
  siswaId?: string;
  bulan?: number;
  tahun?: number;
  status?: string;
}) {
  const [tagihanList, setTagihanList] = useState<TagihanWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("tagihan")
        .select(`*, siswa (id, nama, nis, kelas, program), items:tagihan_item (*)`)
        .order("created_at", { ascending: false });

      if (params?.lembagaId) query = query.eq("lembaga_id", params.lembagaId);
      if (params?.siswaId)   query = query.eq("siswa_id", params.siswaId);
      if (params?.bulan)     query = query.eq("bulan", params.bulan);
      if (params?.tahun)     query = query.eq("tahun", params.tahun);
      if (params?.status)    query = query.eq("status", params.status);

      const { data, error: err } = await query;
      if (err) throw err;
      setTagihanList(
        (data ?? []).map((t) => ({
          ...t,
          sisa_tagihan: t.total_tagihan - t.total_dibayar,
        })) as TagihanWithRelations[]
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat daftar tagihan");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { tagihanList, loading, error, refresh: load };
}

export function useGenerateTagihanPreview() {
  const [preview, setPreview] = useState<GenerateTagihanPreviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPreview(payload: GenerateTagihanPayload) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/spp/tagihan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, preview: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal memuat preview");
      setPreview(json.data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat preview");
    } finally {
      setLoading(false);
    }
  }

  async function confirmGenerate(payload: GenerateTagihanPayload) {
    const res = await fetch("/api/spp/tagihan/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, preview: false }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal generate tagihan");
    return json;
  }

  return { preview, loading, error, fetchPreview, confirmGenerate };
}
