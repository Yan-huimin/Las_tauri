import head from '@/assets/img/head.jpg';
import SettingsBar from "./settings-bar";
import { 
  FaGithub, 
  FaGlobe, 
  FaTelegram, 
  FaTwitter 
} from "react-icons/fa"; // 建议安装 lucide-react，或者换成你自己的图标

const AboutDev = () => {
  const devInfo = {
    name: "yhm",
    role: "Full AI Developer / UI Designer",
    avatar: head,
    bio: "shit",
    links: [
      { icon: <FaGithub size={18} />, label: "GitHub", url: "https://github.com/yan-huimin" },
      { icon: <FaGlobe size={18} />, label: "Website", url: "https://example.com" },
      { icon: <FaTelegram size={18} />, label: "Telegram", url: "https://t.me/yourusername" },
      { icon: <FaTwitter size={18} />, label: "Twitter", url: "https://twitter.com/yourusername" },
    ],
    techStack: ["React", "TypeScript", "Tauri", "Rust", "Tailwind", "Node.js", "Electron", 'Python', "Cpp", "Rust", "C#",
                "ChatGpt", "Gemini", "Claude"
    ],
  };

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      {/* 标题 */}
      <SettingsBar name="About dev" />

      {/* 个人核心资料卡片 */}
      <div className="flex flex-col items-center p-6 bg-[#F8F8F8] dark:bg-[#2E303D] rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <img 
          src={devInfo.avatar} 
          alt="Avatar" 
          className="w-20 h-20 rounded-full border-2 border-blue-500 p-1 mb-4"
        />
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{devInfo.name}</h2>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{devInfo.role}</p>
        <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
          {devInfo.bio}
        </p>
      </div>

      {/* 技术栈标签 */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">skill</h3>
        <div className="flex flex-wrap gap-2">
          {devInfo.techStack.map((tech) => (
            <span 
              key={tech} 
              className="px-3 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full border border-zinc-200 dark:border-zinc-700"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 社交链接列表 */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 ml-1">contact</h3>
        <div className="grid grid-cols-2 gap-3">
          {devInfo.links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleOpenLink(link.url)}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#2E303D] hover:bg-zinc-100 dark:hover:bg-[#3E404C] border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all group"
            >
              <span className="text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 transition-colors">
                {link.icon}
              </span>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部版权/版本信息 */}
      <div className="pt-4 text-center">
        <p className="text-[10px] text-zinc-400">
          © 2026 Built with ❤️ using Tauri & React
        </p>
      </div>
    </div>
  );
};

export default AboutDev;