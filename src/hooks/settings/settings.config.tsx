import SettingDev from "@/components/settings/setting-dev";
import SettingBase from "@/components/settings/setting-base";
import AboutDev from "@/components/settings/aboutdev";
import SettingLog from "@/components/settings/setting-log";
import type { DevSettings } from "@/types/settings";

const SETTING_ITEMS = [
    {
        id: "1",
        component: <div className="p-4 h-auto"><SettingDev /></div>,
    },
    {
        id: "2",
        component: <div className="p-4 h-auto"><SettingBase /></div>,
    },
    {
        id: "3",
        component: <div className="p-4 h-auto"><AboutDev /></div>,
    },
    {
        id: "4",
        component: <div className="p-4 h-auto"><SettingLog /></div>,
    }
]


const DEFAULT_SETTINGS: DevSettings = {
  enableDevTools: false,
  enableLog: true,
  mockMode: false,
};

export {
    SETTING_ITEMS,
    DEFAULT_SETTINGS,
}