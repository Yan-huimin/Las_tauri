import useFileStore from "@/store/useFileStore";
import { invoke } from "@tauri-apps/api/core";

export const useHome = () => {
    const history = useFileStore((state) => state.historyFiles);
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

    return {
        history,
        setWorkFile,
        path,
        handlePickFile
    }
}