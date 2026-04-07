use std::sync::Mutex;
use chrono::Local;
use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct LogItem {
    pub level: String,
    pub message: String,
    pub timestamp: String,
}

lazy_static::lazy_static! {
    static ref LOGS: Mutex<Vec<LogItem>> = Mutex::new(Vec::new());
}

// 写日志（统一入口）
pub fn push_log(level: &str, message: String) {
    let log = LogItem {
        level: level.to_string(),
        message: message.clone(),
        timestamp: Local::now().format("%H:%M:%S").to_string(),
    };

    let mut logs = LOGS.lock().unwrap();

    // 限制最大条数（防止爆内存）
    if logs.len() > 1000 {
        logs.remove(0);
    }

    logs.push(log);

    println!("日志写入: {} - {}", level, message);
}

#[tauri::command]
pub fn get_logs() -> Vec<LogItem> {
    LOGS.lock().unwrap().clone()
}

#[tauri::command]
pub fn clear_logs() {
    LOGS.lock().unwrap().clear();
}

#[tauri::command]
pub fn send_error_log(message: String) {
    push_log("error", message);
}

#[tauri::command]
pub fn send_info_log(message: String) {
    push_log("info", message);
}

#[tauri::command]
pub fn send_warn_log(message: String) {
    push_log("warn", message);
}   

#[tauri::command]
pub fn send_debug_log(message: String) {
    push_log("debug", message);
}