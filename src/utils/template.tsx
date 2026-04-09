import { PAGE_REGISTRY } from "@/config/pageConfig";
import { useTemplate } from "@/hooks/useTemplate";

const Template = () => {
    const { currentId } = useTemplate();
    const PageComponent = PAGE_REGISTRY[currentId].component;

    return (
        <div className="overflow-x-auto w-full h-full">
            <PageComponent />
        </div>
    );
};

export default Template;
