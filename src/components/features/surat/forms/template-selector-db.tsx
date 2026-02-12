"use client";

import { useTemplateList } from "@/hooks/use-template";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType, LetterTemplate } from "@/types/template";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

interface TemplateSelectorDBProps {
  value?: string;
  onTemplateSelect: (template: LetterTemplate | null) => void;
  disabled?: boolean;
}

export default function TemplateSelectorDB({
  value,
  onTemplateSelect,
  disabled,
}: TemplateSelectorDBProps) {
  const { templates, loading } = useTemplateList();

  function handleValueChange(templateId: string) {
    if (!templateId || templateId === "no-templates") {
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Pilih Template</Label>
        <div className="flex items-center gap-2 p-3 border rounded-md">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Memuat template...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="template_selector">Pilih Template *</Label>
      <Select value={value || ""} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger id="template_selector">
          <SelectValue placeholder="Pilih template" />
        </SelectTrigger>
        <SelectContent>
          {templates.length > 0 ? (
            templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {LAYOUT_CONFIG[template.layout_type as LayoutType]?.label || template.layout_type}
                      {template.perihal && ` • ${template.perihal}`}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-templates" disabled>
              Belum ada template
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {templates.length === 0 && (
        <p className="text-xs text-destructive">
          Belum ada template. Admin harus membuat template terlebih dahulu di menu Template Surat.
        </p>
      )}
    </div>
  );
}