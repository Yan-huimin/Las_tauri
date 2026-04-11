import { useHome } from "@/hooks/home/useHome";
import { CloudSync, FileText } from "lucide-react";


const HomeHistoryFile = () => {

  const {history, setWorkFile} = useHome();

  return (
<>
      {/* 列表容器 */}
      <div className="space-y-2 h-auto custom-scrollbar pr-2">
        {history && history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm 
                         border border-slate-200 dark:border-gray-700 rounded-xl
                         hover:border-gray-400 dark:hover:border-gray-500 
                         hover:shadow-md transition-all duration-200"
            >

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {item.split(/[\\/]/).pop()} {/* 仅显示文件名 */}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-mono">
                  {item}
                </p>
              </div>

              {/* 装饰按钮 - 仅悬停可见 */}
              <button className="opacity-0 group-hover:opacity-100 p-2 text-blue-400 hover:text-blue-500 transition-all cursor-pointer">
                <CloudSync className="w-4 h-4" onClick={() => {
                  setWorkFile(item)
                }} />
              </button>
            </div>
          ))
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-slate-300 dark:text-slate-700 mb-2 font-light select-none">暂无加载历史</div>
          </div>
        )}
      </div>
</>
  );
};

export default HomeHistoryFile;