import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { DEFAULT_SETTINGS } from '@/hooks/settings/settings.config';
import { useThemeStore } from '@/store/useThemeStore';
import type { ThemeState } from '@/store/useThemeStore';
import type { DevSettings } from '@/types/settings';


// 清除缓存
const handleClearCache = () => {
    localStorage.clear();
    alert("缓存已清除");
};

// 开发者工具
const openDevTools = async () => {
    try{
        await invoke('open_devtools');
    } catch (error) {
        console.error("Failed to open DevTools:", error);
    }
}

const handleOpenDevTools = () => {
    void openDevTools();
};

// 日志相关
const sendErrorLog = async (message: string) => {
    await invoke('send_error_log', { message });
}

const sendInfoLog = async (message: string) => {
    await invoke('send_info_log', { message });
}

const sendWarnLog = async (message: string) => {
    await invoke('send_warn_log', { message });
}

const sendDebugLog = async (message: string) => {
    await invoke('send_debug_log', { message });
}

const sendAllLogs = async (message: string) => {
    await Promise.all([
        sendErrorLog(message),
        sendInfoLog(message),
        sendWarnLog(message),
        sendDebugLog(message),
    ]);
}


// 暴露接口
export const useSettings = () => {

    const [settings, setSettings] = useState<DevSettings>(() => {
        const saved = localStorage.getItem('dev-settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const toggleTheme = useThemeStore((state: ThemeState) => state.toggleTheme);

    const toggle = (key: keyof DevSettings) => {
        setSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

  // 持久化
//   useEffect(() => {
//     localStorage.setItem('dev-settings', JSON.stringify(settings));
//   }, [settings]);

  return {
    settings,
    setSettings,
    handleOpenDevTools,
    handleClearCache,
    toggleTheme,
    DEFAULT_SETTINGS,
    sendErrorLog,
    sendInfoLog,
    sendWarnLog,
    sendDebugLog,
    sendAllLogs,
    toggle,
  };
};
