"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { usePengeluaranList } from "@/hooks/use-pengeluaran";
import { useLembagaList } from "@/hooks";
import { useAuthStore } from "@/stores";
import { useSppStore } from "@/stores/spp-store";

import { PageHeader, EmptyState, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import { PengeluaranForm } from "@/components/features/spp/forms/pengeluaran-form";
import {
  BULAN_OPTIONS, getTahunOptions, formatRupiah,
} from "@/constants/spp-config";
import { formatTanggalPendek } from "@/lib/date";
import type { PengeluaranInsert, Pengeluaran } from "@/types/spp";

export default function PengeluaranPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const user = useAuthStore((s) => s.user);
  const { lembagas } = useLembagaList();

  const bulan = useSppStore((s) => s.bulan);
  const tahun = useSppStore((s) => s.tahun);
  const lembagaId = useSppStore((s) => s.lembagaId);
  const setBulan = useSppStore((s) => s.setBulan);
  const setTahun = useSppStore((s) => s.setTahun);
  const setLembagaId = useSppStore((s) => s.setLembagaId);

  const tahunOptions = getTahunOptions(2);

  const activeLembagaId = isAdmin
    ? (lembagaId || undefined)
    : (user?.lembaga_id ?? undefined);

  const {
    pengeluaranList, loading, totalPengeluaran,
    createPengeluaran, deletePengeluaran,
  } = usePengeluaranList({ lembagaId: activeLembagaId, bulan, tahun });

  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pengeluaran | null>(null);

  async function handleSubmit(data: PengeluaranInsert) {
    try {
      setIsSubmitting(true);
      await createPengeluaran({ ...data, created_by: user?.id });
      toast.success("Pengeluaran berhasil disimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePengeluaran(deleteTarget.id);
      toast.success("Pengeluaran dihapus");
    } catch {
      toast.error("Gagal menghapus");
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengeluaran"
        description="Catat uang keluar lembaga"
        backHref="/spp"
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Input Pengeluaran
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <Select
            value={lembagaId || "all"}
            onValueChange={(v) => setLembagaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Lembaga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lembaga</SelectItem>
              {lembagas.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={String(bulan)} onValueChange={(v) => setBulan(parseInt(v))}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {BULAN_OPTIONS.map((b) => (
              <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(tahun)} onValueChange={(v) => setTahun(parseInt(v))}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {getTahunOptions(2).map((t) => (
              <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Total */}
      {!loading && pengeluaranList.length > 0 && (
        <div className="flex justify-end">
          <div className="bg-muted rounded-lg px-4 py-2 text-sm">
            Total Pengeluaran:{" "}
            <span className="font-bold font-mono text-destructive">
              {formatRupiah(totalPengeluaran)}
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pengeluaranList.length === 0 ? (
            <EmptyState
              title="Belum ada pengeluaran"
              description="Catat pengeluaran lembaga bulan ini"
              action={{ label: "Input Pengeluaran", onClick: () => setFormOpen(true) }}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>No. Ref</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pengeluaranList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{formatTanggalPendek(p.tanggal)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.kategori}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{p.keterangan}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.nomor_ref ?? "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive font-medium">
                      {formatRupiah(p.nominal)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PengeluaranForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lembagaId={activeLembagaId || lembagas[0]?.id || ""}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Hapus Pengeluaran"
        description={`Hapus pengeluaran "${deleteTarget?.keterangan}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}