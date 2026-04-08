import LayoutBtn from '@/components/base/layouttbn';
import { useNavStore } from '@/store/useNavStore';
import Info from '@/utils/info';
import { FaHome } from 'react-icons/fa';
import { MdOutlineViewInAr } from "react-icons/md";
import { FaBloggerB } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { GrArchlinux } from "react-icons/gr";

const Layout = () => {

    const {setPage, currentId} = useNavStore();

    return (<>
        <div className="flex flex-col h-full w-full m-2 p-2 rounded-lg gap-4 select-none">
            <div className='flex-7 flex flex-col gap-2'>
                <div className='flex items-center justify-center p-4 text-gray-600 dark:text-gray-300'>
                    <h1 className='text-2xl font-bold flex items-center gap-2'>
                        <GrArchlinux className='w-10 h-10' />
                        <span className='text-3xl'>LAS</span>
                    </h1>
                </div>
                <LayoutBtn title="Home" logo={<FaHome />} currentId={currentId} onClick={() => setPage("home")} />
                <LayoutBtn title="View" logo={<MdOutlineViewInAr />} currentId={currentId} onClick={() => setPage("view")} />
                <LayoutBtn title="Logs" logo={<FaBloggerB />} currentId={currentId} onClick={() => setPage("logs")} />
                <LayoutBtn title="Settings" logo={<IoMdSettings />} currentId={currentId} onClick={() => setPage("settings")} />
            </div>
            <div className='w-full flex-none h-[200px]'>
                <Info />
            </div>
        </div>
    </>);
}

export default Layout;
