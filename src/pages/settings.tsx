import GridContainer from "@/components/base/gridcontainer";
import Navbar from "@/components/base/navbar";
import AboutDev from "@/components/settings/aboutdev";
import SettingBase from "@/components/settings/setting-base";
import SettingDev from "@/components/settings/setting-dev";

const SettingItems = [
    {
        id: "1",
        component: <div className="p-4 h-auto"><SettingDev /></div>,
    },
    {
        id: "2",
        component: <div className="p-4 h-auto"><SettingBase /></div>,
    },
    {
        id: "3",
        component: <div className="p-4 h-auto"><AboutDev /></div>,
    }
]

const Settings = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="Setting" />
            
            <main className="flex-1 overflow-y-auto p-4">
                <GridContainer items={SettingItems} />
            </main>
        </div>
    );
}

export default Settings;