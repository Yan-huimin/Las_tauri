import GridContainer from "@/components/base/gridcontainer";
import Navbar from "@/components/base/navbar";
import { SETTING_ITEMS } from "@/hooks/settings/settings.config";

const Settings = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="Setting" />
            
            <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <GridContainer items={SETTING_ITEMS} />
            </main>
        </div>
    );
}

export default Settings;