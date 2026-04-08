import { useSettings } from "@/hooks/settings/useSettings";
import SettingsBar from "./settings-bar";
import SettingBtn from "../base/settingsbtn";

const SettingLog = () => {

    const {
        sendErrorLog,
        sendInfoLog,
        sendWarnLog,
        sendDebugLog,
        sendAllLogs,
    } = useSettings();

  return (
    <div className="p-4 space-y-6 h-full">
      {/* 标题 */}
      <SettingsBar name="LogTest" />

      {/* 开关项 */}

      {/* 操作项 */}
      <div className="space-y-3">
        <SettingBtn name="Warn" color="bg-yellow-500" hoverColor="hover:bg-yellow-600" onClick={() => {sendWarnLog("This is a warning message")}} />
        <SettingBtn name="Error" color="bg-red-500" hoverColor="hover:bg-red-600" onClick={() => {sendErrorLog("This is an error message")}} />
        <SettingBtn name="Info" color="bg-blue-500" hoverColor="hover:bg-blue-600" onClick={() => {sendInfoLog("This is an info message")}} />
        <SettingBtn name="Debug" color="bg-gray-500" hoverColor="hover:bg-gray-600" onClick={() => {sendDebugLog("This is a debug message")}} />
        <SettingBtn name="All Logs" color="bg-purple-500" hoverColor="hover:bg-purple-600" onClick={() => {sendAllLogs("This is a log message for all levels")}} />
      </div>
    </div>
  );
};

export default SettingLog;
