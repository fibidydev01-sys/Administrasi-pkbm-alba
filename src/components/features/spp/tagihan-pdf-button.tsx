"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfTagihanDocument } from "./pdf/pdf-tagihan-document";
import type { TagihanWithRelations } from "@/types/spp";

interface TagihanPdfButtonProps {
  tagihan: TagihanWithRelations;
  lembagaNama: string;
  lembagaAlamat: string;
  ttdNama: string;
  ttdJabatan: string;
  fileName: string;
}

export function TagihanPdfButton({
  tagihan, lembagaNama, lembagaAlamat,
  ttdNama, ttdJabatan, fileName,
}: TagihanPdfButtonProps) {
  return (
    <PDFDownloadLink
      document={
        <PdfTagihanDocument
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
        <Button variant="outline" disabled={pdfLoading}>
          <FileText className="h-4 w-4 mr-2" />
          {pdfLoading ? "Generating..." : "Download Tagihan"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}