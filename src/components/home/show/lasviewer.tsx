import { useLasViewer } from "@/hooks/viewer/useLasViewer";
import useFileStore from "@/store/useFileStore";
import { useEffect } from "react";

const LasViewer = () => {
  const { containerRef, handleLoadLas, handleStopAndClear } = useLasViewer();
  const path = useFileStore((state) => state.workFile);
  const loadLasInfo = useFileStore((state) => state.getFileInfo);


  // 每次path更新时触发加载
  useEffect(() => {
    if(path){
      handleLoadLas();
      loadLasInfo();
    }else if(path === ''){
      handleStopAndClear();
    }
  }, [path]);

  return (
    <div className="relative w-full h-full min-h-[400px] cursor-grab"> 
      <div ref={containerRef} className="absolute w-full h-full" />
    </div>
  );
};

export default LasViewer;