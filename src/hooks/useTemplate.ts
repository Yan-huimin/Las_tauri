import { useNavStore } from "@/store/useNavStore";
import type { PageId } from "@/config/pageConfig";

export const useTemplate = () => {
    const currentId = useNavStore((state) => state.currentId as PageId);

    return {
        currentId,
    };
};
