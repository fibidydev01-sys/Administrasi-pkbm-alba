"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

import { useGenerateTagihanPreview } from "@/hooks/use-tagihan";
import { useLembagaList } from "@/hooks";
import { useAuthStore } from "@/stores";

import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";

import {
  BULAN_OPTIONS, getTahunOptions,
  formatRupiah, getCurrentBulan, getCurrentTahun,
} from "@/constants/spp-config";

export default function GenerateTagihanPage() {
  const router = useRouter();
  const { lembagas } = useLembagaList();
  const user = useAuthStore((s) => s.user);

  const [lembagaId, setLembagaId]           = useState(user?.lembaga_id ?? "");
  const [bulan, setBulan]                   = useState(getCurrentBulan());
  const [tahun, setTahun]                   = useState(getCurrentTahun());
  const [jatuhTempo, setJatuhTempo]         = useState("");
  const [isConfirming, setIsConfirming]     = useState(false);

  const { preview, loading, error, fetchPreview, confirmGenerate } = useGenerateTagihanPreview();

  const tahunOptions  = getTahunOptions(2);
  const hasPreview    = preview.length > 0;
  const toBuat        = preview.filter((p) => !p.sudah_ada);
  const sudahAda      = preview.filter((p) => p.sudah_ada);

  async function handlePreview() {
    if (!lembagaId) { toast.error("Pilih lembaga terlebih dahulu"); return; }
    await fetchPreview({ lembaga_id: lembagaId, bulan, tahun });
  }

  async function handleConfirm() {
    if (toBuat.length === 0) { toast.error("Tidak ada tagihan baru yang perlu dibuat"); return; }
    try {
      setIsConfirming(true);
      const result = await confirmGenerate({
        lembaga_id: lembagaId,
        bulan,
        tahun,
        tanggal_jatuh_tempo: jatuhTempo || undefined,
      });
      toast.success(`${result.generated} tagihan berhasil dibuat`);
      router.push("/spp/tagihan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal generate tagihan");
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Tagihan"
        description="Buat tagihan SPP massal untuk semua siswa aktif"
        backHref="/spp/tagihan"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parameter Generate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Lembaga *</Label>
              <Select value={lembagaId} onValueChange={setLembagaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lembaga" />
                </SelectTrigger>
                <SelectContent>
                  {lembagas.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bulan *</Label>
              <Select value={String(bulan)} onValueChange={(v) => setBulan(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BULAN_OPTIONS.map((b) => (
                    <SelectItem key={b.value} value={String(b.value)}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tahun *</Label>
              <Select value={String(tahun)} onValueChange={(v) => setTahun(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tahunOptions.map((t) => (
                    <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jatuh Tempo</Label>
              <Input
                type="date"
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handlePreview} disabled={loading || !lembagaId} variant="outline">
              {loading
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <RefreshCw className="mr-2 h-4 w-4" />
              }
              Preview
            </Button>

            {hasPreview && toBuat.length > 0 && (
              <Button onClick={handleConfirm} disabled={isConfirming}>
                {isConfirming
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <CheckCircle className="mr-2 h-4 w-4" />
                }
                Buat {toBuat.length} Tagihan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasPreview && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Hasil Preview
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="default">{toBuat.length} akan dibuat</Badge>
                {sudahAda.length > 0 && (
                  <Badge variant="secondary">{sudahAda.length} sudah ada</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {sudahAda.length > 0 && (
              <Alert className="m-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {sudahAda.length} siswa sudah memiliki tagihan bulan ini dan akan dilewati.
                </AlertDescription>
              </Alert>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Rincian</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((item) => (
                  <TableRow key={item.siswa.id} className={item.sudah_ada ? "opacity-50" : ""}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.siswa.nama}</p>
                        <p className="text-xs text-muted-foreground">{item.siswa.nis}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.siswa.kelas ?? "-"}</TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {item.items.map((i, idx) => (
                          <div key={idx} className="flex gap-2 text-xs">
                            <span className="text-muted-foreground">{i.keterangan}</span>
                            <span className="font-mono">{formatRupiah(i.nominal)}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatRupiah(item.total_tagihan)}
                    </TableCell>
                    <TableCell>
                      {item.sudah_ada ? (
                        <Badge variant="secondary">Sudah Ada</Badge>
                      ) : item.has_tunggakan ? (
                        <Badge variant="destructive">Ada Tunggakan</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {toBuat.length > 0 && (
              <>
                <Separator />
                <div className="flex justify-between items-center p-4">
                  <span className="text-sm text-muted-foreground">
                    Total tagihan yang akan dibuat
                  </span>
                  <span className="font-mono font-bold text-lg">
                    {formatRupiah(toBuat.reduce((s, i) => s + i.total_tagihan, 0))}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
