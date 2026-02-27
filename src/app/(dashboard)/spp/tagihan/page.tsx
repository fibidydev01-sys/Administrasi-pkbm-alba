"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { useTagihanList } from "@/hooks/use-tagihan";
import { useLembagaList } from "@/hooks";
import { useAuthStore } from "@/stores";

import { PageHeader, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
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

import { TagihanStatusBadge } from "@/components/features/spp/tagihan-status-badge";
import {
  BULAN_OPTIONS, getTahunOptions,
  formatRupiah, getCurrentBulan, getCurrentTahun,
} from "@/constants/spp-config";
import { formatTanggalPendek } from "@/lib/date";

export default function TagihanListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const { lembagas } = useLembagaList();

  const [lembagaId, setLembagaId] = useState(
    isAdmin ? "all" : (user?.lembaga_id ?? "all")
  );
  const [bulan, setBulan] = useState(getCurrentBulan());
  const [tahun, setTahun] = useState(getCurrentTahun());
  const [status, setStatus] = useState("all");

  const tahunOptions = getTahunOptions(2);

  const { tagihanList, loading } = useTagihanList({
    lembagaId: lembagaId === "all" ? undefined : lembagaId,
    bulan,
    tahun,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tagihan SPP"
        description="Daftar tagihan SPP siswa"
      >
        <Button onClick={() => router.push("/spp/tagihan/generate")}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Tagihan
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <Select value={lembagaId} onValueChange={setLembagaId}>
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
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BULAN_OPTIONS.map((b) => (
              <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(tahun)} onValueChange={(v) => setTahun(parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tahunOptions.map((t) => (
              <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="unpaid">Belum Bayar</SelectItem>
            <SelectItem value="partial">Sebagian</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="void">Batal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : tagihanList.length === 0 ? (
            <EmptyState
              title="Belum ada tagihan"
              description="Generate tagihan terlebih dahulu"
              action={{ label: "Generate Tagihan", onClick: () => router.push("/spp/tagihan/generate") }}
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Tagihan</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Dibayar</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagihanList.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/spp/tagihan/${t.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{t.nomor_tagihan}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{(t as any).siswa?.nama}</p>
                        <p className="text-xs text-muted-foreground">{(t as any).siswa?.nis}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {BULAN_OPTIONS.find((b) => b.value === t.bulan)?.label} {t.tahun}
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatRupiah(t.total_tagihan)}</TableCell>
                    <TableCell className="text-right font-mono text-green-700">{formatRupiah(t.total_dibayar)}</TableCell>
                    <TableCell className="text-right font-mono text-destructive">{formatRupiah(t.sisa_tagihan)}</TableCell>
                    <TableCell><TagihanStatusBadge status={t.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.tanggal_jatuh_tempo ? formatTanggalPendek(t.tanggal_jatuh_tempo) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}