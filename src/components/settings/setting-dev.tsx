import { useSettings } from "@/hooks/settings/useSettings";
import SettingItem from "@/components/settings/settingitems";
import SettingsBar from "./settings-bar";

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
      <SettingsBar name="高级" />

      {/* 开关项 */}
      <div className="space-y-4">
        <SettingItem
          key={'sds-1'}
          title="启用 DevTools"
          desc="允许打开开发者工具"
          checked={settings.enableDevTools}
          onChange={() => toggle("enableDevTools")}
        />

        <SettingItem
          key={'sds-2'}
          title="启用日志"
          desc="输出调试日志"
          checked={settings.enableLog}
          onChange={() => toggle("enableLog")}
        />

        <SettingItem
          key={'sds-3'}
          title="Mock 模式"
          desc="使用模拟数据（开发调试用）"
          checked={settings.mockMode}
          onChange={() => toggle("mockMode")}
        />
      </div>

      {/* 操作项 */}
      <div className="space-y-3">
        <button
          key={'sdb-1'}
          onClick={handleOpenDevTools}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition cursor-pointer"
        >
          打开开发者工具
        </button>

        <button
          key={'sdb-2'}
          onClick={handleClearCache}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition cursor-pointer"
        >
          清除缓存
        </button>
      </div>
    </div>
  );
};

export default SettingDev;