import type { ContainerItemProps } from "@/types/home.types";

const ContainerItem = (props: ContainerItemProps) => {
    return (<>
        <div className="w-full h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <span className="select-none">{props.title}</span>
                <div className="flex-row-reverse w-full h-full rounded-md flex flex-end gap-2">
                    {props.Logoitems?.map((item, index) => (
                        <div key={index} className="p-1 rounded-md flex items-center justify-center text-gray-500 hover:text-blue-500 dark:hover:bg-gray-700 cursor-pointer"
                             onClick={item.onClick}    
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>
            </h2>
            <hr className="text-gray-500 p-2" />
            <div className="w-full h-full
                            rounded-md overflow-y-auto custom-scrollbar p-1">
                {props.Listitems?.map((item, index) => (
                    <div key={index} className="p-2 w-full h-auto">
                        {item.icon}
                    </div>
                ))}
            </div>
        </div>
    </>)
}

export default ContainerItem;