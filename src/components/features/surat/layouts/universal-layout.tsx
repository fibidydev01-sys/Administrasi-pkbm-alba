import type { SuratWithRelations, SnapshotTTD } from "@/types";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType } from "@/types/template";
import KopSurat from "../shared/kop-surat";
import SuratMeta from "../shared/surat-meta";
import SuratBody from "../shared/surat-body";
import SignatureBlock from "../shared/signature-block";
import TembusanList from "../shared/tembusan-list";
import type { KopVariant } from "../shared/kop-surat";

interface UniversalLayoutProps {
  surat: SuratWithRelations;
  variant: KopVariant;
}

export default function UniversalLayout({ surat, variant }: UniversalLayoutProps) {
  // 🔥 FIXED: Get layout_type from surat object (stored at creation time)
  const layoutType = (surat.layout_type as LayoutType) || "umum";
  const layoutConfig = LAYOUT_CONFIG[layoutType];

  return (
    <>
      <KopSurat lembaga={surat.lembaga} variant={variant} />

      {!layoutConfig.features.judulTengah && (
        <SuratMeta
          nomorSurat={surat.nomor_surat}
          perihal={surat.perihal}
          lampiran={surat.lampiran}
          sifat={surat.sifat}
        />
      )}

      {layoutConfig.features.pakaiKepada && surat.kepada && surat.kepada !== "-" && (
        <div className="surat-tujuan mt-5">
          <p>Kepada Yth.</p>
          <p>{surat.kepada}</p>
          {surat.alamat_tujuan && (
            <p>
              di <span style={{ marginLeft: "1em" }}>{surat.alamat_tujuan}</span>
            </p>
          )}
        </div>
      )}

      <SuratBody
        isiSurat={surat.isi_surat}
        layoutType={layoutType}
        nomorSurat={surat.nomor_surat}
      />

      <SignatureBlock
        tanggal={surat.tanggal_surat}
        snapshot={surat.snapshot_ttd as unknown as SnapshotTTD}
        lembaga={surat.lembaga}
      />

      {layoutConfig.features.pakaiTembusan &&
        surat.tembusan &&
        surat.tembusan.length > 0 && (
          <TembusanList tembusan={surat.tembusan} />
        )}
    </>
  );
}