import { useSettings } from "@/hooks/settings/useSettings";
import SettingsBar from "./settings-bar";
import SettingBtn from "../base/settingsbtn";

const SettingBase = () => {

    const {
        toggleTheme,
    } = useSettings();

  return (
    <div className="p-4 space-y-6 h-full">
      {/* 标题 */}
      <SettingsBar name="General" />
      
      {/* 操作项 */}
      <div className="space-y-3">
        <SettingBtn name="Toggle Theme" color="bg-green-500" onClick={toggleTheme} />
      </div>
    </div>
  );
};

export default SettingBase;
