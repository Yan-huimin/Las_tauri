import { useState } from "react";
import { useLasStore } from "@/store/useLasStore";

export const VoxelInput = ({ onApply }: { onApply: (v: number) => void }) => {
  const voxelSize = useLasStore((s) => s.voxelSlider);
  const setVoxelSize = useLasStore((s) => s.setVoxelSlider);

  const [tempValue, setTempValue] = useState(voxelSize);

  const handleApply = () => {
    const v = Number(tempValue);

    if (Number.isNaN(v)) return;

    setVoxelSize(v);   // 更新全局状态
    onApply(v);        // 触发 Rust voxel
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0.1}
        max={5}
        step={0.1}
        value={tempValue}
        onChange={(e) => setTempValue(Number(e.target.value))}
        className="p-2 border rounded-md w-24"
      />

      <button
        onClick={handleApply}
        className="px-3 py-1 bg-blue-500 text-white rounded-md"
      >
        确认
      </button>

      <span className="text-yellow-500">
        {voxelSize.toFixed(2)}
      </span>
    </div>
  );
};