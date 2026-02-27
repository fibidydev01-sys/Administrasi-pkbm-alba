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
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

import { METODE_PEMBAYARAN_OPTIONS, formatRupiah } from "@/constants/spp-config";
import type { PembayaranInsert } from "@/types/spp";

const pembayaranSchema = z.object({
  jumlah:       z.coerce.number().min(1000, "Minimal Rp 1.000"),
  metode:       z.enum(["tunai", "transfer", "qris"]),
  tanggal_bayar: z.string().min(1, "Tanggal wajib diisi"),
  catatan:      z.string().optional().or(z.literal("")),
});

type PembayaranFormValues = z.infer<typeof pembayaranSchema>;

interface PembayaranFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagihanId: string;
  siswaName: string;
  sisaTagihan: number;
  onSubmit: (data: PembayaranInsert) => Promise<void>;
  isSubmitting?: boolean;
}

export function PembayaranForm({
  open,
  onOpenChange,
  tagihanId,
  siswaName,
  sisaTagihan,
  onSubmit,
  isSubmitting = false,
}: PembayaranFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PembayaranFormValues>({
    resolver: zodResolver(pembayaranSchema),
    defaultValues: {
      jumlah:        sisaTagihan,
      metode:        "tunai",
      tanggal_bayar: today,
    },
  });

  async function handleFormSubmit(values: PembayaranFormValues) {
    await onSubmit({
      tagihan_id:    tagihanId,
      jumlah:        values.jumlah,
      metode:        values.metode,
      tanggal_bayar: values.tanggal_bayar,
      catatan:       values.catatan || undefined,
      nomor_bukti:   "",
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Input Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-3 text-sm">
          <p className="font-medium">{siswaName}</p>
          <p className="text-muted-foreground">
            Sisa tagihan: <span className="font-mono font-semibold text-destructive">{formatRupiah(sisaTagihan)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah Bayar (Rp) *</Label>
            <Input
              id="jumlah"
              type="number"
              {...register("jumlah")}
              placeholder={String(sisaTagihan)}
            />
            {errors.jumlah && <p className="text-xs text-destructive">{errors.jumlah.message}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setValue("jumlah", sisaTagihan)}
              className="text-xs h-7"
            >
              Bayar Penuh {formatRupiah(sisaTagihan)}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Metode *</Label>
              <Select
                value={watch("metode")}
                onValueChange={(v) => setValue("metode", v as "tunai" | "transfer" | "qris")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METODE_PEMBAYARAN_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_bayar">Tanggal *</Label>
              <Input id="tanggal_bayar" type="date" {...register("tanggal_bayar")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea id="catatan" {...register("catatan")} rows={2} placeholder="Opsional..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
