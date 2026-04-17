import { useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Upload, Box } from 'lucide-react';
import { useLasStore } from "@/store/useLasStore";
import { useHome } from '@/hooks/home/useHome';

const SpatialDashboard = () => {
  const lasPoints = useLasStore((state) => state.currentPoint);
  const { calculateHistogramWithOffset } = useHome();

  const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r = 0, g = 0, b = 0;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [
      Math.floor((r + m) * 255),
      Math.floor((g + m) * 255),
      Math.floor((b + m) * 255),
    ];
  };

  const getStepColor = (fraction: number) => {
    const t = Math.max(0, Math.min(1, fraction));
    const hue = 240 * (1 - t);
    const [r, g, b] = hsvToRgb(hue, 1, 1);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const zData = useMemo(() => {
    if (!lasPoints) return [];
    return calculateHistogramWithOffset(
      lasPoints.positions,
      2,
      lasPoints.offset,
      40
    );
  }, [lasPoints]);

  if (!lasPoints) {
    return <>
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 transition-all hover:border-blue-400 dark:hover:border-blue-600">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl"></div>
          <Box className="w-20 h-20 text-slate-400 dark:text-slate-600 relative z-10" strokeWidth={1.5} />
          <Upload className="w-8 h-8 text-blue-500 absolute -bottom-1 -right-1 z-20 bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">暂无点云数据</h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 mb-6">请导入 LAS 文件以开始处理</p>
      </div>
    </>;
  }

  return (
    <div className="grid grid-cols-1 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {/* <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            高程分布
          </h3>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
            Z-Axis
          </span>
        </div> */}

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
                        <p className="text-xs text-slate-500">
                          海拔高度:
                          <span className="text-slate-900 dark:text-white font-mono">
                            {payload[0].payload.realValue} m
                          </span>
                        </p>
                        <p className="text-xs text-slate-500">
                          点数量:
                          <span className="text-blue-500 font-mono">
                            {payload[0].value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="count">
                {zData.map((_entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getStepColor(index / (zData.length - 1))}
                    fillOpacity={0.6 + (index / (zData.length - 1)) * 0.4}
                  />
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