export interface LogItem {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}