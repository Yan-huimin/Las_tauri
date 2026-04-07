import ContainerItem from "@/components/home/containeritem";

const HOME_ITEMS: any[] = [
    {
        id: "1",
        w: 2, h: 3,
        component: <div className="p-4 h-full"><ContainerItem id="1" title="File" /></div>,
    },
    {
        id: "2",
        w: 2, h: 1,
        component: <div className="p-4 h-full"><ContainerItem id="2" title="Item 2" /></div>,
    },
    {
        id: "3",
        w: 2, h: 2,
        component: <div className="p-4 h-full"><ContainerItem id="3" title="Item 3" /></div>,
    },
    {
        id: "4",
        w: 4, h: 2,
        component: <div className="p-4 h-full"><ContainerItem id="4" title="Item 4" /></div>,
    },
];

export {
    HOME_ITEMS,
}