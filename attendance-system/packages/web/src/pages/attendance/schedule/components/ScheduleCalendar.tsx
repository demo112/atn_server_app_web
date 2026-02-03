import React, { useState, useEffect } from 'react';
import { Schedule } from '@attendance/shared';
import { attendanceService } from '@/services/attendance';

interface ScheduleCalendarProps {
  deptId: number;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ deptId }): React.ReactElement => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
        
        setSchedules(res);
      } catch (error) {
        console.error('Failed to fetch schedules', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [deptId, year, month, daysInMonth]);

  // 辅助函数：获取某天的排班
  const getSchedulesForDay = (day: number): Schedule[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return schedules.filter(s => {
      // 直接比较 YYYY-MM-DD 字符串，避免时区问题
      return dateStr >= s.startDate && dateStr <= s.endDate;
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 日历头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
         <div style={{ display: 'flex', gap: '10px' }}>
             <button onClick={handlePrevMonth}>&lt; 上个月</button>
             <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{year}年 {month + 1}月</span>
             <button onClick={handleNextMonth}>下个月 &gt;</button>
         </div>
         <div>
             <span style={{ fontSize: '0.9em', color: '#666' }}>当前部门: {deptId}</span>
             {loading && <span style={{ marginLeft: '10px' }}>Loading...</span>}
         </div>
      </div>

      {/* 日历主体 */}
      <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px', 
          backgroundColor: '#ddd',
          border: '1px solid #ddd',
          flex: 1
      }}>
        {/* 星期表头 */}
        {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} style={{ backgroundColor: '#f5f5f5', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {d}
            </div>
        ))}

        {/* 空白填充 */}
        {blanks.map(i => (
            <div key={`blank-${i}`} style={{ backgroundColor: 'white' }}></div>
        ))}

        {/* 日期格子 */}
        {days.map(d => {
            const daySchedules = getSchedulesForDay(d);
            return (
            <div key={d} style={{ backgroundColor: 'white', padding: '5px', minHeight: '80px', position: 'relative' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{d}</div>
                
                {/* 排班数据展示 */}
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {daySchedules.map(s => (
                        <div key={s.id} style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '2px', borderRadius: '2px' }}>
                            {s.employee?.name || s.employeeId}: {s.shift?.name || s.shiftId}
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
