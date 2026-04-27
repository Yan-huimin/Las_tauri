import { useMemo } from "react";
import { useLasStore } from "@/store/useLasStore";
import { formatDistance } from "@/utils/coordinates";
import { Ruler, X, Target, MapPin, Zap, BarChart3, PanelRightClose } from "lucide-react";
import useFileStore from "@/store/useFileStore";

interface Props {
    onClose?: () => void;
}

const MeasurementPanel = ({ onClose }: Props) => {
  const measurement = useLasStore((state) => state.measurement);
  const toggleMeasuring = useLasStore((state) => state.toggleMeasuring);
  const clearMeasurement = useLasStore((state) => state.clearMeasurement);
  const currentPoint = useLasStore((state) => state.currentPoint);
  const comparePoint = useLasStore((state) => state.comparePoint);
  const OriginalPoint = useFileStore((state) => state.lasInfo?.total_count);

  const comparisonStats = useMemo(() => {
    if (!OriginalPoint || !comparePoint || !currentPoint) return null;
    const originalPoints = OriginalPoint;
    const processedPoints = comparePoint.positions.length / 3;
    const originalColors = currentPoint.colors.length / 3;
    const processedColors = comparePoint.colors.length / 3;
    const pointReduction = originalPoints > 0 ? ((originalPoints - processedPoints) / originalPoints * 100).toFixed(2) : "0.00";
    return {
      originalPoints,
      processedPoints,
      originalColors,
      processedColors,
      pointReduction
    };
  }, [currentPoint, comparePoint]);

  const isMeasuring = measurement.isMeasuring;
  const points = measurement.points;
  const distance = measurement.distance;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-indigo-500" />
          测量与数据
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMeasuring}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isMeasuring
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-indigo-500 hover:bg-indigo-600 text-white"
            }`}
          >
            {isMeasuring ? "停止" : "测量"}
          </button>
          <button
            onClick={clearMeasurement}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-pointer"
            title="清除测量"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              title="关闭面板"
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* 测量状态指示器 */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-900">
          <div
            className={`w-3 h-3 rounded-full ${
              isMeasuring
                ? "animate-pulse bg-green-500"
                : "bg-slate-400 dark:bg-slate-600"
            }`}
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {isMeasuring
              ? "测量模式已激活 - 点击点云选择测量点"
              : "测量模式已关闭"}
          </span>
        </div>

        {/* 数据对比卡片 */}
        {comparisonStats && (
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                原始数据 vs 处理数据
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-slate-600 dark:text-slate-400">原始点数:</div>
                <div className="font-mono text-right">{comparisonStats.originalPoints.toLocaleString()}</div>
                <div className="text-slate-600 dark:text-slate-400">处理后点数:</div>
                <div className="font-mono text-right">{comparisonStats.processedPoints.toLocaleString()}</div>
                <div className="text-slate-600 dark:text-slate-400">点减少:</div>
                <div className="font-mono text-right">{comparisonStats.pointReduction}%</div>
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                点击降采样或去噪后生成对比数据
              </div>
            </div>
          </div>
        )}

        {/* 点信息 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Target className="w-4 h-4" />
            已选点 ({points.length}/2)
          </div>

          {points.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 italic text-center py-2">
              未选择任何点
            </div>
          ) : (
            <div className="space-y-2">
              {points.map((point, index) => (
                <div
                  key={index}
                  className="p-2 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      点 {index + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className="text-slate-500 dark:text-slate-400">
                      原始坐标:
                    </div>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {point.position[0].toFixed(3)}, {point.position[1].toFixed(3)}, {point.position[2].toFixed(3)}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      显示坐标:
                    </div>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      {point.displayPosition[0].toFixed(3)}, {point.displayPosition[1].toFixed(3)}, {point.displayPosition[2].toFixed(3)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 距离信息 */}
        {distance !== null && points.length === 2 && (
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                测量结果
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatDistance(distance)}
            </div>
            <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
              三维欧几里得距离
            </div>
            <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-1">
              <div>点1 → 点2:</div>
              <div className="font-mono">
                {distance.toFixed(3)} 单位
              </div>
              <div>水平距离:</div>
              <div className="font-mono">
                {Math.sqrt(
                  Math.pow(points[1].position[0] - points[0].position[0], 2) +
                  Math.pow(points[1].position[1] - points[0].position[1], 2)
                ).toFixed(3)} 单位
              </div>
              <div>高程差:</div>
              <div className="font-mono">
                {Math.abs(points[1].position[2] - points[0].position[2]).toFixed(3)} 单位
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex items-center gap-1">
              <span className="font-medium">使用说明:</span>
            </div>
            <div>1. 点击"开始测量"进入测量模式</div>
            <div>2. 在点云上点击选择第一个点</div>
            <div>3. 再次点击选择第二个点</div>
            <div>4. 系统自动计算两点间距离</div>
            <div>5. 点击"清除测量"重置所有点</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementPanel;