import { useNavStore } from "@/store/useNavStore";

export const useTemplate = () => {
    const {currentId, visitedIds} = useNavStore();

    return {
        currentId,
        visitedIds,
    }
}