import React from "react";
import Masonry from "react-masonry-css";
import "@/css/Waterfall.css";

interface GridItem {
  id: string;
  component: React.ReactNode;
  // 在瀑布流中，通常不需要 colSpan，因为宽度由列数自动决定
}

interface MasonryGridProps {
  items: GridItem[];
  // 配置不同断点下的列数
  columns?: {
    default: number;
    1100: number;
    700: number;
    500: number;
  };
  gap?: number;
}

const GridContainer: React.FC<MasonryGridProps> = ({
  items,
  columns = {
    default: 3,
    1100: 2,
    700: 2,
    500: 1,
  },
  gap = 16,
}) => {
  return (
    <div className="masonry-container select-none">
      <Masonry
        breakpointCols={columns}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="masonry-item-wrapper"
            style={{ marginBottom: gap }}
          >
            <div className="
              bg-[#F8F8F8]
              dark:bg-[#282A36] 
              rounded-2xl 
              shadow-md 
              overflow-hidden 
              border 
              border-zinc-200 
              dark:border-zinc-700
              hover:shadow-xl
              transition-shadow
            ">
              {item.component}
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default GridContainer;