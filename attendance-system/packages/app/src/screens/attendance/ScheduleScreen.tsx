import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getSchedules, ScheduleVo } from '../../services/attendance';
import { authService } from '../../services/auth';
import { getUser, setUser } from '../../utils/auth';
import { logger } from '../../utils/logger';

const ScheduleScreen = () => {
  const [schedules, setSchedules] = useState<{date: string, shift?: any}[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let user = await getUser();
      
      // 如果本地没有 employeeId，尝试从服务器获取最新用户信息
      if (user && !user.employeeId) {
        try {
          const meRes = await authService.getMe();
          if (meRes.success && meRes.data) {
             // 合并新数据
             user = { ...user, ...meRes.data };
             await setUser(user);
          }
        } catch (e) {
          logger.warn('Failed to fetch user details', e);
        }
      }

      if (!user || !user.employeeId) {
        // Fallback or error handling if employeeId is missing
        logger.warn('No employeeId found for user');
        setLoading(false);
        return; 
      }

      // Get first and last day of current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Adjust to local time or keep ISO date part
      // Note: new Date(year, month, 1) creates local date
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      
      // Format as YYYY-MM-DD manually to avoid timezone issues with toISOString()
      const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const startDate = formatDate(start);
      const endDate = formatDate(end);

      const res = await getSchedules({
        employeeId: user.employeeId, 
        startDate,
        endDate
      });
      
      // Expand schedule ranges into daily items
      const expandedSchedules: {date: string, shift?: any}[] = [];
      const current = new Date(start);
      const last = new Date(end);
      
      while (current <= last) {
        const dateStr = formatDate(current);
        // Find matching schedule for this day
        const match = (res.data || []).find(s => 
          dateStr >= s.startDate && dateStr <= s.endDate
        );
        
        expandedSchedules.push({
          date: dateStr,
          shift: match?.shift
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      setSchedules(expandedSchedules);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: {date: string, shift?: any} }) => (
    <View style={styles.item}>
      <Text style={styles.date}>{item.date}</Text>
      <View style={styles.shiftInfo}>
        <Text style={styles.shiftName}>{item.shift?.name || '休息'}</Text>
        {item.shift && (
          <Text style={styles.time}>
            {item.shift.startTime} - {item.shift.endTime}
          </Text>
        )}
      </View>
    </View>
  );

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={schedules}
          renderItem={renderItem}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>本月无排班</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthButton: {
    padding: 10,
  },
  monthButtonText: {
    fontSize: 18,
    color: '#1890ff',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  shiftInfo: {
    alignItems: 'flex-end',
  },
  shiftName: {
    fontSize: 16,
    color: '#1890ff',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
  },
});

export default ScheduleScreen;
