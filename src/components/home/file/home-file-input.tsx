import useFileStore from "@/store/useFileStore";
import { invoke } from "@tauri-apps/api/core";

const HomeFileInput = () => {
  const setWorkFile = useFileStore((state) => state.setWorkFile);
  const addHistoryFiles = useFileStore((state) => state.addHistoryFiles);
  const path = useFileStore((state) => state.workFile);

  const handlePickFile = async () => {
    try {
      const cur: string = await invoke("pick_file_path");
      if (cur) {
        setWorkFile(cur);
        addHistoryFiles(cur);
      }
    } catch (err) {
      console.error("load file error:", err);
      // sendErrorLog("load file error");
    }
  };

  return (
    <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm max-w-2xl transition-colors duration-300">
      {/* 选择按钮 */}
      <button
        onClick={handlePickFile}
        className="flex-none px-4 py-2 bg-indigo-600 dark:bg-indigo-500 
                   hover:bg-indigo-700 dark:hover:bg-indigo-600 
                   active:scale-95 text-white
                   text-sm font-semibold rounded-lg transition-all
                   duration-200 shadow-md shadow-indigo-100 dark:shadow-none
                   cursor-pointer whitespace-nowrap"
      >
        选择文件
      </button>

      {/* 路径显示区域 */}
      <div className="flex-1 flex items-center min-w-0 h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg transition-colors">
        {path ? (
          <span className="text-sm text-slate-600 dark:text-slate-300 truncate font-mono">
            {path}
          </span>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500 italic select-none">
            尚未选择任何文件...
          </span>
        )}
      </div>

      {/* 状态指示 */}
      <div className="px-2">
        <div className={`w-2 h-2 rounded-full ${path ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300 dark:bg-slate-700'}`} />
      </div>
    </div>
  );
};

export default HomeFileInput;