"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfKwitansiDocument } from "./pdf/pdf-kwitansi-document";
import type { Pembayaran, TagihanWithRelations } from "@/types/spp";

interface KwitansiPdfButtonProps {
  pembayaran: Pembayaran;
  tagihan: TagihanWithRelations;
  lembagaNama: string;
  lembagaAlamat: string;
  ttdNama: string;
  ttdJabatan: string;
  fileName: string;
}

export function KwitansiPdfButton({
  pembayaran, tagihan, lembagaNama, lembagaAlamat,
  ttdNama, ttdJabatan, fileName,
}: KwitansiPdfButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PdfKwitansiDocument
          pembayaran={pembayaran}
          tagihan={tagihan}
          lembagaNama={lembagaNama}
          lembagaAlamat={lembagaAlamat}
          ttdNama={ttdNama}
          ttdJabatan={ttdJabatan}
        />
      }
      fileName={fileName}
    >
      {({ loading: pdfLoading }) => (
        <Button variant="ghost" size="sm" disabled={pdfLoading}>
          <Receipt className="h-3.5 w-3.5 mr-1.5" />
          {pdfLoading ? "..." : "Kwitansi"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}