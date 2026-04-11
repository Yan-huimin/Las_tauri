import type { LasInfo } from '@/types/las.types';
import { invoke } from '@tauri-apps/api/core';
import { create } from 'zustand';

interface FileState {
  workFile: string;
  historyFiles: string[];
  lasInfo: LasInfo | null;
  
  // Actions
  setWorkFile: (path: string) => void;
  addHistoryFiles: (newFiles: string) => void;
  resetWorkFile: () => void;
  resetHistoryFiles: () => void;
  resetAll: () => void;

  getWorkFile: () => String;
  getHistoryFile: () => String[];

  getFileInfo: () => void;
}

const useFileStore = create<FileState>((set, get) => ({
  workFile: '',
  historyFiles: [],
  lasInfo: null,

  setWorkFile: (path: string) => set({ workFile: path }),

  // 更新历史文件（追加数组）
  addHistoryFiles: (newFiles: string) =>
    set((state) => ({
      historyFiles: [...new Set([...state.historyFiles, newFiles])],
    })),

  // 重置工作文件
  resetWorkFile: () => set({ workFile: '' }),

  // 重置历史文件
  resetHistoryFiles: () => set({ historyFiles: [] }),

  // 全部重置
  resetAll: () => set({ workFile: '', historyFiles: [] }),

  getWorkFile: () => get().workFile,
  getHistoryFile: () => get().historyFiles,

  getFileInfo: async () => {
      const path = get().workFile;
      
      if (!path) return;

      try {
          const data = await invoke<LasInfo>("load_las_info", { path });
          console.log("LAS Info:", data);
          set({lasInfo: data});
      } catch (error) {
          console.error("Failed to load LAS info:", error);
      }
  }
}));

export default useFileStore;