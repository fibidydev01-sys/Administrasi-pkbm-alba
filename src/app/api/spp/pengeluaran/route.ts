import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PengeluaranInsert } from "@/types/spp";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as PengeluaranInsert;
    const { lembaga_id, kategori, keterangan, nominal, tanggal } = body;

    if (!lembaga_id || !kategori || !keterangan || !nominal || !tanggal) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("pengeluaran")
      .insert({ ...body, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const lembaga_id = searchParams.get("lembaga_id");
    const bulan      = searchParams.get("bulan");
    const tahun      = searchParams.get("tahun");

    let query = supabase
      .from("pengeluaran")
      .select("*")
      .order("tanggal", { ascending: false });

    if (lembaga_id) query = query.eq("lembaga_id", lembaga_id);
    if (bulan && tahun) {
      const y       = parseInt(tahun);
      const m       = String(parseInt(bulan)).padStart(2, "0");
      const lastDay = new Date(y, parseInt(bulan), 0).getDate();
      query = query
        .gte("tanggal", `${y}-${m}-01`)
        .lte("tanggal", `${y}-${m}-${lastDay}`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
