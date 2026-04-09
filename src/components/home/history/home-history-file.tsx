import useFileStore from "@/store/useFileStore";
import { Clock, FileText } from "lucide-react"; // 建议安装 lucide-react 图标库

const HomeHistoryFile = () => {
  // 修复：解构获取 history 和 reset 方法
  const history = useFileStore((state) => state.historyFiles);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 transition-colors duration-300">

      {/* 列表容器 */}
      <div className="space-y-2 overflow-y-hidden max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {history && history.length > 0 ? (
          history.map((item, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm 
                         border border-slate-200 dark:border-slate-700 rounded-xl
                         hover:border-indigo-400 dark:hover:border-indigo-500 
                         hover:shadow-md transition-all duration-200"
            >
              {/* 文件图标 */}
              <div className="flex-none w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>

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
              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-500 transition-all">
                <Clock className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-slate-300 dark:text-slate-700 mb-2 font-light select-none">暂无加载历史</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeHistoryFile;