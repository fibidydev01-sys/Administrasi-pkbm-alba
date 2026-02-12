"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { suratSchema, type SuratFormData } from "@/lib/validators";
import { useSurat, useLembagaList } from "@/hooks";
import { SURAT_SIFAT_OPTIONS, ROUTES } from "@/constants";
import { LAYOUT_CONFIG } from "@/types/template";
import { getTemplateFields, composeBody } from "@/lib/template-parser";
import type { LayoutType, LetterTemplate } from "@/types/template";
import { getToday } from "@/lib/date";
import type { SuratSifat } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import TembusanInput from "./tembusan-input";
import TemplateSelectorDB from "./template-selector-db";
import TemplateDynamicForm from "./template-dynamic-form";

interface SuratFormProps {
  mode: "create" | "edit";
  suratId?: string;
  defaultValues?: Partial<SuratFormData>;
}

export default function SuratForm({ mode, suratId, defaultValues }: SuratFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, string>>({});
  const [tembusanList, setTembusanList] = useState<string[]>([]);

  const { createSurat, updateSurat } = useSurat(suratId);
  const { lembagas, loading: lembagaLoading } = useLembagaList();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SuratFormData>({
    resolver: zodResolver(suratSchema),
    defaultValues: {
      lembaga_id: "",
      perihal: "",
      kepada: "",
      alamat_tujuan: "",
      isi_surat: "",
      lampiran: "",
      sifat: "Biasa",
      tanggal_surat: getToday(),
      template_id: undefined,
      ...defaultValues,
    },
  });

  const currentLayoutType = selectedTemplate?.layout_type as LayoutType | undefined;
  const layoutConfig = currentLayoutType && LAYOUT_CONFIG[currentLayoutType]
    ? LAYOUT_CONFIG[currentLayoutType]
    : null;

  /**
   * Handle template selection
   */
  const handleTemplateChange = useCallback(
    (template: LetterTemplate | null) => {
      if (!template) {
        setSelectedTemplate(null);
        setTemplateFieldValues({});
        setValue("template_id", undefined);
        setValue("perihal", "");
        setValue("isi_surat", "");
        setValue("sifat", "Biasa");
        return;
      }

      // Confirm if user has data
      const currentPerihal = watch("perihal");
      const currentIsi = watch("isi_surat");
      const hasData = currentPerihal || currentIsi;

      if (hasData && mode === "create") {
        const confirmed = window.confirm(
          "Ganti template? Data yang sudah diisi akan diganti."
        );
        if (!confirmed) return;
      }

      // Set template
      setSelectedTemplate(template);
      setValue("template_id", template.id);

      // Auto-fill from template
      if (template.perihal) {
        setValue("perihal", template.perihal, { shouldValidate: true });
      }
      setValue("sifat", template.sifat as SuratSifat, { shouldValidate: true });

      // Initialize empty field values
      const fields = getTemplateFields(template.isi_surat);
      const initialValues: Record<string, string> = {};
      fields.forEach((field) => {
        initialValues[field.fieldName] = "";
      });
      setTemplateFieldValues(initialValues);

      // Set kepada based on layout
      const layout = LAYOUT_CONFIG[template.layout_type as LayoutType];
      if (layout && !layout.features.pakaiKepada) {
        setValue("kepada", "-");
      } else {
        const currentKepada = watch("kepada");
        if (currentKepada === "-") {
          setValue("kepada", "");
        }
      }

      toast.success(`Template "${template.name}" diterapkan`);
    },
    [setValue, watch, mode]
  );

  /**
   * Handle template field value change
   */
  const handleTemplateFieldChange = (fieldName: string, value: string) => {
    setTemplateFieldValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  async function onSubmit(data: SuratFormData) {
    try {
      setIsSubmitting(true);

      // Validate template selected (create mode only)
      if (mode === "create" && !selectedTemplate) {
        toast.error("Template wajib dipilih!");
        return;
      }

      // Compose isi_surat from template ONLY in create mode
      let finalIsiSurat = data.isi_surat;
      if (mode === "create" && selectedTemplate) {
        finalIsiSurat = composeBody(selectedTemplate.isi_surat, templateFieldValues);
      }
      // In edit mode, use isi_surat directly from form (textarea)

      const submitData = {
        ...data,
        isi_surat: finalIsiSurat,
      };

      if (mode === "create") {
        const result = await createSurat(submitData);

        // Create tembusan separately
        if (tembusanList.length > 0) {
          const { createTembusan } = await import("@/lib/tembusan-helper");
          await createTembusan(result.data.id, tembusanList);
        }

        toast.success("Surat berhasil dibuat");
        router.push(ROUTES.SURAT_DETAIL(result.data.id));
      } else if (suratId) {
        await updateSurat(suratId, submitData);

        // Update tembusan separately
        const { updateTembusan } = await import("@/lib/tembusan-helper");
        await updateTembusan(suratId, tembusanList);

        toast.success("Surat berhasil diperbarui");
        router.push(ROUTES.SURAT_DETAIL(suratId));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (lembagaLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Buat Surat Baru" : "Edit Surat"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selector - REQUIRED! */}
          {mode === "create" && (
            <TemplateSelectorDB
              value={selectedTemplate?.id}
              onTemplateSelect={handleTemplateChange}
            />
          )}

          {/* Show error if no template selected */}
          {mode === "create" && !selectedTemplate && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Template wajib dipilih untuk membuat surat
              </p>
            </div>
          )}

          {/* Show layout info if template selected */}
          {selectedTemplate && layoutConfig && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm font-medium mb-2">
                Layout: {layoutConfig.label}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                  • Judul tengah: {layoutConfig.features.judulTengah ? "✅ Ada" : "❌ Tidak"}
                </li>
                <li>
                  • Kepada Yth: {layoutConfig.features.pakaiKepada ? "✅ Ada" : "❌ Tidak"}
                </li>
                <li>
                  • Tembusan: {layoutConfig.features.pakaiTembusan ? "✅ Ada" : "❌ Tidak"}
                </li>
              </ul>
            </div>
          )}

          {/* Lembaga */}
          <div className="space-y-2">
            <Label htmlFor="lembaga_id">Lembaga *</Label>
            <Select
              value={watch("lembaga_id")}
              onValueChange={(val) => setValue("lembaga_id", val, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    [{l.kode}] {l.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lembaga_id && (
              <p className="text-sm text-destructive">{errors.lembaga_id.message}</p>
            )}
          </div>

          {/* Perihal */}
          <div className="space-y-2">
            <Label htmlFor="perihal">Perihal *</Label>
            <Input id="perihal" {...register("perihal")} placeholder="Perihal surat" />
            {errors.perihal && (
              <p className="text-sm text-destructive">{errors.perihal.message}</p>
            )}
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground">
                Dari template, bisa diubah sesuai kebutuhan
              </p>
            )}
          </div>

          {/* Kepada - only if layout uses it */}
          {(!layoutConfig || layoutConfig.features.pakaiKepada) && (
            <div className="space-y-2">
              <Label htmlFor="kepada">Kepada (Tujuan)</Label>
              <Input id="kepada" {...register("kepada")} placeholder="Nama penerima surat" />
              {errors.kepada && (
                <p className="text-sm text-destructive">{errors.kepada.message}</p>
              )}
            </div>
          )}

          {/* Alamat Tujuan - only if layout uses kepada */}
          {(!layoutConfig || layoutConfig.features.pakaiKepada) && (
            <div className="space-y-2">
              <Label htmlFor="alamat_tujuan">Alamat Tujuan</Label>
              <Input
                id="alamat_tujuan"
                {...register("alamat_tujuan")}
                placeholder="Alamat tujuan surat"
              />
            </div>
          )}

          {/* Tanggal Surat */}
          <div className="space-y-2">
            <Label htmlFor="tanggal_surat">Tanggal Surat</Label>
            <Input id="tanggal_surat" type="date" {...register("tanggal_surat")} />
          </div>

          {/* Sifat */}
          <div className="space-y-2">
            <Label htmlFor="sifat">Sifat Surat</Label>
            <Select
              value={watch("sifat")}
              onValueChange={(val) =>
                setValue("sifat", val as SuratSifat, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih sifat surat" />
              </SelectTrigger>
              <SelectContent>
                {SURAT_SIFAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground">
                Dari template, bisa diubah sesuai kebutuhan
              </p>
            )}
          </div>

          {/* Lampiran */}
          <div className="space-y-2">
            <Label htmlFor="lampiran">Lampiran</Label>
            <Input id="lampiran" {...register("lampiran")} placeholder="Keterangan lampiran" />
          </div>

          {/* Dynamic Form from Template OR Editable Textarea */}
          {mode === "create" && selectedTemplate ? (
            <div className="space-y-2">
              <Label>Isi Surat (dari template)</Label>
              <Card>
                <CardContent className="pt-6">
                  <TemplateDynamicForm
                    bodyTemplate={selectedTemplate.isi_surat}
                    values={templateFieldValues}
                    onChange={handleTemplateFieldChange}
                  />
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">
                Isi field di atas, body surat akan ter-compose otomatis
              </p>
            </div>
          ) : mode === "create" ? (
            <div className="space-y-2">
              <Label>Isi Surat</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Pilih template terlebih dahulu untuk mulai mengisi surat
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="isi_surat">Isi Surat *</Label>
              <Textarea
                id="isi_surat"
                {...register("isi_surat")}
                placeholder="Isi surat..."
                rows={16}
              />
              {errors.isi_surat && (
                <p className="text-sm text-destructive">{errors.isi_surat.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Mode edit: Anda dapat mengedit isi surat secara langsung
              </p>
            </div>
          )}

          {/* Tembusan - only if layout supports it */}
          {(!layoutConfig || layoutConfig.features.pakaiTembusan) && (
            <div className="space-y-2">
              <Label>Tembusan</Label>
              <TembusanInput
                value={tembusanList}
                onChange={setTembusanList}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "create" && !selectedTemplate)}
        >
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Buat Surat"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
        {mode === "create" && !selectedTemplate && (
          <p className="text-xs text-muted-foreground">
            Pilih template untuk melanjutkan
          </p>
        )}
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}