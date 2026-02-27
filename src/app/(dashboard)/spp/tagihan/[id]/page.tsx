"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ArrowLeft, FileText, Receipt } from "lucide-react";

import { useTagihan } from "@/hooks/use-tagihan";
import { useLembaga } from "@/hooks";
import { useAuthStore } from "@/stores";

import { PageHeader, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import { TagihanStatusBadge } from "@/components/features/spp/tagihan-status-badge";
import { PembayaranForm } from "@/components/features/spp/forms/pembayaran-form";
import { BULAN_OPTIONS, formatRupiah } from "@/constants/spp-config";
import { formatTanggalPendek } from "@/lib/date";
import type { PembayaranInsert, TagihanItem, Pembayaran } from "@/types/spp";

// ✅ Dynamic import PDF buttons — cegah "su is not a function"
const TagihanPdfButton = dynamic(
  () => import("@/components/features/spp/tagihan-pdf-button").then((m) => m.TagihanPdfButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <FileText className="h-4 w-4 mr-2" />
        Download Tagihan
      </Button>
    ),
  }
);

const KwitansiPdfButton = dynamic(
  () => import("@/components/features/spp/kwitansi-pdf-button").then((m) => m.KwitansiPdfButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" disabled>
        <Receipt className="h-4 w-4 mr-2" />
        Download Kwitansi
      </Button>
    ),
  }
);

export default function TagihanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { tagihan, loading, refresh } = useTagihan(id);
  const { lembaga } = useLembaga(tagihan?.lembaga_id);
  const [formOpen, setFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const periodeLabel = tagihan
    ? `${BULAN_OPTIONS.find((b) => b.value === tagihan.bulan)?.label} ${tagihan.tahun}`
    : "";

  const tagihanFileName = tagihan
    ? `Tagihan-${tagihan.nomor_tagihan.replace(/\//g, "-")}.pdf`
    : "tagihan.pdf";

  async function handlePembayaran(data: PembayaranInsert) {
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/spp/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, created_by: user?.id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal menyimpan");
      }
      toast.success("Pembayaran berhasil dicatat");
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan pembayaran");
    } finally {
      setIsSubmitting(false);
      setFormOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!tagihan) {
    return (
      <EmptyState
        title="Tagihan tidak ditemukan"
        description="Tagihan mungkin sudah dihapus atau ID tidak valid"
        action={{ label: "Kembali", onClick: () => router.push("/spp/tagihan") }}
      />
    );
  }

  const sisaTagihan = tagihan.total_tagihan - tagihan.total_dibayar;
  const bisaBayar = tagihan.status !== "paid" && tagihan.status !== "void";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tagihan ${periodeLabel}`}
        description={tagihan.nomor_tagihan}
        backHref="/spp/tagihan"
      >
        <div className="flex gap-2 flex-wrap">
          {/* ✅ PDF Tagihan */}
          {lembaga && (
            <TagihanPdfButton
              tagihan={tagihan}
              lembagaNama={lembaga.nama}
              lembagaAlamat={lembaga.alamat}
              ttdNama={lembaga.ttd_nama ?? ""}
              ttdJabatan={lembaga.ttd_jabatan ?? ""}
              fileName={tagihanFileName}
            />
          )}

          {/* ✅ Input Pembayaran */}
          {bisaBayar && (
            <Button onClick={() => setFormOpen(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              Input Pembayaran
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Siswa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{tagihan.siswa?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NIS</span>
              <span className="font-mono">{tagihan.siswa?.nis}</span>
            </div>
            {tagihan.siswa?.kelas && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kelas</span>
                <span>{tagihan.siswa.kelas}</span>
              </div>
            )}
            {tagihan.siswa?.nama_wali && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wali</span>
                <span>{tagihan.siswa.nama_wali}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Tagihan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Tagihan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Periode</span>
              <span>{periodeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <TagihanStatusBadge status={tagihan.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan</span>
              <span className="font-mono font-medium">{formatRupiah(tagihan.total_tagihan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sudah Dibayar</span>
              <span className="font-mono text-green-700">{formatRupiah(tagihan.total_dibayar)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Sisa Tagihan</span>
              <span className={`font-mono ${sisaTagihan > 0 ? "text-destructive" : "text-green-700"}`}>
                {formatRupiah(sisaTagihan)}
              </span>
            </div>
            {tagihan.tanggal_jatuh_tempo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jatuh Tempo</span>
                <span>{formatTanggalPendek(tagihan.tanggal_jatuh_tempo)}</span>
              </div>
            )}
            {tagihan.tanggal_lunas && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Lunas</span>
                <span className="text-green-700">{formatTanggalPendek(tagihan.tanggal_lunas)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rincian Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rincian Tagihan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keterangan</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagihan.items?.map((item: TagihanItem) => (
                <TableRow key={item.id}>
                  <TableCell>{item.keterangan}</TableCell>
                  <TableCell className="text-right font-mono">{formatRupiah(item.nominal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator />
          <div className="flex justify-between items-center p-4 font-medium text-sm">
            <span>Total</span>
            <span className="font-mono">{formatRupiah(tagihan.total_tagihan)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat Pembayaran */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Riwayat Pembayaran</CardTitle>
          {bisaBayar && (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Receipt className="h-4 w-4 mr-2" />
              Input Pembayaran
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {!tagihan.pembayaran || tagihan.pembayaran.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Belum ada pembayaran
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Bukti</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="w-[120px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tagihan.pembayaran.map((p: Pembayaran) => {
                    const kwitansiFileName = `Kwitansi-${p.nomor_bukti.replace(/\//g, "-")}.pdf`;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.nomor_bukti}</TableCell>
                        <TableCell className="text-sm">{formatTanggalPendek(p.tanggal_bayar)}</TableCell>
                        <TableCell className="capitalize text-sm">{p.metode}</TableCell>
                        <TableCell className="text-right font-mono text-green-700">
                          {formatRupiah(p.jumlah)}
                        </TableCell>
                        <TableCell>
                          {/* ✅ Kwitansi PDF per pembayaran */}
                          {lembaga && (
                            <KwitansiPdfButton
                              pembayaran={p}
                              tagihan={tagihan}
                              lembagaNama={lembaga.nama}
                              lembagaAlamat={lembaga.alamat}
                              ttdNama={lembaga.ttd_nama ?? ""}
                              ttdJabatan={lembaga.ttd_jabatan ?? ""}
                              fileName={kwitansiFileName}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form Pembayaran */}
      <PembayaranForm
        open={formOpen}
        onOpenChange={setFormOpen}
        tagihanId={tagihan.id}
        siswaName={tagihan.siswa?.nama ?? ""}
        sisaTagihan={sisaTagihan}
        onSubmit={handlePembayaran}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}