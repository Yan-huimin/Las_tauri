import { create } from "zustand";
import type { PointCloudData } from "@/types/las.types";

interface LasStore {
    lasPoints: PointCloudData | null;
    voxelSlider: number;

    setLasPoints: (data: PointCloudData) => void;
    cleanLasPoints: () => void;

    setVoxelSlider: (x: number) => void;
    resetVoxelSlider: () => void;
};

export const useLasStore = create<LasStore>((set) => ({

    lasPoints: null,
    voxelSlider: 1.0,

    setLasPoints: (data: PointCloudData) => {
        set({ lasPoints: data });
    },

    cleanLasPoints: () => {
        set({ lasPoints: null });
    },

    setVoxelSlider: (x: number) => {
        set({ voxelSlider: x });
    },

    resetVoxelSlider: () => {
        set({ voxelSlider: 1.0 });
    }
}))