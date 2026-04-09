type ContainerItemProps = {
    id: string;
    title: string;
    Listitems?: ListItem[];
    Logoitems?: ToolItem[];
}

type ListItem = {
    id: string;
    name: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

type ToolItem = {
    id: string;
    name: string;
    icon: React.ReactNode;
    onClick?: () => void;
}

export type {
    ContainerItemProps,
    ListItem,
    ToolItem,
}