import { create } from "zustand";
import { getCurrentBulan, getCurrentTahun } from "@/constants/spp-config";

interface SppState {
  bulan:        number;
  tahun:        number;
  lembagaId:    string;
  setBulan:     (bulan: number) => void;
  setTahun:     (tahun: number) => void;
  setLembagaId: (id: string) => void;
  reset:        () => void;
}

export const useSppStore = create<SppState>((set) => ({
  bulan:        getCurrentBulan(),
  tahun:        getCurrentTahun(),
  lembagaId:    "",
  setBulan:     (bulan)     => set({ bulan }),
  setTahun:     (tahun)     => set({ tahun }),
  setLembagaId: (lembagaId) => set({ lembagaId }),
  reset:        ()          => set({ bulan: getCurrentBulan(), tahun: getCurrentTahun(), lembagaId: "" }),
}));
