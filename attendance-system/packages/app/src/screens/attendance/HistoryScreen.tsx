import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getDailyRecords, DailyRecordVo } from '../../services/attendance';
import { useNavigation } from '@react-navigation/native';
import { logger } from '../../utils/logger';

const HistoryScreen = () => {
  const [records, setRecords] = useState<DailyRecordVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchRecords();
  }, [currentDate]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Get first and last day of current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // Format manually to avoid timezone issues with toISOString()
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      
      const lastDay = new Date(year, month + 1, 0);
      const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      const res = await getDailyRecords({ startDate, endDate });
      setRecords(res.items || []);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'green';
      case 'late': return 'orange';
      case 'early_leave': return 'orange';
      case 'absent': return 'red';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      normal: '正常',
      late: '迟到',
      early_leave: '早退',
      absent: '缺勤',
    };
    return map[status] || status;
  };

  const renderItem = ({ item }: { item: DailyRecordVo }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.date}>{item.workDate} (ID: {item.id})</Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>签到:</Text>
        <Text style={styles.timeValue}>
          {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '-'}
        </Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>签退:</Text>
        <Text style={styles.timeValue}>
          {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '-'}
        </Text>
      </View>
    </View>
  );

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
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>本月无记录</Text>}
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
    backgroundColor: 'white',
    marginBottom: 10,
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
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timeLabel: {
    width: 50,
    color: '#666',
  },
  timeValue: {
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});

export default HistoryScreen;
