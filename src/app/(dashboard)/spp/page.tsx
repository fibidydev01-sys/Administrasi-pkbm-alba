"use client";

import { useRouter } from "next/navigation";
import {
  Users, FileText, CheckCircle,
  XCircle, Clock, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";

import { useRingkasanSPP } from "@/hooks/use-ringkasan-spp";
import { useSppStore } from "@/stores/spp-store";
import { useLembagaList } from "@/hooks";
import { useAuthStore } from "@/stores";

import { PageHeader } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

import {
  BULAN_OPTIONS, getTahunOptions, formatRupiah,
} from "@/constants/spp-config";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  className?: string;
}

function StatCard({ title, value, icon, sub, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function SppDashboardPage() {
  const router = useRouter();
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

  const { ringkasan, loading } = useRingkasanSPP({
    lembagaId: isAdmin ? (lembagaId || undefined) : (user?.lembaga_id ?? undefined),
    bulan,
    tahun,
  });

  const periodeLabel = `${BULAN_OPTIONS.find((b) => b.value === bulan)?.label} ${tahun}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard SPP"
        description="Ringkasan keuangan SPP"
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/spp/tagihan/generate")}>
            Generate Tagihan
          </Button>
          <Button variant="outline" onClick={() => router.push("/spp/laporan")}>
            Laporan
          </Button>
        </div>
      </PageHeader>

      {/* Filter */}
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
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : ringkasan ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Siswa Aktif"
              value={ringkasan.total_siswa_aktif}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Tagihan Dibuat"
              value={ringkasan.tagihan_bulan_ini}
              icon={<FileText className="h-5 w-5" />}
              sub={periodeLabel}
            />
            <StatCard
              title="Sudah Lunas"
              value={ringkasan.sudah_lunas}
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              className="border-green-100"
            />
            <StatCard
              title="Belum Bayar"
              value={ringkasan.belum_lunas}
              icon={<XCircle className="h-5 w-5 text-destructive" />}
              className="border-red-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Terkumpul
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-700">{formatRupiah(ringkasan.total_terkumpul)}</p>
                <p className="text-xs text-muted-foreground mt-1">{periodeLabel}</p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Total Tunggakan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">{formatRupiah(ringkasan.total_tunggakan)}</p>
                <p className="text-xs text-muted-foreground mt-1">{ringkasan.sebagian_bayar} siswa bayar sebagian</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Progress Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {ringkasan.tagihan_bulan_ini > 0
                    ? Math.round((ringkasan.sudah_lunas / ringkasan.tagihan_bulan_ini) * 100)
                    : 0}%
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${ringkasan.tagihan_bulan_ini > 0
                        ? Math.round((ringkasan.sudah_lunas / ringkasan.tagihan_bulan_ini) * 100)
                        : 0}%`
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {ringkasan.sudah_lunas} dari {ringkasan.tagihan_bulan_ini} tagihan lunas
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Daftar Tagihan", href: "/spp/tagihan", icon: <FileText className="h-5 w-5" /> },
          { label: "Daftar Siswa", href: "/spp/siswa", icon: <Users className="h-5 w-5" /> },
          { label: "Pengeluaran", href: "/spp/pengeluaran", icon: <TrendingDown className="h-5 w-5" /> },
          { label: "Laporan Bulanan", href: "/spp/laporan", icon: <Wallet className="h-5 w-5" /> },
        ].map((item) => (
          <Button
            key={item.href}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => router.push(item.href)}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}