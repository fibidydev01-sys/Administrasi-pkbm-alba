import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PembayaranInsert } from "@/types/spp";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as PembayaranInsert;
    const { tagihan_id, jumlah, metode, tanggal_bayar, catatan } = body;

    if (!tagihan_id || !jumlah) {
      return NextResponse.json({ error: "tagihan_id dan jumlah wajib diisi" }, { status: 400 });
    }

    // Ambil data tagihan untuk get lembaga_id & validasi
    const { data: tagihan, error: errTagihan } = await supabase
      .from("tagihan")
      .select("*, lembaga_id")
      .eq("id", tagihan_id)
      .single();
    if (errTagihan || !tagihan) {
      return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
    }
    if (tagihan.status === "paid") {
      return NextResponse.json({ error: "Tagihan sudah lunas" }, { status: 400 });
    }
    if (tagihan.status === "void") {
      return NextResponse.json({ error: "Tagihan sudah dibatalkan" }, { status: 400 });
    }

    const sisa = tagihan.total_tagihan - tagihan.total_dibayar;
    if (jumlah > sisa) {
      return NextResponse.json({
        error: `Jumlah bayar (${jumlah}) melebihi sisa tagihan (${sisa})`
      }, { status: 400 });
    }

    // Generate nomor bukti
    const now = new Date();
    const { data: nomorBukti, error: errNomor } = await supabase
      .rpc("generate_nomor_bukti", {
        p_lembaga_id: tagihan.lembaga_id,
        p_bulan: now.getMonth() + 1,
        p_tahun: now.getFullYear(),
      });
    if (errNomor) throw errNomor;

    const { data: pembayaran, error: errPembayaran } = await supabase
      .from("pembayaran")
      .insert({
        tagihan_id,
        nomor_bukti: nomorBukti,
        jumlah,
        metode: metode ?? "tunai",
        tanggal_bayar: tanggal_bayar ?? now.toISOString().split("T")[0],
        catatan: catatan ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (errPembayaran) throw errPembayaran;

    return NextResponse.json({ data: pembayaran }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
