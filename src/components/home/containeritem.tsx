interface ContainerItemProps {
    id: string;
    title: string;
}

const ContainerItem = (props: ContainerItemProps) => {
    return (<>
        <div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {props.title}
            </h2>
            
        </div>
    </>)
}

export default ContainerItem;