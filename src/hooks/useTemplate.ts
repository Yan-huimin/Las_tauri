import { useNavStore } from "@/store/usenavstore";

export const useTemplate = () => {
    const {currentId, visitedIds} = useNavStore();

    return {
        currentId,
        visitedIds,
    }
}