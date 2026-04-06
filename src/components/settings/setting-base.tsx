import { useSettings } from "@/hooks/settings/useSettings";
import SettingsBar from "./settings-bar";

const SettingBase = () => {

    const {
        toggleTheme,
    } = useSettings();

  return (
    <div className="p-4 space-y-6 h-full">
      {/* 标题 */}
      <SettingsBar name="基础" />

      {/* 开关项 */}

      {/* 操作项 */}
      <div className="space-y-3">

        <button
            onClick={() => {
                toggleTheme();
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition cursor-pointer"
        >
            主题切换
        </button>
      </div>
    </div>
  );
};

export default SettingBase;