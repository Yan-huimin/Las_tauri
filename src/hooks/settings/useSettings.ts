import { type DevSettings } from '@/types/settings';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { invoke } from '@tauri-apps/api/core';

const DEFAULT_SETTINGS: DevSettings = {
  enableDevTools: false,
  enableLog: true,
  mockMode: false,
};

const handleClearCache = () => {
    localStorage.clear();
    alert("缓存已清除");
};

const openDevTools = async () => {
    try{
        await invoke('open_devtools');
    } catch (error) {
        console.error("Failed to open DevTools:", error);
    }
}

const handleOpenDevTools = () => {
    openDevTools();
};

export const useSettings = () => {

    const [settings, setSettings] = useState<DevSettings>(() => {
        const saved = localStorage.getItem("dev-settings");
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    })


    const toggleTheme = useThemeStore((state) => state.toggleTheme);

    const toggle = (key: keyof DevSettings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

  // 持久化
  useEffect(() => {
    localStorage.setItem("dev-settings", JSON.stringify(settings));
  }, [settings]);

  return {
    settings,
    setSettings,
    handleOpenDevTools,
    handleClearCache,
    toggleTheme,
    DEFAULT_SETTINGS,
    toggle,
  };
};