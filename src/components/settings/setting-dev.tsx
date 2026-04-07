import { useSettings } from "@/hooks/settings/useSettings";
import SettingItem from "@/components/settings/settingitems";
import SettingsBar from "./settings-bar";
import SettingBtn from "../base/settingsbtn";

const SettingDev = () => {

    const {
        settings,
        handleOpenDevTools,
        handleClearCache,
        toggle,
    } = useSettings();

  return (
    <div className="p-4 space-y-6 h-full">
      {/* 标题 */}
      <SettingsBar name="Advanced" />

      {/* 开关项 */}
      <div className="space-y-4">
        <SettingItem
          key={'sds-1'}
          title="Enable DevTools"
          desc="Allow opening developer tools."
          checked={settings.enableDevTools}
          onChange={() => toggle("enableDevTools")}
        />

        <SettingItem
          key={'sds-2'}
          title="Enable Logs"
          desc="Output debug logs."
          checked={settings.enableLog}
          onChange={() => toggle("enableLog")}
        />

        <SettingItem
          key={'sds-3'}
          title="Mock Mode"
          desc="Use mock data during development."
          checked={settings.mockMode}
          onChange={() => toggle("mockMode")}
        />
      </div>

      {/* 操作项 */}
      <div className="space-y-3">
        <SettingBtn name="Open DevTools" color="bg-blue-500" onClick={handleOpenDevTools} />
        <SettingBtn name="Clear Cache" color="bg-red-500" onClick={handleClearCache} />
      </div>
    </div>
  );
};

export default SettingDev;
