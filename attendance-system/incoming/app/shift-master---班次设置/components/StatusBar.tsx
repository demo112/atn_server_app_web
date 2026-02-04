
import React, { useState, useEffect } from 'react';

const StatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 w-full bg-inherit flex items-end justify-between px-6 pb-2 select-none sticky top-0 z-50">
      <div className="text-[14px] font-bold tracking-tight">{time}</div>
      <div className="flex gap-1.5 items-center">
        <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
        <span className="material-symbols-outlined text-[18px]">wifi</span>
        <span className="material-symbols-outlined text-[18px] rotate-90">battery_full</span>
      </div>
    </div>
  );
};

export default StatusBar;
