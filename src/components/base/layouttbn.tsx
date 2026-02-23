interface LayoutBtnProps {
    title: string;
    onClick: () => void;
}

const LayoutBtn = (props: LayoutBtnProps) => {
    return (<>
        <button 
            onClick={props.onClick}
            className="px-4 py-2 w-full h-20
                       text-white rounded-lg hover:bg-[#3E404C] 
                       text-xl font-bold w-full
                       cursor-pointer transition-colors duration-300"
        >{props.title}</button>
    </>);
}

export default LayoutBtn;