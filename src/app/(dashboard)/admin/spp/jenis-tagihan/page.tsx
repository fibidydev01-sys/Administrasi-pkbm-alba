"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

import { useJenisTagihanList } from "@/hooks/use-jenis-tagihan";
import { useLembagaList } from "@/hooks";
import { useRequireAdmin } from "@/hooks";

import { PageHeader, FullPageLoader, EmptyState, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import { JenisTagihanForm } from "@/components/features/spp/forms/jenis-tagihan-form";
import { formatRupiah } from "@/constants/spp-config";

import type { JenisTagihan, JenisTagihanInsert } from "@/types/spp";

export default function AdminJenisTagihanPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const { lembagas } = useLembagaList();
  const [selectedLembaga, setSelectedLembaga] = useState<string>("all");

  const {
    jenisTagihanList,
    loading,
    createJenisTagihan,
    updateJenisTagihan,
    toggleAktif,
    deleteJenisTagihan,
  } = useJenisTagihanList(selectedLembaga === "all" ? undefined : selectedLembaga);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JenisTagihan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JenisTagihan | null>(null);

  if (authLoading) return <FullPageLoader />;

  async function handleSubmit(data: JenisTagihanInsert) {
    try {
      setIsSubmitting(true);
      if (editTarget) {
        await updateJenisTagihan(editTarget.id, data);
        toast.success("Jenis tagihan diperbarui");
      } else {
        await createJenisTagihan(data);
        toast.success("Jenis tagihan ditambahkan");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteJenisTagihan(deleteTarget.id);
      toast.success("Jenis tagihan dihapus");
    } catch {
      toast.error("Gagal menghapus. Mungkin sudah digunakan di tagihan.");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleToggle(item: JenisTagihan) {
    try {
      await toggleAktif(item.id, !item.is_active);
      toast.success(item.is_active ? "Dinonaktifkan" : "Diaktifkan");
    } catch {
      toast.error("Gagal mengubah status");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jenis Tagihan"
        description="Kelola tarif SPP dan jenis tagihan per lembaga"
      >
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </PageHeader>

      <div className="flex gap-3">
        <Select value={selectedLembaga} onValueChange={setSelectedLembaga}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Pilih Lembaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lembaga</SelectItem>
            {lembagas.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jenisTagihanList.length === 0 ? (
            <EmptyState
              title="Belum ada jenis tagihan"
              description="Tambahkan jenis tagihan terlebih dahulu sebelum generate tagihan"
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Urutan</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jenisTagihanList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{item.urutan}</TableCell>
                    <TableCell className="font-medium">{item.nama}</TableCell>
                    <TableCell className="font-mono">{formatRupiah(item.nominal)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.tipe === "bulanan" ? "Bulanan" : "Insidental"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(item)}
                        >
                          {item.is_active
                            ? <ToggleRight className="h-4 w-4 text-primary" />
                            : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setEditTarget(item); setFormOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <JenisTagihanForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lembagaId={selectedLembaga === "all" ? (lembagas[0]?.id || "") : selectedLembaga}
        editData={editTarget}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        itemName={deleteTarget?.nama}
        onConfirm={handleDelete}
      />
    </div>
  );
}