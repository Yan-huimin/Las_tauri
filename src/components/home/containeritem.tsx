interface ContainerItemProps {
    id: string;
    title: string;
}

const ContainerItem = (props: ContainerItemProps) => {
    return (<>
        <div className="w-full h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {props.title}
            </h2>
            <hr className="text-gray-500 p-2" />
        </div>
    </>)
}

export default ContainerItem;