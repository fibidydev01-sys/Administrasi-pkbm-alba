import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
  GenerateTagihanPayload,
  GenerateTagihanPreviewItem,
  TagihanInsert,
  TagihanItemInsert,
} from "@/types/spp";
import { getBulanLabel } from "@/constants/spp-config";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as GenerateTagihanPayload & { preview: boolean };
    const { lembaga_id, bulan, tahun, tanggal_jatuh_tempo, preview } = body;

    if (!lembaga_id || !bulan || !tahun) {
      return NextResponse.json({ error: "lembaga_id, bulan, tahun wajib diisi" }, { status: 400 });
    }

    // 1. Ambil semua siswa aktif lembaga ini
    const { data: siswaList, error: errSiswa } = await supabase
      .from("siswa")
      .select("*")
      .eq("lembaga_id", lembaga_id)
      .eq("is_active", true)
      .order("nama");
    if (errSiswa) throw errSiswa;

    // 2. Ambil semua jenis tagihan bulanan aktif
    const { data: jenisTagihanList, error: errJenis } = await supabase
      .from("jenis_tagihan")
      .select("*")
      .eq("lembaga_id", lembaga_id)
      .eq("is_active", true)
      .eq("tipe", "bulanan")
      .order("urutan");
    if (errJenis) throw errJenis;

    // 3. Cek tagihan yang sudah ada bulan ini
    const { data: existingTagihan } = await supabase
      .from("tagihan")
      .select("siswa_id")
      .eq("lembaga_id", lembaga_id)
      .eq("bulan", bulan)
      .eq("tahun", tahun);
    const existingSiswaIds = new Set((existingTagihan ?? []).map((t) => t.siswa_id));

    // 4. Ambil tunggakan semua siswa
    const { data: tunggakanList } = await supabase
      .from("tagihan")
      .select("siswa_id, bulan, tahun, total_tagihan, total_dibayar, status")
      .eq("lembaga_id", lembaga_id)
      .in("status", ["unpaid", "partial"])
      .lt("tahun", tahun)
      .order("tahun")
      .order("bulan");

    // Group tunggakan per siswa
    const tunggakanMap = new Map<string, typeof tunggakanList>();
    (tunggakanList ?? []).forEach((t) => {
      if (!tunggakanMap.has(t.siswa_id)) tunggakanMap.set(t.siswa_id, []);
      tunggakanMap.get(t.siswa_id)!.push(t);
    });

    // 5. Build preview items
    const previewItems: GenerateTagihanPreviewItem[] = (siswaList ?? []).map((siswa) => {
      const items: TagihanItemInsert[] = [];

      // Item tagihan bulan ini
      for (const jenis of jenisTagihanList ?? []) {
        items.push({
          tagihan_id: "",
          jenis_tagihan_id: jenis.id,
          keterangan: `${jenis.nama} ${getBulanLabel(bulan)} ${tahun}`,
          nominal: jenis.nominal,
          bulan_ref: bulan,
          tahun_ref: tahun,
        });
      }

      // Item tunggakan
      const tunggakan = tunggakanMap.get(siswa.id) ?? [];
      let has_tunggakan = false;
      for (const t of tunggakan) {
        const sisa = t.total_tagihan - t.total_dibayar;
        if (sisa > 0) {
          has_tunggakan = true;
          items.push({
            tagihan_id: "",
            keterangan: `Tunggakan SPP ${getBulanLabel(t.bulan)} ${t.tahun}`,
            nominal: sisa,
            bulan_ref: t.bulan,
            tahun_ref: t.tahun,
          });
        }
      }

      const total_tagihan = items.reduce((s, i) => s + i.nominal, 0);

      return {
        siswa,
        items,
        total_tagihan,
        has_tunggakan,
        sudah_ada: existingSiswaIds.has(siswa.id),
      };
    });

    if (preview) {
      return NextResponse.json({ data: previewItems });
    }

    // 6. INSERT ke DB (hanya yang belum ada)
    const toInsert = previewItems.filter((p) => !p.sudah_ada);
    if (toInsert.length === 0) {
      return NextResponse.json({ message: "Semua tagihan sudah ada", generated: 0 });
    }

    let generated = 0;
    for (const item of toInsert) {
      // Generate nomor tagihan via RPC
      const { data: nomorTagihan, error: errNomor } = await supabase
        .rpc("generate_nomor_tagihan", { p_lembaga_id: lembaga_id, p_bulan: bulan, p_tahun: tahun });
      if (errNomor) throw errNomor;

      const tagihanInsert: TagihanInsert = {
        lembaga_id,
        siswa_id: item.siswa.id,
        nomor_tagihan: nomorTagihan,
        bulan,
        tahun,
        total_tagihan: item.total_tagihan,
        tanggal_jatuh_tempo: tanggal_jatuh_tempo,
        created_by: user.id,
      };

      const { data: newTagihan, error: errTagihan } = await supabase
        .from("tagihan")
        .insert(tagihanInsert)
        .select()
        .single();
      if (errTagihan) throw errTagihan;

      // Insert items
      const itemsToInsert = item.items.map((i) => ({
        ...i,
        tagihan_id: newTagihan.id,
      }));
      const { error: errItems } = await supabase.from("tagihan_item").insert(itemsToInsert);
      if (errItems) throw errItems;

      generated++;
    }

    return NextResponse.json({ message: `${generated} tagihan berhasil dibuat`, generated });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
