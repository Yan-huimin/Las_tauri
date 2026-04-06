interface SettingItemProps {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: () => void;
}

const SettingItem = ({
  title,
  desc,
  checked,
  onChange,
}: SettingItemProps) => {
  return (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
      <div>
        <div className="font-medium">{title}</div>
        {desc && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </div>
        )}
      </div>

      <button
        onClick={onChange}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
          checked ? "bg-blue-500" : "bg-gray-400"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default SettingItem;