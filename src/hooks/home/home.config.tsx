import HomeFile from "@/components/home/file/home-file";
import HomeFileInput from "@/components/home/file/home-file-input";
import HomeHistory from "@/components/home/history/home-history";
import HomeHistoryFile from "@/components/home/history/home-history-file";
import useFileStore from "@/store/useFileStore";
import type { ListItem, ToolItem } from "@/types/home.types";
import { CloudUpload, Trash2, ScanEye } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import HomeShow from "@/components/home/show/home-show";
import SpatialDashboard from "@/components/home/lasdata/home-z";
import HomeZMain from "@/components/home/lasdata/home-z-main";
import { useLasStore } from "@/store/useLasStore";
import { useNavStore } from "@/store/useNavStore";
import HomeTerminal from "@/components/home/show/home-terminal";

const HOME_ITEMS: any[] = [
    {
        id: "1",
        w: 2, h: 3,
        component: <div className="p-4 h-full"><HomeShow /></div>,
    },
    {
        id: "2",
        w: 2, h: 1,
        component: <div className="p-4 h-full"><HomeFile /></div>,
    },
    {
        id: "3",
        w: 2, h: 2,
        component: <div className="p-4 h-full"><HomeHistory /></div>,
    },
    {
        id: "4",
        w: 4, h: 3,
        component: <div className="p-4 h-full"><HomeZMain /></div>,
    },
];

const HOME_FILE_CONFIG: ListItem[] = [
    {
        id: "2",
        name: "File",
        icon: <HomeFileInput />,
    }
];

const HOME_FILE_LOGO_CONFIG: ToolItem[] = [
    {
        id: "1",
        name: "New File",
        icon: <CloudUpload  />,
        onClick: async () => {
            try {
                const cur: string = await invoke("pick_file_path");
                    if (cur) {
                        useFileStore.getState().setWorkFile(cur);
                        useFileStore.getState().addHistoryFiles(cur);
                    }
                } catch (err) {
                    console.error("load file error:", err);
                }
        }
    },
    {
        id: '2',
        name: '',
        icon: <Trash2 />,
        onClick() {
            useFileStore.getState().resetWorkFile();
            useLasStore.getState().cleanLasPoints();
        }
    }
]

const HOME_HISTORY_CONFIG: ListItem[] = [
    {
        id: "3",
        name: "History",
        icon: <HomeHistoryFile />,
    }
]

const HOME_HISTORY_LOGO_CONFIG: ToolItem[] = [
    {
        id: "1",
        name: '',
        icon: <Trash2 />,
        onClick() {
            useFileStore.getState().resetHistoryFiles();
        },
    }
]

const HOME_SHOW_CONFIG: ListItem[] = [
    {
        id: '',
        name: '',
        icon: <HomeTerminal />
    }
]

const HOME_SHOW_LOGO_CONFIG: ToolItem[] = [
    {
        id: '',
        name: '',
        icon: <ScanEye />,
        onClick() {
            useNavStore.getState().setPage("view");
        }
    }
]

const HOME_Z_CONFIG: ListItem[] = [
    {
        id: '',
        name: '',
        icon: <SpatialDashboard />
    }
]

export {
    HOME_ITEMS,
    HOME_FILE_CONFIG,
    HOME_FILE_LOGO_CONFIG,
    HOME_HISTORY_CONFIG,
    HOME_HISTORY_LOGO_CONFIG,
    HOME_SHOW_CONFIG,
    HOME_SHOW_LOGO_CONFIG,
    HOME_Z_CONFIG
}