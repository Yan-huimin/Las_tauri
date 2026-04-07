import Navbar from '@/components/base/navbar';
import { useLogs } from "@/hooks/log/useLogs";
import type { LogItem } from '@/types/log';

const Logs = () => {
  const { levelColor, filteredLogs } = useLogs();

  return (<>
    <div className="flex h-screen w-full flex-col overflow-hidden dark:bg-[#1E1F27] bg-white">
      <Navbar title="Logs" />
      <div className="felx-1 p-4 overflow-y-auto h-full custom-scrollbar">
        {filteredLogs.map((log: LogItem, i: number) => (
          <div key={`${log.timestamp}-${i}`} className="p-2 mb-2 rounded-lg border-b border-gray-700/50">
            <span className={`font-bold mr-2 select-none`} style={{ color: levelColor[log.level] || '#60a5fa', backgroundColor: levelColor[log.level] ? `${levelColor[log.level]}20` : '#60a5fa20', padding: '2px 6px', borderRadius: '4px' }}>
              {log.level.toUpperCase()}
            </span>

            <span className="text-gray-500 text-sm select-none">[{log.timestamp}]</span>
            
            <div className="mt-1 text-zinc-400 break-all">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  </>);
}

export default Logs;
