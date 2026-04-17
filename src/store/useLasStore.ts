import { create } from "zustand";
import type { PointCloudData, MeasurementPoint } from "@/types/las.types";

interface LasStore {
    currentPoint: PointCloudData | null;
    comparePoint: PointCloudData | null;
    measurement: {
        isMeasuring: boolean;
        points: MeasurementPoint[];
        distance: number | null;
    };

    setCurrentLasPoints: (data: PointCloudData) => void;
    setCompareLasPoints: (data: PointCloudData) => void;
    cleanCurrentLasPoints: () => void;
    cleanCompareLasPoints: () => void;

    // 测量相关操作
    toggleMeasuring: () => void;
    addMeasurementPoint: (point: MeasurementPoint) => void;
    clearMeasurement: () => void;
    updateMeasurementDistance: (distance: number | null) => void;
};

export const useLasStore = create<LasStore>((set, get) => ({
    currentPoint: null,
    comparePoint: null,
    measurement: {
        isMeasuring: false,
        points: [],
        distance: null
    },

    setCurrentLasPoints: (data: PointCloudData) => {
        set({ currentPoint: data });
    },

    setCompareLasPoints: (data: PointCloudData) => {
        set({ comparePoint: data });
    },

    cleanCurrentLasPoints: () => {
        set({ currentPoint: null });
    },

    cleanCompareLasPoints: () => {
        set({ comparePoint: null });
    },

    // 测量相关操作
    toggleMeasuring: () => {
        set((state) => ({
            measurement: {
                ...state.measurement,
                isMeasuring: !state.measurement.isMeasuring,
                // 切换测量模式时不清除已选中的点
            }
        }));
    },

    addMeasurementPoint: (point: MeasurementPoint) => {
        set((state) => {
            const newPoints = [...state.measurement.points, point];

            // 最多保留2个点
            const limitedPoints = newPoints.slice(-2);

            return {
                measurement: {
                    ...state.measurement,
                    points: limitedPoints,
                }
            };
        });
    },

    clearMeasurement: () => {
        set((state) => ({
            measurement: {
                ...state.measurement,
                points: [],
                distance: null
            }
        }));
    },

    updateMeasurementDistance: (distance: number | null) => {
        set((state) => ({
            measurement: {
                ...state.measurement,
                distance
            }
        }));
    },

}))