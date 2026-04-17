import React, { useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';

// 定义日志对象接口
interface LogEntry {
  id: string;
  content: string;
  timestamp: string;
  isProgress: boolean;
}

const HomeTerminal: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupListener = async () => {
      const unlisten = await listen<string>('log-event', (event) => {
        const newMsg = event.payload;
        const timeStr = new Date().toLocaleTimeString();
        const isProgress = newMsg.startsWith('>>');

        setLogs((prevLogs) => {
          // 如果是进度条且上一条也是进度条，则替换内容，保留原始时间戳
          if (isProgress && prevLogs.length > 0 && prevLogs[prevLogs.length - 1].isProgress) {
            const updated = [...prevLogs];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: newMsg,
            };
            return updated;
          }

          // 普通日志或新的进度条，创建新条目
          const newEntry: LogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            content: newMsg,
            timestamp: timeStr,
            isProgress: isProgress,
          };
          return [...prevLogs, newEntry];
        });
      });

      return unlisten;
    };

    const unlistenPromise = setupListener();
    return () => {
      unlistenPromise.then((f) => f());
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    /* 外层容器 */
    <div className="p-0.5 bg-[#f3f3f3] dark:bg-[#252526] transition-colors duration-200">
      <div
        ref={terminalRef}
        className="h-[400px] overflow-y-auto p-3 custom-scrollbar font-mono text-sm leading-relaxed whitespace-pre-wrap 
                   bg-white dark:bg-[#1e1e1e] rounded-sm shadow-inner"
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className={`flex gap-2 ${
              log.content.includes('成功') 
                ? 'border-b border-gray-200 dark:border-[#333] mb-1 pb-0.5' 
                : ''
            }`}
          >
            {/* 时间戳 */}
            <span className="shrink-0 text-gray-400 dark:text-gray-500 select-none">
              [{log.timestamp}]
            </span>

            {/* 内容：根据进度条或普通日志切换颜色 */}
            <span
              className={
                log.isProgress
                  ? 'text-cyan-600 dark:text-[#00adb5]' // 进度条颜色
                  : 'text-gray-800 dark:text-[#d4d4d4]' // 普通文本颜色
              }
            >
              {log.content}
            </span>
          </div>
        ))}

        {/* 模拟光标 */}
        <span className="inline-block w-2 h-[15px] align-middle bg-green-500 dark:bg-[#00ff00] animate-[pulse_1s_infinite]" />
      </div>
    </div>
  );
};

export default HomeTerminal;