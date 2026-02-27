"use client";

import dynamic from "next/dynamic";
import { Download } from "lucide-react";

import { useTagihanList } from "@/hooks/use-tagihan";
import { usePengeluaranList } from "@/hooks/use-pengeluaran";
import { useLembaga, useLembagaList } from "@/hooks";
import { useAuthStore } from "@/stores";
import { useSppStore } from "@/stores/spp-store";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";

import { TagihanStatusBadge } from "@/components/features/spp/tagihan-status-badge";
import {
  BULAN_OPTIONS, getTahunOptions, formatRupiah,
} from "@/constants/spp-config";
import { formatTanggalPendek } from "@/lib/date";

// ✅ Dynamic import seluruh PDF button — hindari SSR + avoid "su is not a function"
const LaporanPdfButton = dynamic(
  () => import("@/components/features/spp/laporan-pdf-button").then((m) => m.LaporanPdfButton),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </Button>
    ),
  }
);

export default function LaporanPage() {
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
    ? (lembagaId || lembagas[0]?.id)
    : (user?.lembaga_id ?? undefined);

  const { lembaga } = useLembaga(activeLembagaId);

  const { tagihanList, loading: loadTagihan } = useTagihanList({
    lembagaId: activeLembagaId,
    bulan,
    tahun,
  });

  const { pengeluaranList, loading: loadPengeluaran, totalPengeluaran } = usePengeluaranList({
    lembagaId: activeLembagaId,
    bulan,
    tahun,
  });

  const loading = loadTagihan || loadPengeluaran;
  const totalTagihan = tagihanList.reduce((s, t) => s + t.total_tagihan, 0);
  const totalTerkumpul = tagihanList.reduce((s, t) => s + t.total_dibayar, 0);
  const totalTunggakan = tagihanList.reduce((s, t) => s + t.sisa_tagihan, 0);
  const saldo = totalTerkumpul - totalPengeluaran;
  const periodeLabel = `${BULAN_OPTIONS.find((b) => b.value === bulan)?.label} ${tahun}`;
  const fileName = `Laporan-SPP-${periodeLabel.replace(" ", "-")}.pdf`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Bulanan"
        description="Rekap pemasukan dan pengeluaran SPP"
        backHref="/spp"
      >
        {/* ✅ Render PDF button hanya setelah data ready, pakai dynamic component */}
        {!loading && lembaga && (
          <LaporanPdfButton
            lembagaNama={lembaga.nama}
            lembagaAlamat={lembaga.alamat}
            bulan={bulan}
            tahun={tahun}
            tagihanList={tagihanList}
            pengeluaranList={pengeluaranList}
            ttdNama={lembaga.ttd_nama ?? ""}
            ttdJabatan={lembaga.ttd_jabatan ?? ""}
            fileName={fileName}
          />
        )}
      </PageHeader>

      {/* Filter */}
      <div className="flex flex-wrap gap-3">
        {isAdmin && (
          <Select
            value={lembagaId || (lembagas[0]?.id ?? "all")}
            onValueChange={(v) => setLembagaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Lembaga" />
            </SelectTrigger>
            <SelectContent>
              {lembagas.length === 0 && (
                <SelectItem value="all">Pilih Lembaga</SelectItem>
              )}
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
            {tahunOptions.map((t) => (
              <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Tagihan", value: formatRupiah(totalTagihan), color: "" },
            { label: "Terkumpul", value: formatRupiah(totalTerkumpul), color: "text-green-700" },
            { label: "Tunggakan", value: formatRupiah(totalTunggakan), color: "text-destructive" },
            { label: "Pengeluaran", value: formatRupiah(totalPengeluaran), color: "text-destructive" },
            { label: "Saldo Bersih", value: formatRupiah(saldo), color: saldo >= 0 ? "text-green-700" : "text-destructive" },
          ].map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-xs text-muted-foreground">{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Tabs */}
      <Tabs defaultValue="pemasukan">
        <TabsList>
          <TabsTrigger value="pemasukan">Pemasukan ({tagihanList.length})</TabsTrigger>
          <TabsTrigger value="pengeluaran">Pengeluaran ({pengeluaranList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pemasukan">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : tagihanList.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  Belum ada tagihan untuk periode ini
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>No. Tagihan</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Dibayar</TableHead>
                        <TableHead className="text-right">Sisa</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tagihanList.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{(t as any).siswa?.nama}</p>
                            <p className="text-xs text-muted-foreground">{(t as any).siswa?.nis}</p>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{t.nomor_tagihan}</TableCell>
                          <TableCell className="text-right font-mono">{formatRupiah(t.total_tagihan)}</TableCell>
                          <TableCell className="text-right font-mono text-green-700">{formatRupiah(t.total_dibayar)}</TableCell>
                          <TableCell className="text-right font-mono text-destructive">{formatRupiah(t.sisa_tagihan)}</TableCell>
                          <TableCell><TagihanStatusBadge status={t.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator />
                  <div className="flex justify-between items-center p-4 text-sm font-medium">
                    <span>Total Terkumpul {periodeLabel}</span>
                    <span className="font-mono font-bold text-green-700">{formatRupiah(totalTerkumpul)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengeluaran">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : pengeluaranList.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  Belum ada pengeluaran untuk periode ini
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pengeluaranList.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-sm">{formatTanggalPendek(p.tanggal)}</TableCell>
                          <TableCell><Badge variant="outline">{p.kategori}</Badge></TableCell>
                          <TableCell className="text-sm">{p.keterangan}</TableCell>
                          <TableCell className="text-right font-mono text-destructive">{formatRupiah(p.nominal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Separator />
                  <div className="flex justify-between items-center p-4 text-sm font-medium">
                    <span>Total Pengeluaran {periodeLabel}</span>
                    <span className="font-mono font-bold text-destructive">{formatRupiah(totalPengeluaran)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}