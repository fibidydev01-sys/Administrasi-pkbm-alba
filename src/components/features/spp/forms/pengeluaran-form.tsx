"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter,
} from "@/components/ui/sheet";

import { KATEGORI_PENGELUARAN_OPTIONS } from "@/constants/spp-config";
import type { PengeluaranInsert } from "@/types/spp";

const schema = z.object({
  kategori:   z.string().min(1, "Kategori wajib dipilih"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
  nominal:    z.coerce.number().min(1000, "Minimal Rp 1.000"),
  tanggal:    z.string().min(1, "Tanggal wajib diisi"),
  nomor_ref:  z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface PengeluaranFormProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  lembagaId:    string;
  onSubmit:     (data: PengeluaranInsert) => Promise<void>;
  isSubmitting?: boolean;
}

export function PengeluaranForm({
  open, onOpenChange, lembagaId, onSubmit, isSubmitting = false,
}: PengeluaranFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver:      zodResolver(schema),
    defaultValues: { tanggal: today },
  });

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      lembaga_id: lembagaId,
      kategori:   values.kategori,
      keterangan: values.keterangan,
      nominal:    values.nominal,
      tanggal:    values.tanggal,
      nomor_ref:  values.nomor_ref || undefined,
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Input Pengeluaran</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Kategori *</Label>
            <Select
              value={watch("kategori") ?? ""}
              onValueChange={(v) => setValue("kategori", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_PENGELUARAN_OPTIONS.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan *</Label>
            <Textarea
              id="keterangan"
              {...register("keterangan")}
              rows={3}
              placeholder="Deskripsi pengeluaran..."
            />
            {errors.keterangan && <p className="text-xs text-destructive">{errors.keterangan.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nominal">Nominal (Rp) *</Label>
              <Input id="nominal" type="number" {...register("nominal")} placeholder="50000" />
              {errors.nominal && <p className="text-xs text-destructive">{errors.nominal.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal *</Label>
              <Input id="tanggal" type="date" {...register("tanggal")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomor_ref">No. Referensi / Struk</Label>
            <Input id="nomor_ref" {...register("nomor_ref")} placeholder="Opsional" />
          </div>

          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
