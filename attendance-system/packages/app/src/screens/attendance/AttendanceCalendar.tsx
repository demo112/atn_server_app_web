import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import dayjs from 'dayjs';
import { CalendarDailyVo, DailyStatsVo } from '@attendance/shared';
import { getCalendar, getDailyStats } from '../../services/statistics';
import { useAuth } from '../../utils/auth';
import { logger } from '../../utils/logger';

const statusColors: Record<string, string> = {
  normal: '#52c41a',
  late: '#faad14',
  early_leave: '#faad14',
  absent: '#ff4d4f',
  leave: '#1890ff',
  business_trip: '#13c2c2',
};

const rateColors = {
  high: '#52c41a', // >= 95%
  medium: '#faad14', // >= 80%
  low: '#ff4d4f', // < 80%
};

type MarkedDates = Record<string, MarkingProps>;

export default function AttendanceCalendar() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'personal' | 'company'>('personal');
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [refreshing, setRefreshing] = useState(false);
  
  // Personal Stats
  const [personalStats, setPersonalStats] = useState({
    normal: 0,
    abnormal: 0,
    leave: 0,
  });

  // Company Stats
  const [companyStats, setCompanyStats] = useState({
    avgRate: 0,
    totalAbnormal: 0,
    avgExpected: 0,
  });
  const [dailyCompanyStats, setDailyCompanyStats] = useState<Record<string, DailyStatsVo>>({});

  const loadCalendarData = async (monthStr: string) => {
    try {
      const date = dayjs(monthStr);
      
      if (viewMode === 'personal') {
        const res = await getCalendar(date.year(), date.month() + 1, user?.id);
        
        const marks: MarkedDates = {};
        let normalCount = 0;
        let abnormalCount = 0;
        let leaveCount = 0;

        res.forEach((item: CalendarDailyVo) => {
          const dotColor = statusColors[item.status] || '#d9d9d9';
          
          if (item.status === 'normal') normalCount++;
          else if (['late', 'early_leave', 'absent'].includes(item.status)) abnormalCount++;
          else leaveCount++;

          marks[item.date] = {
            marked: true,
            dotColor,
            selected: item.date === selectedDate,
            selectedColor: '#1890ff',
          };
        });

        setPersonalStats({
          normal: normalCount,
          abnormal: abnormalCount,
          leave: leaveCount,
        });
        updateMarks(marks, selectedDate);
      } else {
        // Company Mode
        const startDate = date.startOf('month').format('YYYY-MM-DD');
        const endDate = date.endOf('month').format('YYYY-MM-DD');
        
        const res = await getDailyStats({ startDate, endDate });
        
        const marks: MarkedDates = {};
        const dailyStats: Record<string, DailyStatsVo> = {};
        
        let totalRate = 0;
        let totalAbnormal = 0;
        let totalExpected = 0;
        let count = 0;

        res.forEach((item: DailyStatsVo) => {
          dailyStats[item.date] = item;
          
          let dotColor = rateColors.low;
          if (item.attendanceRate >= 95) dotColor = rateColors.high;
          else if (item.attendanceRate >= 80) dotColor = rateColors.medium;

          marks[item.date] = {
            marked: true,
            dotColor,
            selected: item.date === selectedDate,
            selectedColor: '#1890ff',
          };

          if (item.expectedCount > 0) {
            totalRate += item.attendanceRate;
            totalExpected += item.expectedCount;
            count++;
          }
          totalAbnormal += item.abnormalCount;
        });

        setCompanyStats({
          avgRate: count > 0 ? Math.round(totalRate / count) : 0,
          totalAbnormal,
          avgExpected: count > 0 ? Math.round(totalExpected / count) : 0,
        });
        setDailyCompanyStats(dailyStats);
        updateMarks(marks, selectedDate);
      }
    } catch (error) {
      logger.error('Failed to load calendar data:', error);
    }
  };

  const updateMarks = (marks: MarkedDates, selDate: string) => {
     // Ensure selected date is marked as selected
     if (marks[selDate]) {
      marks[selDate].selected = true;
    } else {
      marks[selDate] = { selected: true, selectedColor: '#1890ff' };
    }
    setMarkedDates(marks);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarData(currentMonth);
    setRefreshing(false);
  }, [currentMonth, user?.id, viewMode]);

  useFocusEffect(
    useCallback(() => {
      loadCalendarData(currentMonth);
    }, [currentMonth, user?.id, viewMode])
  );

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    const newMarks = { ...markedDates };
    
    // Reset previous selection
    Object.keys(newMarks).forEach(key => {
      if (newMarks[key].selected) {
        newMarks[key] = { ...newMarks[key], selected: false };
      }
    });

    // Set new selection
    if (newMarks[day.dateString]) {
      newMarks[day.dateString] = { ...newMarks[day.dateString], selected: true, selectedColor: '#1890ff' };
    } else {
      newMarks[day.dateString] = { selected: true, selectedColor: '#1890ff' };
    }
    
    setMarkedDates(newMarks);
  };

  const onMonthChange = (month: DateData) => {
    setCurrentMonth(month.dateString);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {user?.role === 'admin' && (
        <View style={styles.segmentContainer}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={val => setViewMode(val as 'personal' | 'company')}
            buttons={[
              { value: 'personal', label: '个人考勤' },
              { value: 'company', label: '公司统计' },
            ]}
          />
        </View>
      )}

      <Card style={styles.card}>
        <Card.Content>
          {viewMode === 'personal' ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: statusColors.normal }]}>{personalStats.normal}</Text>
                <Text style={styles.statLabel}>正常</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: statusColors.late }]}>{personalStats.abnormal}</Text>
                <Text style={styles.statLabel}>异常</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: statusColors.leave }]}>{personalStats.leave}</Text>
                <Text style={styles.statLabel}>请假/出差</Text>
              </View>
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#1890ff' }]}>{companyStats.avgRate}%</Text>
                <Text style={styles.statLabel}>月均出勤率</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#faad14' }]}>{companyStats.totalAbnormal}</Text>
                <Text style={styles.statLabel}>总异常人次</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: '#666' }]}>{companyStats.avgExpected}</Text>
                <Text style={styles.statLabel}>日均应到</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Calendar
          current={currentMonth}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#1890ff',
            arrowColor: '#1890ff',
            dotStyle: { width: 6, height: 6, borderRadius: 3 },
          }}
        />
      </Card>
      
      {viewMode === 'personal' ? (
        <View style={styles.legendContainer}>
          {Object.entries(statusColors).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {status === 'normal' ? '正常' : 
                 status === 'late' ? '迟到' : 
                 status === 'early_leave' ? '早退' : 
                 status === 'absent' ? '缺勤' : 
                 status === 'leave' ? '请假' : '出差'}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>{selectedDate} 统计详情</Text>
          {dailyCompanyStats[selectedDate] ? (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>应到人数</Text>
                <Text style={styles.detailValue}>{dailyCompanyStats[selectedDate].expectedCount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>实到人数</Text>
                <Text style={styles.detailValue}>{dailyCompanyStats[selectedDate].actualCount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>出勤率</Text>
                <Text style={[styles.detailValue, { 
                  color: dailyCompanyStats[selectedDate].attendanceRate >= 95 ? rateColors.high : 
                         dailyCompanyStats[selectedDate].attendanceRate >= 80 ? rateColors.medium : rateColors.low 
                }]}>
                  {dailyCompanyStats[selectedDate].attendanceRate}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>异常人数</Text>
                <Text style={[styles.detailValue, { color: '#faad14' }]}>
                  {dailyCompanyStats[selectedDate].abnormalCount}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noDataText}>无数据</Text>
          )}
          <View style={[styles.legendContainer, { marginTop: 16 }]}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: rateColors.high }]} />
              <Text style={styles.legendText}>≥95%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: rateColors.medium }]} />
              <Text style={styles.legendText}>80-95%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: rateColors.low }]} />
              <Text style={styles.legendText}>&lt;80%</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  segmentContainer: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noDataText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
});
