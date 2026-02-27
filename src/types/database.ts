/**
 * Supabase Database Types
 * Sistem Persuratan - Administrasi PKBM v1.0.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      lembaga: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          alamat: string;
          telepon: string | null;
          email: string | null;
          website: string | null;
          logo_url: string | null;
          ttd_jabatan: string | null;
          ttd_nama: string | null;
          ttd_nip: string | null;
          ttd_image_url: string | null;
          nomor_prefix: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kode: string;
          nama: string;
          alamat: string;
          telepon?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          ttd_jabatan?: string | null;
          ttd_nama?: string | null;
          ttd_nip?: string | null;
          ttd_image_url?: string | null;
          nomor_prefix: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kode?: string;
          nama?: string;
          alamat?: string;
          telepon?: string | null;
          email?: string | null;
          website?: string | null;
          logo_url?: string | null;
          ttd_jabatan?: string | null;
          ttd_nama?: string | null;
          ttd_nip?: string | null;
          ttd_image_url?: string | null;
          nomor_prefix?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      surat_keluar: {
        Row: {
          id: string;
          lembaga_id: string;
          nomor_surat: string;
          tanggal_surat: string;
          perihal: string;
          kepada: string;
          alamat_tujuan: string | null;
          isi_surat: string;
          lampiran: string | null;
          sifat: string;
          snapshot_ttd: Json;
          pdf_url: string | null;
          pdf_generated_at: string | null;
          status: string;
          template_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          approved_by: string | null;
          approved_at: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          nomor_surat: string;
          tanggal_surat?: string;
          perihal: string;
          kepada: string;
          alamat_tujuan?: string | null;
          isi_surat: string;
          lampiran?: string | null;
          sifat?: string;
          snapshot_ttd?: Json;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          status?: string;
          template_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          nomor_surat?: string;
          tanggal_surat?: string;
          perihal?: string;
          kepada?: string;
          alamat_tujuan?: string | null;
          isi_surat?: string;
          lampiran?: string | null;
          sifat?: string;
          snapshot_ttd?: Json;
          pdf_url?: string | null;
          pdf_generated_at?: string | null;
          status?: string;
          template_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "surat_keluar_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      surat_tembusan: {
        Row: {
          id: string;
          surat_id: string;
          nama_penerima: string;
          urutan: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          surat_id: string;
          nama_penerima: string;
          urutan?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          surat_id?: string;
          nama_penerima?: string;
          urutan?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "surat_tembusan_surat_id_fkey";
            columns: ["surat_id"];
            isOneToOne: false;
            referencedRelation: "surat_keluar";
            referencedColumns: ["id"];
          }
        ];
      };

      nomor_surat_counter: {
        Row: {
          id: string;
          lembaga_id: string;
          tahun: number;
          counter: number;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          tahun: number;
          counter?: number;
          last_used_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          tahun?: number;
          counter?: number;
          last_used_at?: string;
        };
        Relationships: [];
      };

      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          lembaga_id: string | null;
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: string;
          lembaga_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          lembaga_id?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      role_permissions: {
        Row: {
          role: string;
          permissions: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          role: string;
          permissions: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: string;
          permissions?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      letter_templates: {
        Row: {
          id: string;
          name: string;
          layout_type: string;
          perihal: string | null;
          isi_surat: string;
          sifat: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          layout_type: string;
          perihal?: string | null;
          isi_surat: string;
          sifat?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          layout_type?: string;
          perihal?: string | null;
          isi_surat?: string;
          sifat?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Relationships: [];
      };

      // ============================================
      // SPP TABLES
      // ============================================

      siswa: {
        Row: {
          id: string;
          lembaga_id: string;
          nis: string;
          nama: string;
          kelas: string | null;
          program: string | null;
          nama_wali: string | null;
          nomor_wa: string | null;
          tanggal_masuk: string | null;
          tanggal_keluar: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          nis: string;
          nama: string;
          kelas?: string | null;
          program?: string | null;
          nama_wali?: string | null;
          nomor_wa?: string | null;
          tanggal_masuk?: string | null;
          tanggal_keluar?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          nis?: string;
          nama?: string;
          kelas?: string | null;
          program?: string | null;
          nama_wali?: string | null;
          nomor_wa?: string | null;
          tanggal_masuk?: string | null;
          tanggal_keluar?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "siswa_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      jenis_tagihan: {
        Row: {
          id: string;
          lembaga_id: string;
          nama: string;
          nominal: number;
          tipe: "bulanan" | "insidental";
          is_active: boolean;
          urutan: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          nama: string;
          nominal: number;
          tipe?: "bulanan" | "insidental";
          is_active?: boolean;
          urutan?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          nama?: string;
          nominal?: number;
          tipe?: "bulanan" | "insidental";
          is_active?: boolean;
          urutan?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jenis_tagihan_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      tagihan: {
        Row: {
          id: string;
          lembaga_id: string;
          siswa_id: string;
          nomor_tagihan: string;
          bulan: number;
          tahun: number;
          total_tagihan: number;
          total_dibayar: number;
          status: "unpaid" | "partial" | "paid" | "void";
          tanggal_jatuh_tempo: string | null;
          tanggal_lunas: string | null;
          catatan: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          siswa_id: string;
          nomor_tagihan: string;
          bulan: number;
          tahun: number;
          total_tagihan: number;
          total_dibayar?: number;
          status?: "unpaid" | "partial" | "paid" | "void";
          tanggal_jatuh_tempo?: string | null;
          tanggal_lunas?: string | null;
          catatan?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          siswa_id?: string;
          nomor_tagihan?: string;
          bulan?: number;
          tahun?: number;
          total_tagihan?: number;
          total_dibayar?: number;
          status?: "unpaid" | "partial" | "paid" | "void";
          tanggal_jatuh_tempo?: string | null;
          tanggal_lunas?: string | null;
          catatan?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tagihan_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tagihan_siswa_id_fkey";
            columns: ["siswa_id"];
            isOneToOne: false;
            referencedRelation: "siswa";
            referencedColumns: ["id"];
          }
        ];
      };

      tagihan_item: {
        Row: {
          id: string;
          tagihan_id: string;
          jenis_tagihan_id: string | null;
          keterangan: string;
          nominal: number;
          bulan_ref: number | null;
          tahun_ref: number | null;
        };
        Insert: {
          id?: string;
          tagihan_id: string;
          jenis_tagihan_id?: string | null;
          keterangan: string;
          nominal: number;
          bulan_ref?: number | null;
          tahun_ref?: number | null;
        };
        Update: {
          id?: string;
          tagihan_id?: string;
          jenis_tagihan_id?: string | null;
          keterangan?: string;
          nominal?: number;
          bulan_ref?: number | null;
          tahun_ref?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tagihan_item_tagihan_id_fkey";
            columns: ["tagihan_id"];
            isOneToOne: false;
            referencedRelation: "tagihan";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tagihan_item_jenis_tagihan_id_fkey";
            columns: ["jenis_tagihan_id"];
            isOneToOne: false;
            referencedRelation: "jenis_tagihan";
            referencedColumns: ["id"];
          }
        ];
      };

      pembayaran: {
        Row: {
          id: string;
          tagihan_id: string;
          nomor_bukti: string;
          jumlah: number;
          metode: "tunai" | "transfer" | "qris";
          tanggal_bayar: string;
          catatan: string | null;
          pdf_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tagihan_id: string;
          nomor_bukti: string;
          jumlah: number;
          metode?: "tunai" | "transfer" | "qris";
          tanggal_bayar?: string;
          catatan?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tagihan_id?: string;
          nomor_bukti?: string;
          jumlah?: number;
          metode?: "tunai" | "transfer" | "qris";
          tanggal_bayar?: string;
          catatan?: string | null;
          pdf_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pembayaran_tagihan_id_fkey";
            columns: ["tagihan_id"];
            isOneToOne: false;
            referencedRelation: "tagihan";
            referencedColumns: ["id"];
          }
        ];
      };

      pengeluaran: {
        Row: {
          id: string;
          lembaga_id: string;
          nomor_ref: string | null;
          kategori: string;
          keterangan: string;
          nominal: number;
          tanggal: string;
          bukti_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          nomor_ref?: string | null;
          kategori: string;
          keterangan: string;
          nominal: number;
          tanggal: string;
          bukti_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          nomor_ref?: string | null;
          kategori?: string;
          keterangan?: string;
          nominal?: number;
          tanggal?: string;
          bukti_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pengeluaran_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };

      spp_counter: {
        Row: {
          id: string;
          lembaga_id: string;
          tipe: "tagihan" | "pembayaran";
          bulan: number;
          tahun: number;
          counter: number;
        };
        Insert: {
          id?: string;
          lembaga_id: string;
          tipe: "tagihan" | "pembayaran";
          bulan: number;
          tahun: number;
          counter?: number;
        };
        Update: {
          id?: string;
          lembaga_id?: string;
          tipe?: "tagihan" | "pembayaran";
          bulan?: number;
          tahun?: number;
          counter?: number;
        };
        Relationships: [
          {
            foreignKeyName: "spp_counter_lembaga_id_fkey";
            columns: ["lembaga_id"];
            isOneToOne: false;
            referencedRelation: "lembaga";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      generate_nomor_surat: {
        Args: { p_lembaga_id: string; p_tanggal?: string };
        Returns: string;
      };
      create_surat_with_snapshot: {
        Args: {
          p_lembaga_id: string;
          p_perihal: string;
          p_kepada: string;
          p_isi_surat: string;
          p_tanggal_surat?: string;
          p_alamat_tujuan?: string;
          p_lampiran?: string;
          p_sifat?: string;
          p_created_by?: string;
        };
        Returns: string;
      };
      search_surat: {
        Args: { p_search_query: string; p_lembaga_id?: string; p_limit?: number };
        Returns: {
          id: string;
          nomor_surat: string;
          tanggal_surat: string;
          perihal: string;
          kepada: string;
          rank: number;
        }[];
      };
      generate_nomor_tagihan: {
        Args: { p_lembaga_id: string; p_bulan: number; p_tahun: number };
        Returns: string;
      };
      generate_nomor_bukti: {
        Args: { p_lembaga_id: string; p_bulan: number; p_tahun: number };
        Returns: string;
      };
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];