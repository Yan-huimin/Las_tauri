import SettingsBar from "./settings-bar";
import SettingBtn from "../base/settingsbtn";
import { invoke } from "@tauri-apps/api/core";

const SettingBaseTest = () => {

  return (
    <div className="p-4 space-y-6 h-full">
      {/* 标题 */}
      <SettingsBar name="General Test" />
      
      {/* 操作项 */}
      <div className="space-y-3">
        <SettingBtn name="Test c11" color="bg-green-500" hoverColor="hover:bg-green-600" onClick={async () => {
            await invoke("get_point_cloud");
        }} />
      </div>
    </div>
  );
};

export default SettingBaseTest;
