import Navbar from "@/components/base/navbar";
import Container from "@/components/base/container";
import { HOME_ITEMS } from "@/hooks/home/home.config";

const Home = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="Home" />
            
            <main className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <Container items={HOME_ITEMS} maxColumns={4} rowHeight={160} />
            </main>
        </div>
    );
}

export default Home;