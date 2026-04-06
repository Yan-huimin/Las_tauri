import '@/App'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react';
import Template from './utils/template';
import Layout from './pages/layout';

function App() {

  const theme = useThemeStore((state) => state.theme);

  // 禁用右键
  window.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // 禁用 F12 / Ctrl+Shift+I
  window.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")
    ) {
      e.preventDefault();
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    console.log('Current theme:', root.className);
  }, [theme])

  return (
    <>
      <div className="min-h-screen min-w-full fixed flex flex-row">
        <div className='w-64 dark:bg-[#2E303D] bg-white flex items-center justify-center border-r-1 border-gray-500'>
          <Layout />
        </div>
        <div className='flex-1 bg-green-500'>
          <Template />
        </div>
      </div>
    </>
  )
}

export default App
