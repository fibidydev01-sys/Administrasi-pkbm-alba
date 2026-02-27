"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Siswa, SiswaInsert } from "@/types/spp";

const schema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  kelas: z.string().optional(),
  nama_wali: z.string().optional(),
  nomor_wa: z.string().optional(),
  tanggal_masuk: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface SiswaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lembagaId: string;
  editData?: Siswa | null;
  onSubmit: (data: SiswaInsert) => Promise<void>;
  isSubmitting: boolean;
}

export function SiswaForm({
  open, onOpenChange, lembagaId,
  editData, onSubmit, isSubmitting,
}: SiswaFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset({
        nis: editData?.nis ?? "",
        nama: editData?.nama ?? "",
        kelas: editData?.kelas ?? "",
        nama_wali: editData?.nama_wali ?? "",
        nomor_wa: editData?.nomor_wa ?? "",
        tanggal_masuk: editData?.tanggal_masuk ?? "",
      });
    }
  }, [open, editData, reset]);

  async function handleFormSubmit(values: FormValues) {
    await onSubmit({
      lembaga_id: lembagaId,
      nis: values.nis,
      nama: values.nama,
      kelas: values.kelas || undefined,
      nama_wali: values.nama_wali || undefined,
      nomor_wa: values.nomor_wa || undefined,
      tanggal_masuk: values.tanggal_masuk || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* NIS + Tanggal Masuk */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nis">NIS <span className="text-destructive">*</span></Label>
              <Input id="nis" placeholder="12345" {...register("nis")} />
              {errors.nis && <p className="text-xs text-destructive">{errors.nis.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tanggal_masuk">Tanggal Masuk</Label>
              <Input id="tanggal_masuk" type="date" {...register("tanggal_masuk")} />
            </div>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="nama">Nama Lengkap <span className="text-destructive">*</span></Label>
            <Input id="nama" placeholder="Nama lengkap siswa" {...register("nama")} />
            {errors.nama && <p className="text-xs text-destructive">{errors.nama.message}</p>}
          </div>

          {/* Kelas */}
          <div className="space-y-1.5">
            <Label htmlFor="kelas">Kelas</Label>
            <Input id="kelas" placeholder="Contoh: RA A, RA B" {...register("kelas")} />
          </div>

          {/* Nama Wali */}
          <div className="space-y-1.5">
            <Label htmlFor="nama_wali">Nama Wali</Label>
            <Input id="nama_wali" placeholder="Nama orang tua/wali" {...register("nama_wali")} />
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="nomor_wa">Nomor WhatsApp</Label>
            <Input id="nomor_wa" placeholder="08xxxxxxxxxx" {...register("nomor_wa")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : editData ? "Simpan Perubahan" : "Tambah Siswa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}