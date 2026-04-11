import { useThemeStore } from '@/store/useThemeStore';
import { useEffect } from 'react';
import type { ThemeState } from '@/store/useThemeStore';
import Template from './utils/template';
import Layout from './pages/layout';

function App() {
  const theme = useThemeStore((state: ThemeState) => state.theme);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
      ) {
        e.preventDefault();
      }
    };

    // 绑定事件
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    // 防止热更新时监听器无限堆积导致内存溢出
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen min-w-full fixed flex flex-row">
      {/* 侧边栏 */}
      <div className='w-64 dark:bg-[#2E303D] bg-white flex items-center justify-center border-r border-gray-500'>
        <Layout />
      </div>
      
      {/* 主内容区 */}
      <div className='flex-1 bg-blue-500'>
        <Template />
      </div>
    </div>
  );
}

export default App;