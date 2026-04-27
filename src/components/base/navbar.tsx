interface NavbarProps {
    title?: string;
}

const Navbar = (props: NavbarProps) => {
    return (
        <div className="flex items-center h-14 px-5 bg-white/70 dark:bg-[#1e1f2e]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50 select-none flex-shrink-0">
            <p className="font-bold text-xl text-slate-500 dark:text-slate-400">{props.title}</p>
        </div>
    );
}

export default Navbar;