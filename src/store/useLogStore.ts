import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { type LogItem } from "@/types/log";

interface LogStore {
  logs: LogItem[];

  levelFilter: string[];
  keyword: string;

  fetchLogs: () => Promise<void>;
  clearLogs: () => Promise<void>;

  setLevelFilter: (levels: string[]) => void;
  setKeyword: (keyword: string) => void;
}

export const useLogStore = create<LogStore>((set) => ({
  logs: [],

  levelFilter: ["info", "warn", "error", "debug"],
  keyword: "",

  fetchLogs: async () => {
    const logs = await invoke<LogItem[]>("get_logs");
    set({ logs });
  },

  clearLogs: async () => {
    await invoke("clear_logs");
    set({ logs: [] });
  },

  setLevelFilter: (levels: string[]) => set({ levelFilter: levels }),
  setKeyword: (kw) => set({ keyword: kw }),
}));