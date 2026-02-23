import { useThemeStore } from "@/store/useThemeStore";
import { FaSun } from "react-icons/fa";

const ThemeBtn = () => {
    const {toggleTheme} = useThemeStore();

    return (
        <>
            <FaSun onClick={toggleTheme} className="dark:text-yellow-300 text-black w-10 h-10 cursor-pointer" />
        </>
    )
}

export default ThemeBtn;