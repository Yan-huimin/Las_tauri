import ContainerItem from "@/components/home/containeritem";
import HomeFile from "@/components/home/file/home-file";
import HomeFileInput from "@/components/home/file/home-file-input";
import HomeHistory from "@/components/home/history/home-history";
import HomeHistoryFile from "@/components/home/history/home-history-file";
import useFileStore from "@/store/useFileStore";
import type { ListItem, ToolItem } from "@/types/home.types";
import { CloudUpload, Trash2 } from "lucide-react";

const HOME_ITEMS: any[] = [
    {
        id: "1",
        w: 2, h: 3,
        component: <div className="p-4 h-full"><ContainerItem id="1" title="Show" /></div>,
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
        w: 4, h: 4,
        component: <div className="p-4 h-full"><ContainerItem id="4" title="Data" /></div>,
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
    },
    {
        id: '2',
        name: '',
        icon: <Trash2 />,
        onClick() {
            useFileStore.getState().resetWorkFile();
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

export {
    HOME_ITEMS,
    HOME_FILE_CONFIG,
    HOME_FILE_LOGO_CONFIG,
    HOME_HISTORY_CONFIG,
    HOME_HISTORY_LOGO_CONFIG
}