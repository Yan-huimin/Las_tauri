import { create } from 'zustand';

interface NavState {
  currentId: string;
  visitedIds: string[];
  setPage: (id: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentId: 'home',
  visitedIds: ['home'], // 只有访问过的页面才会被实例化
  setPage: (id) => set((state) => ({
    currentId: id,
    visitedIds: state.visitedIds.includes(id) ? state.visitedIds : [...state.visitedIds, id]
  })),
}));