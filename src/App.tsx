import '@/App'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react';
import Template from './utils/template';
import Layout from './pages/layout';

function App() {

  const theme = useThemeStore((state) => state.theme);

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
      <div className="bg-[#1E1F27] dark:bg-gray-900 min-h-screen min-w-full fixed flex flex-row">
        <div className='w-64 bg-[#2E303D] flex items-center justify-center border-r-1 border-gray-500'>
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
