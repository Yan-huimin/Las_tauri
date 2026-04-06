import Navbar from "@/components/base/navbar";
import Container from "@/components/base/container";
import ContainerItem from "@/components/home/containeritem";

const items: any[] = [
    {
        id: "1",
        w: 2, h: 3,
        component: <div className="p-4 h-full"><ContainerItem id="1" title="File" /></div>,
    },
    {
        id: "2",
        w: 2, h: 2,
        component: <div className="p-4 h-full"><ContainerItem id="2" title="Item 2" /></div>,
    },
    {
        id: "3",
        w: 4, h: 2,
        component: <div className="p-4 h-full"><ContainerItem id="3" title="Item 3" /></div>,
    },
    {
        id: "4",
        w: 2, h: 1,
        component: <div className="p-4 h-full"><ContainerItem id="4" title="Item 4" /></div>,
    },
    // {
    //     id: "5",
    //     w: 2, h: 1,
    //     component: <div className="p-4 h-full"><ContainerItem id="5" title="Item 5" /></div>,
    // }
];

const Home = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-100 dark:bg-[#1E1F27]">
            <Navbar title="Home" />
            
            <main className="flex-1 overflow-y-auto p-4">
                <Container items={items} maxColumns={4} rowHeight={160} />
            </main>
        </div>
    );
}

export default Home;