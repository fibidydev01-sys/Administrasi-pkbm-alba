"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

import { useTemplate } from "@/hooks/use-template";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType } from "@/types/template";
import { TemplatePreviewModal } from "@/components/features/templates";
import { PageHeader, DeleteConfirmDialog, FullPageLoader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const { template, loading, deleteTemplate } = useTemplate(id);

  async function handleDelete() {
    try {
      await deleteTemplate(id);
      toast.success("Template berhasil dihapus");
      router.push("/admin/templates");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus template";
      toast.error(message);
    }
  }

  if (loading) return <FullPageLoader />;

  if (!template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Template tidak ditemukan" />
        <p className="text-muted-foreground">Template tidak ada atau sudah dihapus.</p>
        <Link href="/admin/templates">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const layoutConfig = LAYOUT_CONFIG[template.layout_type as LayoutType];

  return (
    <div className="space-y-6">
      <PageHeader title="Detail Template" description={template.name}>
        <div className="flex items-center gap-2">
          {/* NEW: Preview PDF Button */}
          <TemplatePreviewModal template={template} />

          <Link href={`/admin/templates/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Layout</p>
              <Badge variant="outline" className="mt-1">
                {layoutConfig.label}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Perihal Default</p>
              <p className="font-medium mt-1">{template.perihal || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sifat</p>
              <p className="font-medium mt-1">{template.sifat}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fitur Layout</p>
              <div className="text-xs mt-1">
                {layoutConfig.features.judulTengah && <p>✅ Judul Tengah</p>}
                {layoutConfig.features.pakaiKepada && <p>✅ Kepada Yth</p>}
                {layoutConfig.features.pakaiTembusan && <p>✅ Tembusan</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Body Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded">
              {template.isi_surat}
            </pre>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-medium mb-2">Fields yang akan diisi user:</p>
            <div className="flex flex-wrap gap-2">
              {template.isi_surat.match(/\[Isi ([^\]]+)\]/g)?.map((marker, i) => (
                <code key={i} className="bg-muted px-2 py-1 rounded">
                  {marker}
                </code>
              )) || <span className="text-muted-foreground">Tidak ada field dinamis</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Hapus Template"
        description="Template yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?"
      />
    </div>
  );
}