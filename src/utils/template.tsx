import { PAGE_REGISTRY, type PageId } from "@/config/pageConfig";
import { useTemplate } from "@/hooks/useTemplate";

const Template = () => {
    const { currentId, visitedIds } = useTemplate();

    return (
        <>
            {visitedIds.map((id) => {
                const PageComponent = PAGE_REGISTRY[id as PageId].component;
                return (<>
                    <div 
                        key={id}
                        style={{ display: id === currentId ? 'block' : 'none' }}
                        className="overflow-x-auto w-full h-full"
                    >
                        <PageComponent />
                    </div>
                </>);
            })}
        </>
    )
}

export default Template;