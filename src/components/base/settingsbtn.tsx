interface SettingBtnProps {
    name: string;
    color?: string;
    hoverColor?: string;
    onClick: () => void;
}

const SettingBtn = ({ name, color, hoverColor, onClick }: SettingBtnProps) => {
    return (<>
        <button
            onClick={() => {
                onClick();
            }}
            className={`w-full ${color || "bg-blue-500"} ${hoverColor || "hover:bg-blue-600"} text-white py-2 rounded-lg transition cursor-pointer`}
        >
            {name}
        </button>
    </>)
};

export default SettingBtn;