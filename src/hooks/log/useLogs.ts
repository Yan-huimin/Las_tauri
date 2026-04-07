import { useLogStore } from "@/store/useLogStore";
import { useEffect, useMemo } from "react";

const LEVEL_COLORS: Record<string, string> = {
  info: '#0356bb',
  error: '#be1717',
  warn: '#fbbf24',
  debug: '#9ca3af',
};

export const useLogs = () => {
  const {
    logs,
    fetchLogs,
    levelFilter,
    clearLogs,
    keyword,
    setKeyword,
    setLevelFilter,
  } = useLogStore();

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logLevel = log.level.toLowerCase();
      const matchLevel = levelFilter.map((level) => level.toLowerCase()).includes(logLevel);
      const matchKeyword =
        !keyword || log.message.toLowerCase().includes(keyword.toLowerCase());

      return matchLevel && matchKeyword;
    });
  }, [logs, levelFilter, keyword]);

  const toggleLevel = (level: string) => {
    if (levelFilter.includes(level)) {
      setLevelFilter(levelFilter.filter((item) => item !== level));
    } else {
      setLevelFilter([...levelFilter, level]);
    }
  };

  useEffect(() => {
    void fetchLogs();

    const timer = setInterval(() => {
      void fetchLogs();
    }, 2000);

    return () => clearInterval(timer);
  }, [fetchLogs]);

  return {
    levelColor: LEVEL_COLORS,
    logs,
    filteredLogs,
    levelFilter,
    keyword,
    clearLogs,
    setKeyword,
    setLevelFilter,
    toggleLevel,
  };
};
