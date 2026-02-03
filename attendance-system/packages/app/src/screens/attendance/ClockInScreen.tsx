import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { clockIn, getClockRecords, ClockRecord, CreateClockDto } from '../../services/attendance';
import { getUser } from '../../utils/auth';

const ClockInScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [employeeId, setEmployeeId] = useState<number>(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load user info
  useEffect(() => {
    const loadUser = async () => {
      const user = await getUser();
      if (user && user.employeeId) {
        setEmployeeId(user.employeeId);
      }
    };
    loadUser();
  }, []);

  // Load today's records
  useEffect(() => {
    loadTodayRecords();
  }, []);

  const loadTodayRecords = async () => {
    const now = new Date();
    const start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const end = new Date(now.setHours(23, 59, 59, 999)).toISOString();

    try {
      const res = await getClockRecords({ startTime: start, endTime: end });
      setRecords(res.data || []);
    } catch (error) {
      // console.error('Failed to load records', error);
    }
  };

  const handleClockIn = async (type: 'sign_in' | 'sign_out') => {
    setLoading(true);
    try {
      const dto: CreateClockDto = {
        employeeId: employeeId, // Will be overridden by server but required by DTO
        clockTime: new Date().toISOString(),
        type,
        source: 'app',
        location: 'Mock Location: Office', // In real app, use Expo Location
        deviceInfo: 'App',
      };
      await clockIn(dto);
      Alert.alert('成功', `打卡成功 (${type === 'sign_in' ? '上班' : '下班'})`);
      loadTodayRecords();
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || '打卡失败';
      Alert.alert('失败', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderRecord = ({ item }: { item: ClockRecord }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordTime}>
        {new Date(item.clockTime).toLocaleTimeString()}
      </Text>
      <Text style={[styles.recordType, item.type === 'sign_in' ? styles.typeIn : styles.typeOut]}>
        {item.type === 'sign_in' ? '上班' : '下班'}
      </Text>
      <Text style={styles.recordLocation}>{item.location || '未知位置'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timeText}>
          {currentTime.toLocaleTimeString()}
        </Text>
        <Text style={styles.dateText}>
          {currentTime.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.clockButton, styles.buttonIn]}
          onPress={() => handleClockIn('sign_in')}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>上班打卡</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.clockButton, styles.buttonOut]}
          onPress={() => handleClockIn('sign_out')}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>下班打卡</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>今日记录</Text>
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={<Text style={styles.emptyText}>暂无打卡记录</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  timeText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  clockButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonIn: {
    backgroundColor: '#4caf50',
  },
  buttonOut: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recordTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  recordType: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  typeIn: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  typeOut: {
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
  },
  recordLocation: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default ClockInScreen;
