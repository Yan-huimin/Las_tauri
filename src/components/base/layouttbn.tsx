interface LayoutBtnProps {
    title: string;
    logo?: React.ReactNode;
    currentId: string;
    onClick: () => void;
}

const LayoutBtn = (props: LayoutBtnProps) => {
    const isActive = props.currentId === props.title.toLowerCase();

    return (
        <div 
            onClick={props.onClick}
            className={`px-4 py-2 w-full h-20
                       flex items-center gap-3 justify-center
                       rounded-lg cursor-pointer 
                       text-xl font-bold transition-all duration-300
                       ${isActive 
                           ? 'bg-[#214D81] text-black shadow-inner text-gray-100' // 选中态
                           : 'bg-transparent text-gray-600 hover:bg-gray-200 dark:bg-[#2E303D] dark:text-gray-300 dark:hover:bg-[#3E404C]' // 非选中态
                       }`}
        >
            {props.logo && (
                <div className="flex-shrink-0 flex items-center justify-center">
                    {props.logo}
                </div>
            )} 
            
            <span className="truncate">
                {props.title}
            </span>
        </div>
    );
}

export default LayoutBtn;