interface NavbarProps {
    title?: string;
}

const Navbar = (props: NavbarProps) => {
    return (<>
        <div className="flex flex-col justify-between dark:bg-[#2E303D] bg-gray-300 w-full h-16 select-none">
            <p className="font-bold text-4xl pt-3 pl-3 text-gray-500">{props.title}</p>
        </div>
    </>);
}

export default Navbar;