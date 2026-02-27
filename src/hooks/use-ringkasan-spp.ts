"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RingkasanSPP } from "@/types/spp";

export function useRingkasanSPP(params: {
  lembagaId?: string;
  bulan:      number;
  tahun:      number;
}) {
  const [ringkasan, setRingkasan] = useState<RingkasanSPP | null>(null);
  const [loading, setLoading]     = useState(true);
  const supabase                  = createClient();

  const load = useCallback(async () => {
    try {
      setLoading(true);

      // Total siswa aktif
      let qSiswa = supabase
        .from("siswa")
        .select("id", { count: "exact" })
        .eq("is_active", true);
      if (params.lembagaId) qSiswa = qSiswa.eq("lembaga_id", params.lembagaId);
      const { count: totalSiswa } = await qSiswa;

      // Tagihan bulan ini
      let qTagihan = supabase
        .from("tagihan")
        .select("status, total_tagihan, total_dibayar")
        .eq("bulan", params.bulan)
        .eq("tahun", params.tahun);
      if (params.lembagaId) qTagihan = qTagihan.eq("lembaga_id", params.lembagaId);
      const { data: tagihanData } = await qTagihan;

      const list           = tagihanData ?? [];
      const sudahLunas     = list.filter((t) => t.status === "paid").length;
      const belumLunas     = list.filter((t) => t.status === "unpaid").length;
      const sebagianBayar  = list.filter((t) => t.status === "partial").length;
      const totalTerkumpul = list.reduce((s, t) => s + (t.total_dibayar ?? 0), 0);
      const totalTunggakan = list.reduce((s, t) => s + Math.max(0, t.total_tagihan - t.total_dibayar), 0);

      setRingkasan({
        total_siswa_aktif: totalSiswa ?? 0,
        tagihan_bulan_ini: list.length,
        sudah_lunas:       sudahLunas,
        belum_lunas:       belumLunas,
        sebagian_bayar:    sebagianBayar,
        total_terkumpul:   totalTerkumpul,
        total_tunggakan:   totalTunggakan,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [params.lembagaId, params.bulan, params.tahun]);

  useEffect(() => { load(); }, [load]);

  return { ringkasan, loading, refresh: load };
}
