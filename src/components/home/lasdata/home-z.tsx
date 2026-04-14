import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLasStore } from "@/store/useLasStore";
import { useHome } from '@/hooks/home/useHome';

const SpatialDashboard = () => {
  const lasPoints = useLasStore((state) => state.lasPoints);
  const { calculateHistogramWithOffset } = useHome();

  const getStepColor = (fraction: number) => {
    // 起点 (深绿): rgb(34, 95, 6)
    // 终点 (鲜绿): rgb(174, 18, 18)
    const r = Math.floor(6 + (74 - 6) * fraction);
    const g = Math.floor(95 + (222 - 95) * fraction);
    const b = Math.floor(70 + (128 - 70) * fraction);
    return `rgb(${r}, ${g}, ${b})`;
    };

  const zData = useMemo(() => {
    if (!lasPoints) return [];
    return calculateHistogramWithOffset(lasPoints.positions, 2, lasPoints.offset, 40);
  }, [lasPoints]);

  if (!lasPoints) return <div className="p-20 text-center opacity-50">请先载入 LAS 文件...</div>;

  return (
    <div className="grid grid-cols-1 animate-in fade-in duration-500">

      {/* Z轴分布图（主图） */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">高程分布</h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">Z-Axis</span>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zData}>
              <XAxis 
                dataKey="realValue" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#888' }}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 shadow-xl rounded-lg">
                        <p className="text-xs text-slate-500">海拔高度: <span className="text-slate-900 dark:text-white font-mono">{payload[0].payload.realValue} m</span></p>
                        <p className="text-xs text-slate-500">点数量: <span className="text-blue-500 font-mono">{payload[0].value}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count">
                {zData.map((_entry: any, index: number) => (
                  // 给柱子加个渐变色，海拔越高颜色越深/浅，看起来更专业
                  <Cell key={`cell-${index}`} fill={getStepColor(index / zData.length)} fillOpacity={0.6 + (index / zData.length) * 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpatialDashboard;