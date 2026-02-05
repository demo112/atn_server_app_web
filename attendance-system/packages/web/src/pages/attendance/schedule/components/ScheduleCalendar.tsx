import React, { useState, useEffect } from 'react';
import { attendanceService } from '@/services/attendance';
import { logger } from '@/utils/logger';
import { z } from 'zod';
import { ScheduleVoSchema } from '@/schemas/attendance';

type ScheduleVo = z.infer<typeof ScheduleVoSchema>;

interface ScheduleCalendarProps {
  deptId: number;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ deptId }): React.ReactElement => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleVo[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取当月天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 获取当月第一天是星期几 (0-6)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // 生成日历格子
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handlePrevMonth = (): void => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = (): void => setCurrentDate(new Date(year, month + 1, 1));

  // 加载数据
  useEffect(() => {
    const fetchSchedules = async (): Promise<void> => {
      setLoading(true);
      try {
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
        
        const res = await attendanceService.getSchedules({
          deptId: deptId,
          startDate,
          endDate
        });
        
        setSchedules(res as unknown as ScheduleVo[]);
      } catch (error) {
        logger.error('Failed to fetch schedules', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [deptId, year, month, daysInMonth]);

  // 辅助函数：获取某天的排班
  const getSchedulesForDay = (day: number): ScheduleVo[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return schedules.filter(s => {
      // 直接比较 YYYY-MM-DD 字符串，避免时区问题
      return dateStr >= s.startDate && dateStr <= s.endDate;
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* 日历头部 */}
      <div className="flex justify-between items-center mb-2.5">
         <div className="flex gap-2.5">
             <button onClick={handlePrevMonth} className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">&lt; 上个月</button>
             <span className="text-lg font-bold text-gray-800">{year}年 {month + 1}月</span>
             <button onClick={handleNextMonth} className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">下个月 &gt;</button>
         </div>
         <div>
             <span className="text-sm text-gray-500">当前部门: {deptId}</span>
             {loading && <span className="ml-2.5 text-sm text-primary">Loading...</span>}
         </div>
      </div>

      {/* 日历主体 */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 flex-1">
        {/* 星期表头 */}
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="bg-gray-50 p-2.5 text-center font-bold text-gray-700">
                {d}
            </div>
        ))}

        {/* 空白填充 */}
        {blanks.map(i => (
            <div key={`blank-${i}`} className="bg-white"></div>
        ))}

        {/* 日期格子 */}
        {days.map(d => {
            const daySchedules = getSchedulesForDay(d);
            return (
            <div key={d} className="bg-white p-1.5 min-h-[80px] relative hover:bg-gray-50 transition-colors">
                <div className="font-bold mb-1.5 text-gray-700">{d}</div>
                
                {/* 排班数据展示 */}
                <div className="text-xs flex flex-col gap-0.5">
                    {daySchedules.map(s => (
                        <div key={s.id} className="bg-blue-50 border border-blue-200 px-1 py-0.5 rounded text-blue-800 truncate" title={`${s.employeeName}: ${s.shiftName}`}>
                            {s.employeeName || s.employeeId}: {s.shiftName || s.shiftId}
                        </div>
                    ))}
                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
};
