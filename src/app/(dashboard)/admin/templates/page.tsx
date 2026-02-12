"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Eye, Pencil, Trash2, FileText } from "lucide-react";

import { useTemplateList, useTemplate } from "@/hooks/use-template";
import { LAYOUT_CONFIG } from "@/types/template";
import type { LayoutType } from "@/types/template";

import { PageHeader, EmptyState, DeleteConfirmDialog } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

export default function TemplatesPage() {
  const router = useRouter();
  const [filterLayout, setFilterLayout] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { templates, loading, refresh } = useTemplateList(filterLayout);
  const { deleteTemplate } = useTemplate();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTemplate(deleteId);
      toast.success("Template berhasil dihapus");
      setDeleteId(null);
      refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus template";
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Template Surat"
        description="Template surat dengan 3 layout fixed (Keterangan, Undangan, Umum)"
      >
        <Link href="/admin/templates/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Template Baru
          </Button>
        </Link>
      </PageHeader>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Select
            value={filterLayout ?? "all"}
            onValueChange={(val) => setFilterLayout(val === "all" ? undefined : val)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Semua Layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Layout</SelectItem>
              <SelectItem value="keterangan">Keterangan</SelectItem>
              <SelectItem value="undangan">Undangan</SelectItem>
              <SelectItem value="umum">Umum</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Belum ada template"
          description="Buat template pertama untuk mempercepat pembuatan surat"
          action={{
            label: "Buat Template Pertama",
            onClick: () => router.push("/admin/templates/create"),
          }}
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Template</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Perihal Default</TableHead>
                <TableHead>Sifat</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {LAYOUT_CONFIG[template.layout_type as LayoutType].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {template.perihal || "-"}
                  </TableCell>
                  <TableCell>{template.sifat}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/templates/${template.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Template"
        description="Template yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus?"
      />
    </div>
  );
}