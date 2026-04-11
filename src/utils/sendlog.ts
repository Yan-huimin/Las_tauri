import { invoke } from "@tauri-apps/api/core";

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

export {
    sendDebugLog,
    sendErrorLog,
    sendInfoLog,
    sendWarnLog
}