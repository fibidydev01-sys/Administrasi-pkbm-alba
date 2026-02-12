"use client";

import { use } from "react";
import { useTemplate } from "@/hooks/use-template";
import { PageHeader, FullPageLoader } from "@/components/shared";
import TemplateForm from "@/components/features/templates/template-form";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { template, loading } = useTemplate(id);

  if (loading) return <FullPageLoader />;

  if (!template) {
    return (
      <div className="space-y-6">
        <PageHeader title="Template tidak ditemukan" />
        <p className="text-muted-foreground">Template tidak ada atau sudah dihapus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Template"
        description={template.name}
        backHref="/admin/templates"
      />
      <TemplateForm
        mode="edit"
        templateId={id}
        defaultValues={{
          name: template.name,
          layout_type: template.layout_type as "keterangan" | "undangan" | "umum",
          perihal: template.perihal ?? "",
          isi_surat: template.isi_surat,
          sifat: template.sifat as "Biasa" | "Penting" | "Segera" | "Rahasia",
        }}
      />
    </div>
  );
}