interface SettingBtnProps {
    name: string;
    color?: string;
    onClick: () => void;
}

const SettingBtn = ({ name, color, onClick }: SettingBtnProps) => {
    return (<>
        <button
            onClick={() => {
                onClick();
            }}
            className={`w-full ${color || "bg-blue-500"} hover:${color?.replace("bg-", "hover:bg-") || "hover:bg-blue-600"} text-white py-2 rounded-lg transition cursor-pointer`}
        >
            {name}
        </button>
    </>)
};

export default SettingBtn;