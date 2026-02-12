import { SURAT_TYPOGRAPHY } from "@/constants";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType } from "@/types/template";

interface SuratBodyProps {
  isiSurat: string;
  layoutType?: LayoutType;
  nomorSurat?: string;
}

export default function SuratBody({
  isiSurat,
  layoutType = "umum",
  nomorSurat,
}: SuratBodyProps) {
  const layout = LAYOUT_CONFIG[layoutType];

  return (
    <div className="surat-body" style={{ marginTop: "5mm" }}>
      {/* Judul Tengah (for Surat Keterangan) */}
      {layout.features.judulTengah && (
        <div style={{ textAlign: "center", marginBottom: "3mm" }}>
          <p style={{ fontWeight: "bold", fontSize: "12pt" }}>
            SURAT KETERANGAN
          </p>
          {nomorSurat && (
            <p style={{ fontSize: "12pt" }}>Nomor: {nomorSurat}</p>
          )}
        </div>
      )}

      {/* Pembuka */}
      <p style={{ textIndent: layout.features.judulTengah ? undefined : SURAT_TYPOGRAPHY.paragraphIndent }}>
        {layout.pembuka}
      </p>

      {/* Body Content */}
      <div
        className="surat-content text-justify leading-relaxed"
        style={{ marginTop: "3mm" }}
        dangerouslySetInnerHTML={{ __html: isiSurat }}
      />

      {/* Penutup */}
      <p
        style={{
          textIndent: SURAT_TYPOGRAPHY.paragraphIndent,
          marginTop: "3mm",
        }}
      >
        {layout.penutup}
      </p>
    </div>
  );
}