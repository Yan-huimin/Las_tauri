interface SettingsBarProps {
    name: string;
}

const SettingsBar = ({ name }: SettingsBarProps) => {
    return  (<>
        <div>
            <h1 className="text-blue-500 font-bold text-xl dark:text-blue-400">
            {name}
            </h1>
            <hr className="border-gray-300 dark:border-gray-600 mt-2" />
        </div>
    </>)
};

export default SettingsBar;