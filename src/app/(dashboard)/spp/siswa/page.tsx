"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { useSiswaList } from "@/hooks/use-siswa";
import { useAuthStore } from "@/stores";

import { PageHeader, EmptyState } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiswaTable } from "@/components/features/spp/siswa-table";

export default function SiswaPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { siswaList, loading } = useSiswaList(
    user?.lembaga_id ?? undefined,
    true
  );

  const filtered = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Siswa"
        description="Daftar siswa aktif"
        backHref="/spp"
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau NIS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
              title="Tidak ada siswa"
              description={search ? "Tidak ditemukan hasil pencarian" : "Belum ada siswa aktif"}
              className="py-12"
            />
          ) : (
            <SiswaTable
              data={filtered}
              onRowClick={(s) => router.push(`/spp/tagihan?siswa=${s.id}`)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
