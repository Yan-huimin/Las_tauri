import LayoutBtn from '@/components/base/layouttbn';
import { useNavStore } from '@/store/useNavStore';
import Info from '@/utils/info';

const Layout = () => {

    const {setPage} = useNavStore();

    return (<>
        <div className="flex flex-col h-full w-full m-2 p-2 rounded-lg gap-4">
            <div className='flex-7 flex flex-col gap-2'>
                <LayoutBtn title="首页" onClick={() => setPage("home")} />
                <LayoutBtn title="视图" onClick={() => setPage("view")} />
                <LayoutBtn title="日志" onClick={() => setPage("logs")} />
                <LayoutBtn title="设置" onClick={() => setPage("settings")} />
            </div>
            <div className='w-full flex-none h-[200px]'>
                <Info />
            </div>
        </div>
    </>);
}

export default Layout;