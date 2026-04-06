interface LayoutBtnProps {
    title: string;
    onClick: () => void;
}

const LayoutBtn = (props: LayoutBtnProps) => {
    return (<>
        <button 
            onClick={props.onClick}
            className="px-4 py-2 w-full h-20
                       dark:text-white rounded-lg hover:bg-gray-300
                       text-xl font-bold w-full
                       text-black dark:bg-[#2E303D] dark:hover:bg-[#3E404C]
                       cursor-pointer transition-colors duration-300"
        >{props.title}</button>
    </>);
}

export default LayoutBtn;