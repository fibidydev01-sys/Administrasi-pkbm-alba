"use client";

import { PageHeader } from "@/components/shared";
import TemplateForm from "@/components/features/templates/template-form";

export default function CreateTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Template Baru"
        description="Template dengan 3 layout fixed: Keterangan, Undangan, Umum"
        backHref="/admin/templates"
      />
      <TemplateForm mode="create" />
    </div>
  );
}