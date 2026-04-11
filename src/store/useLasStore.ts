import { create } from "zustand";
import type { PointCloudData } from "@/types/las.types";

interface LasStore {
    lasPoints: PointCloudData | null;

    setLasPoints: (data: PointCloudData) => void;
    cleanLasPoints: () => void;
};

export const useLasStore = create<LasStore>((set) => ({

    lasPoints: null,

    setLasPoints: (data: PointCloudData) => {
        set({ lasPoints: data });
    },

    cleanLasPoints: () => {
        set({ lasPoints: null });
    },
}))