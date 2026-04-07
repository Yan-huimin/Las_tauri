interface GridItemData {
  id: string;
  w: 1 | 2 | 3 | 4; // 宽度占比（相对于 4 格总宽）
  h: 1 | 2 | 3 | 4; // 高度占比
  component: React.ReactNode;
}

export interface ContainerProps {
  items: GridItemData[];
  maxColumns?: number; // 容器总列数，默认 4
  rowHeight?: number;  // 每一行基础高度
  gap?: number;
}