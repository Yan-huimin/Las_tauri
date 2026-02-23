
interface NavbarProps {
    title?: string;
}

const Navbar = (props: NavbarProps) => {
    return (<>
        <div className="flex flex-col justify-between items-center bg-[#2E303D] w-full h-16">
            <p>{props.title}</p>
        </div>
    </>);
}

export default Navbar;