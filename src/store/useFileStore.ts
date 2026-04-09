import { create } from 'zustand';

interface FileState {
  workFile: string;
  historyFiles: string[];
  
  // Actions
  setWorkFile: (path: string) => void;
  addHistoryFiles: (newFiles: string) => void;
  resetWorkFile: () => void;
  resetHistoryFiles: () => void;
  resetAll: () => void;

  getWorkFile: () => String;
  getHistoryFile: () => String[];
}

const useFileStore = create<FileState>((set, get) => ({
  workFile: '',
  historyFiles: [],

  setWorkFile: (path: string) => set({ workFile: path }),

  // 更新历史文件（追加数组）
  addHistoryFiles: (newFiles: string) =>
    set((state) => ({
      historyFiles: [...state.historyFiles, newFiles],
    })),

  // 重置工作文件
  resetWorkFile: () => set({ workFile: '' }),

  // 重置历史文件
  resetHistoryFiles: () => set({ historyFiles: [] }),

  // 全部重置
  resetAll: () => set({ workFile: '', historyFiles: [] }),

  getWorkFile: () => get().workFile,
  getHistoryFile: () => get().historyFiles,
}));

export default useFileStore;