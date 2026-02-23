import Home from "@/pages/home";
import View from "@/pages/view";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";

export type PageId = 'home' | 'view' | 'logs' | 'settings';

export const PAGE_REGISTRY: Record<PageId, { component: React.ComponentType, title: string }> = {
    home: { component: Home, title: 'Home' },
    view: { component: View, title: 'View' },
    logs: { component: Logs, title: 'Logs' },
    settings: { component: Settings, title: 'Settings' },
};