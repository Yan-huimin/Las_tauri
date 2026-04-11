import { PAGE_REGISTRY, type PageId } from "@/config/pageConfig";
import { useTemplate } from "@/hooks/useTemplate";

const Template = () => {
  const { currentId, visitedID } = useTemplate();

  return (
    <div className="overflow-x-auto w-full h-full">
      {visitedID.map((id: PageId) => {
        const Component = PAGE_REGISTRY[id].component;

        return (
          <div
            key={id}
            style={{
              display: currentId === id ? 'block' : 'none',
              height: '100%',
            }}
          >
            <Component />
          </div>
        );
      })}
    </div>
  );
};

export default Template;