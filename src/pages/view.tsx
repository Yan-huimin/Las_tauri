import Navbar from "@/components/base/navbar";
import SpatialDashboard from "@/components/home/lasdata/home-z";
// import LasViewer from "@/components/home/show/lasviewer";

const View = () => {
    return (<>
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="View" />
            
            <main className="flex-1 w-full h-full border border-blue-500 overflow-y-auto custom-scrollbar">
                <SpatialDashboard />
            </main>
        </div>
    </>);
}

export default View;