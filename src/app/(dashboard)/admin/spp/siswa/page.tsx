"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

import { useSiswaList } from "@/hooks/use-siswa";
import { useLembagaList } from "@/hooks";
import { useRequireAdmin } from "@/hooks";
import { useAuthStore } from "@/stores";

import { PageHeader, FullPageLoader, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { SiswaTable } from "@/components/features/spp/siswa-table";
import { SiswaForm } from "@/components/features/spp/forms/siswa-form";
import { DeleteConfirmDialog } from "@/components/shared";

import type { Siswa, SiswaInsert } from "@/types/spp";

export default function AdminSiswaPage() {
  const { isLoading: authLoading } = useRequireAdmin();
  const user = useAuthStore((s) => s.user);

  const { lembagas } = useLembagaList();
  const [selectedLembaga, setSelectedLembaga] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const { siswaList, loading, createSiswa, refresh } = useSiswaList(
    selectedLembaga === "all" ? undefined : selectedLembaga,
    !showAll
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Siswa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Siswa | null>(null);

  if (authLoading) return <FullPageLoader />;

  const filtered = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(data: SiswaInsert) {
    try {
      setIsSubmitting(true);
      await createSiswa({ ...data, created_by: user?.id });
      toast.success("Siswa berhasil ditambahkan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAktif() {
    if (!toggleTarget) return;
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      await supabase
        .from("siswa")
        .update({
          is_active: !toggleTarget.is_active,
          tanggal_keluar: !toggleTarget.is_active
            ? null
            : new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", toggleTarget.id);
      toast.success(
        toggleTarget.is_active ? "Siswa dinonaktifkan" : "Siswa diaktifkan"
      );
      refresh();
    } catch {
      toast.error("Gagal mengubah status siswa");
    } finally {
      setConfirmOpen(false);
      setToggleTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Siswa"
        description="Kelola data siswa untuk penagihan SPP"
      >
        <Button onClick={() => { setEditTarget(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Siswa
        </Button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedLembaga} onValueChange={setSelectedLembaga}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Semua Lembaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lembaga</SelectItem>
            {lembagas.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Aktif Saja" : "Tampil Semua"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Belum ada siswa"
              description="Tambahkan siswa untuk mulai membuat tagihan SPP"
              className="py-12"
            />
          ) : (
            <SiswaTable
              data={filtered}
              onEdit={(s) => { setEditTarget(s); setFormOpen(true); }}
              onToggleAktif={(s) => { setToggleTarget(s); setConfirmOpen(true); }}
            />
          )}
        </CardContent>
      </Card>

      <SiswaForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lembagaId={selectedLembaga === "all" ? (lembagas[0]?.id || "") : selectedLembaga}
        editData={editTarget}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={toggleTarget?.is_active ? "Nonaktifkan Siswa" : "Aktifkan Siswa"}
        description={
          toggleTarget?.is_active
            ? `Nonaktifkan ${toggleTarget?.nama}? Siswa tidak akan muncul di generate tagihan.`
            : `Aktifkan kembali ${toggleTarget?.nama}?`
        }
        isLoading={false}
        onConfirm={handleToggleAktif}
      />
    </div>
  );
}