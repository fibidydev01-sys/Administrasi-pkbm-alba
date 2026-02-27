"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

import { JENIS_TAGIHAN_TIPE_OPTIONS } from "@/constants/spp-config";
import type { JenisTagihan, JenisTagihanInsert } from "@/types/spp";

const jenisTagihanSchema = z.object({
  nama:    z.string().min(1, "Nama wajib diisi").max(100),
  nominal: z.coerce.number().min(1, "Nominal harus lebih dari 0"),
  tipe:    z.enum(["bulanan", "insidental"]),
  urutan:  z.coerce.number().min(1).default(1),
});

type JenisTagihanFormValues = z.infer<typeof jenisTagihanSchema>;

interface JenisTagihanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lembagaId: string;
  editData?: JenisTagihan | null;
  onSubmit: (data: JenisTagihanInsert) => Promise<void>;
  isSubmitting?: boolean;
}

export function JenisTagihanForm({
  open,
  onOpenChange,
  lembagaId,
  editData,
  onSubmit,
  isSubmitting = false,
}: JenisTagihanFormProps) {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<JenisTagihanFormValues>({
    resolver: zodResolver(jenisTagihanSchema),
    defaultValues: { tipe: "bulanan", urutan: 1 },
  });

  useEffect(() => {
    if (editData) {
      reset({
        nama:    editData.nama,
        nominal: editData.nominal,
        tipe:    editData.tipe,
        urutan:  editData.urutan,
      });
    } else {
      reset({ nama: "", nominal: 0, tipe: "bulanan", urutan: 1 });
    }
  }, [editData, reset]);

  async function handleFormSubmit(values: JenisTagihanFormValues) {
    await onSubmit({
      lembaga_id: lembagaId,
      nama:       values.nama,
      nominal:    values.nominal,
      tipe:       values.tipe,
      urutan:     values.urutan,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Jenis Tagihan" : "Tambah Jenis Tagihan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Tagihan *</Label>
            <Input id="nama" {...register("nama")} placeholder="SPP Bulanan" />
            {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nominal">Nominal (Rp) *</Label>
            <Input
              id="nominal"
              type="number"
              {...register("nominal")}
              placeholder="150000"
            />
            {errors.nominal && <p className="text-xs text-destructive">{errors.nominal.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipe *</Label>
            <Select
              value={watch("tipe")}
              onValueChange={(v) => setValue("tipe", v as "bulanan" | "insidental")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JENIS_TAGIHAN_TIPE_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan Tampil</Label>
            <Input id="urutan" type="number" {...register("urutan")} placeholder="1" />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
