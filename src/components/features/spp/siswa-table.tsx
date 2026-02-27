"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, UserX, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Siswa } from "@/types/spp";

interface SiswaTableProps {
  data: Siswa[];
  onEdit?: (siswa: Siswa) => void;
  onToggleAktif?: (siswa: Siswa) => void;
  onRowClick?: (siswa: Siswa) => void;
}

export function SiswaTable({
  data,
  onEdit,
  onToggleAktif,
  onRowClick,
}: SiswaTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NIS</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Kelas</TableHead>
          <TableHead>Wali</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((siswa) => (
          <TableRow
            key={siswa.id}
            className={onRowClick ? "cursor-pointer" : ""}
            onClick={() => onRowClick?.(siswa)}
          >
            <TableCell className="font-mono text-sm">{siswa.nis}</TableCell>
            <TableCell className="font-medium">{siswa.nama}</TableCell>
            <TableCell>{siswa.program ?? "-"}</TableCell>
            <TableCell>{siswa.kelas ?? "-"}</TableCell>
            <TableCell>{siswa.nama_wali ?? "-"}</TableCell>
            <TableCell>
              <Badge variant={siswa.is_active ? "default" : "outline"}>
                {siswa.is_active ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(siswa)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleAktif && (
                    <DropdownMenuItem onClick={() => onToggleAktif(siswa)}>
                      {siswa.is_active ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Aktifkan
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              Belum ada data siswa
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
