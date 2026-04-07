import React from "react";
import type { ContainerProps } from "@/types/container.types";

const Container: React.FC<ContainerProps> = ({
  items,
  maxColumns = 4,
  rowHeight = 150,
  gap = 16,
}) => {
  return (
    <div
      className="grid w-full h-full overflow-auto
                 p-2 custom-scrollbar"
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
            overflow-y-auto
          "
          style={{
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