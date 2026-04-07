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
      <SettingsBar name="基础" />
      
      {/* 操作项 */}
      <div className="space-y-3">
        <SettingBtn name="主题切换" color="bg-green-500" onClick={() => {toggleTheme()}} />
      </div>
    </div>
  );
};

export default SettingBase;