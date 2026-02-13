"use client";

import { useState } from "react";
import { BlobProvider, pdf } from "@react-pdf/renderer";
import { Eye, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { LetterTemplate, Lembaga } from "@/types";
import { useLembagaList } from "@/hooks/use-lembaga";
import { generateSampleData } from "@/lib/template-sample-data";
import { createMockSurat } from "@/lib/mock-surat-generator";
import PDFSuratDocument from "@/components/features/surat/pdf/pdf-surat-document";
import { Spinner } from "@/components/ui/spinner";

interface TemplatePreviewModalProps {
  template: LetterTemplate;
}

export default function TemplatePreviewModal({ template }: TemplatePreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const { lembagas, loading: lembagaLoading } = useLembagaList();

  // Get selected lembaga
  const selectedLembaga = lembagas.find((l) => l.id === selectedLembagaId);

  // Generate sample data and mock surat
  const sampleData = generateSampleData(template.isi_surat);
  const mockSurat = selectedLembaga
    ? createMockSurat(template, selectedLembaga, sampleData)
    : null;

  const filename = `Preview-${template.name.replace(/\s+/g, "-")}.pdf`;

  async function handleDownload() {
    if (!mockSurat) return;

    setDownloading(true);
    try {
      const blob = await pdf(<PDFSuratDocument surat={mockSurat} />).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Preview PDF
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[85vw] sm:max-w-5xl flex flex-col p-0"
      >
        <SheetHeader className="flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base">Preview: {template.name}</SheetTitle>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={downloading || !selectedLembaga}
            className="mr-8"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </SheetHeader>

        {/* Lembaga Selector */}
        <div className="border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <Label htmlFor="lembaga-select" className="text-sm font-medium min-w-[100px]">
              Pilih Lembaga:
            </Label>
            {lembagaLoading ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Memuat lembaga...</span>
              </div>
            ) : (
              <Select
                value={selectedLembagaId}
                onValueChange={setSelectedLembagaId}
              >
                <SelectTrigger id="lembaga-select" className="w-[300px]">
                  <SelectValue placeholder="Pilih lembaga untuk preview" />
                </SelectTrigger>
                <SelectContent>
                  {lembagas.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      [{l.kode}] {l.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Kop surat dan TTD akan menggunakan data dari lembaga yang dipilih
          </p>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 min-h-0 p-2">
          {!selectedLembaga ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Pilih Lembaga Terlebih Dahulu</p>
              <p className="text-sm text-muted-foreground max-w-md">
                Pilih lembaga di atas untuk melihat preview PDF lengkap dengan kop surat dan
                tanda tangan sesuai data lembaga
              </p>
            </div>
          ) : open && mockSurat ? (
            <BlobProvider document={<PDFSuratDocument surat={mockSurat} />}>
              {({ url, loading, error }) => {
                if (loading) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-3 text-muted-foreground">Generating PDF...</span>
                    </div>
                  );
                }

                if (error) {
                  return (
                    <div className="flex items-center justify-center h-full text-destructive">
                      Gagal generate PDF: {error.message}
                    </div>
                  );
                }

                return (
                  <iframe
                    src={url!}
                    className="w-full h-full rounded border"
                    title="PDF Preview"
                  />
                );
              }}
            </BlobProvider>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}