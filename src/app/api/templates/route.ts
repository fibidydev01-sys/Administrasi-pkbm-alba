import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const layout_type = searchParams.get("layout_type");

    let query = supabase
      .from("letter_templates")
      .select("*")
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (layout_type) {
      query = query.eq("layout_type", layout_type);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, layout_type, perihal, isi_surat, sifat } = body;

    if (!name || !layout_type || !isi_surat) {
      return NextResponse.json(
        { error: "Field name, layout_type, dan isi_surat wajib diisi" },
        { status: 400 }
      );
    }

    if (!["keterangan", "undangan", "umum"].includes(layout_type)) {
      return NextResponse.json({ error: "Layout type tidak valid" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("letter_templates")
      .insert({
        name,
        layout_type,
        perihal: perihal || null,
        isi_surat,
        sifat: sifat || "Biasa",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}