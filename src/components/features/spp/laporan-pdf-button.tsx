"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfLaporanBulananDocument } from "./pdf/pdf-laporan-document";
import type { TagihanWithRelations, Pengeluaran } from "@/types/spp";

interface LaporanPdfButtonProps {
  lembagaNama: string;
  lembagaAlamat: string;
  bulan: number;
  tahun: number;
  tagihanList: TagihanWithRelations[];
  pengeluaranList: Pengeluaran[];
  ttdNama: string;
  ttdJabatan: string;
  fileName: string;
}

export function LaporanPdfButton({
  lembagaNama, lembagaAlamat, bulan, tahun,
  tagihanList, pengeluaranList,
  ttdNama, ttdJabatan, fileName,
}: LaporanPdfButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PdfLaporanBulananDocument
          lembagaNama={lembagaNama}
          lembagaAlamat={lembagaAlamat}
          bulan={bulan}
          tahun={tahun}
          tagihanList={tagihanList}
          pengeluaranList={pengeluaranList}
          ttdNama={ttdNama}
          ttdJabatan={ttdJabatan}
        />
      }
      fileName={fileName}
    >
      {({ loading: pdfLoading }) => (
        <Button disabled={pdfLoading}>
          <Download className="h-4 w-4 mr-2" />
          {pdfLoading ? "Generating..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}