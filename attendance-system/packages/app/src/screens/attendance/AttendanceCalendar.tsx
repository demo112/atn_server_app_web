import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import dayjs from 'dayjs';
import { CalendarDailyVo, AttendanceStatus } from '@attendance/shared';
import { getCalendar } from '../../services/statistics';
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

type MarkedDates = Record<string, MarkingProps>;

export default function AttendanceCalendar() {
  const { user } = useAuth();
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    normal: 0,
    abnormal: 0,
    leave: 0,
  });

  const loadCalendarData = async (monthStr: string) => {
    try {
      const date = dayjs(monthStr);
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

      // Ensure selected date is marked as selected
      if (marks[selectedDate]) {
        marks[selectedDate].selected = true;
      } else {
        marks[selectedDate] = { selected: true, selectedColor: '#1890ff' };
      }

      setMarkedDates(marks);
      setStats({
        normal: normalCount,
        abnormal: abnormalCount,
        leave: leaveCount,
      });
    } catch (error) {
      logger.error('Failed to load calendar data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarData(currentMonth);
    setRefreshing(false);
  }, [currentMonth, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadCalendarData(currentMonth);
    }, [currentMonth, user?.id])
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
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: statusColors.normal }]}>{stats.normal}</Text>
              <Text style={styles.statLabel}>正常</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: statusColors.late }]}>{stats.abnormal}</Text>
              <Text style={styles.statLabel}>异常</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: statusColors.leave }]}>{stats.leave}</Text>
              <Text style={styles.statLabel}>请假/出差</Text>
            </View>
          </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
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
    marginRight: 15,
    marginBottom: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
