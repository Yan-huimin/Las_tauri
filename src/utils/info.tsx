import useFileStore from "@/store/useFileStore";
import { Activity, Cloud } from "lucide-react";

const Info = () => {
  const path = useFileStore((state) => state.workFile);
  const lasInfo = useFileStore((state) => state.lasInfo);

  // 格式化数字：添加千分位
  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat().format(num);
  };

  // 极致紧凑的条目组件
  const DataRow = ({ 
    label, 
    value, 
    colorClass 
  }: { 
    label: string; 
    value: string | number; 
    colorClass: string 
  }) => (
    <div className="flex flex-col py-1.5 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 leading-none mb-1">
        {label}
      </span>
      <span className={`text-xs font-mono font-bold truncate leading-none ${colorClass}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#2E303D] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* 内容区：减小内边距 p-3 */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        {path ? (
          <div className="flex flex-col gap-3">
            
            {/* 几何边界区块 */}
            <section>
              {/* <div className="flex items-center gap-1.5 mb-2 opacity-50">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Bounds</span>
              </div> */}
              
              <div className="px-1 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.02)]">
                <DataRow 
                  label="Range X" 
                  value={`${lasInfo?.x_min?.toFixed(2)} ↔ ${lasInfo?.x_max?.toFixed(2)}`} 
                  colorClass="text-blue-600 dark:text-blue-400" 
                />
                <DataRow 
                  label="Range Y" 
                  value={`${lasInfo?.y_min?.toFixed(2)} ↔ ${lasInfo?.y_max?.toFixed(2)}`} 
                  colorClass="text-emerald-600 dark:text-emerald-400" 
                />
                <DataRow 
                  label="Range Z" 
                  value={`${lasInfo?.z_min?.toFixed(2)} ↔ ${lasInfo?.z_max?.toFixed(2)}`} 
                  colorClass="text-amber-600 dark:text-amber-400" 
                />
              </div>
            </section>

            {/* 数据统计区块：强化视觉对比 */}
            <section className="pt-2 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-1.5 mb-2 opacity-50">
                <Activity className="w-3 h-3 text-pink-500" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Stats</span>
              </div>
              
              <div className="bg-gray-50/80 dark:bg-black/20 rounded-lg px-3 py-2.5 border border-gray-100 dark:border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none">
                    Total Points
                  </span>
                  <div className="text-lg font-black font-mono leading-none tracking-tighter text-pink-600 dark:text-pink-400 break-all">
                    {formatNumber(lasInfo?.total_count)}
                  </div>
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* 空状态 */
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Cloud className="w-8 h-8 mb-1" />
            <p className="text-[10px] font-black uppercase tracking-widest">No File</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Info;