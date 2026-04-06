import React from "react";

interface GridItemData {
  id: string;
  w: 1 | 2 | 3 | 4; // 宽度占比（相对于 4 格总宽）
  h: 1 | 2 | 3 | 4; // 高度占比
  component: React.ReactNode;
}

interface ContainerProps {
  items: GridItemData[];
  maxColumns?: number; // 容器总列数，默认 4
  rowHeight?: number;  // 每一行基础高度，比如 100px
  gap?: number;
}

const Container: React.FC<ContainerProps> = ({
  items,
  maxColumns = 4,
  rowHeight = 150,
  gap = 16,
}) => {
  return (
    <div
      className="grid w-full h-full overflow-auto"
      style={{
        gridTemplateColumns: `repeat(${maxColumns}, 1fr)`,
        gridAutoRows: `${rowHeight}px`,
        gridAutoFlow: "row dense",
        gap: `${gap}px`,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="
            bg-[#F8F8F8] dark:bg-[#282A36] 
            rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700
            overflow-hidden
          "
          style={{
            // 设置跨度：span 1, span 2 等
            gridColumn: `span ${item.w}`,
            gridRow: `span ${item.h}`,
          }}
        >
          <div className="w-full h-full">
            {item.component}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Container;