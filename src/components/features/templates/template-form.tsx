"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { useTemplate } from "@/hooks/use-template";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType, LetterTemplateInsert } from "@/types/template";

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

const templateSchema = z.object({
  name: z.string().min(1, "Nama template wajib diisi"),
  layout_type: z.enum(["keterangan", "undangan", "umum"]),
  perihal: z.string().optional(),
  isi_surat: z.string().min(1, "Isi surat wajib diisi"),
  sifat: z.enum(["Biasa", "Penting", "Segera", "Rahasia"]),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  mode: "create" | "edit";
  templateId?: string;
  defaultValues?: Partial<TemplateFormData>;
}

export default function TemplateForm({ mode, templateId, defaultValues }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createTemplate, updateTemplate } = useTemplate(templateId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      layout_type: "umum",
      perihal: "",
      isi_surat: "",
      sifat: "Biasa", // REQUIRED with default
      ...defaultValues,
    },
  });

  const layoutType = watch("layout_type");
  const currentLayout = LAYOUT_CONFIG[layoutType];

  async function onSubmit(data: TemplateFormData) {
    try {
      setIsSubmitting(true);

      if (mode === "create") {
        const result = await createTemplate(data as LetterTemplateInsert);
        toast.success("Template berhasil dibuat");
        router.push(`/admin/templates/${result.data.id}`);
      } else if (templateId) {
        await updateTemplate(templateId, data);
        toast.success("Template berhasil diperbarui");
        router.push(`/admin/templates/${templateId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Buat Template Baru" : "Edit Template"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nama Template */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Template *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Contoh: Undangan Rapat Koordinasi"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Layout Type */}
          <div className="space-y-2">
            <Label htmlFor="layout_type">Pilih Layout *</Label>
            <Select
              value={layoutType}
              onValueChange={(val) => setValue("layout_type", val as LayoutType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(LAYOUT_CONFIG) as LayoutType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{LAYOUT_CONFIG[key].label}</div>
                      <div className="text-xs text-muted-foreground">
                        {LAYOUT_CONFIG[key].description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.layout_type && (
              <p className="text-sm text-destructive">{errors.layout_type.message}</p>
            )}

            {/* Layout Info */}
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p className="font-medium mb-1">Fitur layout ini:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Judul tengah: {currentLayout.features.judulTengah ? "✅ Ada" : "❌ Tidak"}
                </li>
                <li>
                  Kepada Yth: {currentLayout.features.pakaiKepada ? "✅ Ada" : "❌ Tidak"}
                </li>
                <li>
                  Tembusan: {currentLayout.features.pakaiTembusan ? "✅ Ada" : "❌ Tidak"}
                </li>
              </ul>
            </div>
          </div>

          {/* Perihal */}
          <div className="space-y-2">
            <Label htmlFor="perihal">Perihal Default (opsional)</Label>
            <Input
              id="perihal"
              {...register("perihal")}
              placeholder="Contoh: Undangan Rapat Koordinasi"
            />
            <p className="text-xs text-muted-foreground">
              User bisa mengubah perihal saat membuat surat
            </p>
          </div>

          {/* Isi Surat / Body Template */}
          <div className="space-y-2">
            <Label htmlFor="isi_surat">Isi Surat (Body Template) *</Label>
            <Textarea
              id="isi_surat"
              {...register("isi_surat")}
              placeholder="Tuliskan body template..."
              rows={16}
            />
            {errors.isi_surat && (
              <p className="text-sm text-destructive">{errors.isi_surat.message}</p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Format template:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <code className="bg-muted px-1 py-0.5 rounded">{"{{table_start}}"}</code> dan{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">{"{{table_end}}"}</code> untuk
                  membuat tabel rapih
                </li>
                <li>
                  Di dalam tabel: <code className="bg-muted px-1 py-0.5 rounded">Label|[Isi X]</code>
                  (pisah dengan |)
                </li>
                <li>
                  Untuk inline field: <code className="bg-muted px-1 py-0.5 rounded">[Isi X]</code>
                </li>
              </ul>
              <p className="mt-2 font-medium">Contoh:</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                {`Yang bertanda tangan di bawah ini:

{{table_start}}
Nama|[Isi nama]
TTL|[Isi TTL]
{{table_end}}

Semester [Isi semester] Tahun [Isi tahun].`}
              </pre>
            </div>
          </div>

          {/* Sifat */}
          <div className="space-y-2">
            <Label htmlFor="sifat">Sifat Surat Default</Label>
            <Select
              value={watch("sifat")}
              onValueChange={(val) =>
                setValue("sifat", val as "Biasa" | "Penting" | "Segera" | "Rahasia")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Biasa">Biasa</SelectItem>
                <SelectItem value="Penting">Penting</SelectItem>
                <SelectItem value="Segera">Segera</SelectItem>
                <SelectItem value="Rahasia">Rahasia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Menyimpan...
            </>
          ) : mode === "create" ? (
            "Buat Template"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}