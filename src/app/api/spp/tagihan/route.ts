import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/spp/tagihan?lembaga_id=&bulan=&tahun=&status=
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const lembaga_id = searchParams.get("lembaga_id");
    const bulan      = searchParams.get("bulan");
    const tahun      = searchParams.get("tahun");
    const status     = searchParams.get("status");

    let query = supabase
      .from("tagihan")
      .select(`*, siswa (id, nama, nis, kelas, program), items:tagihan_item (*)`)
      .order("created_at", { ascending: false });

    if (lembaga_id) query = query.eq("lembaga_id", lembaga_id);
    if (bulan)      query = query.eq("bulan", parseInt(bulan));
    if (tahun)      query = query.eq("tahun", parseInt(tahun));
    if (status)     query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
