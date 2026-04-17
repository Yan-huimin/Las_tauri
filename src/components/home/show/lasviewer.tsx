import { useLasViewer } from "@/hooks/viewer/useLasViewer";
import type { PointCloudData } from '@/types/las.types';
import { useEffect } from "react";

interface PureLasViewerProps {
  data: PointCloudData | null;
  target?: 'current' | 'compare',
  instanceId?: string;
}

export const LasViewer: React.FC<PureLasViewerProps> = ({
  data,
  target,
  //@ts-ignore
  instanceId
}) => {
  const { containerRef, displayPointCloudData, handleStopAndClear } = useLasViewer(target);

  useEffect(() => {
    if (data) {
      displayPointCloudData(data, target);
    }else{
      handleStopAndClear();
    }
  }, [data, displayPointCloudData]);

  return <div ref={containerRef} className="w-full h-full cursor-grab" />;
};