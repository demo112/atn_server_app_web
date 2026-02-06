import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Surface, useTheme, ActivityIndicator, Avatar } from 'react-native-paper';
import { clockIn, getClockRecords, ClockRecord, CreateClockDto } from '../../services/attendance';
import { getUser } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error';

const ClockInScreen = () => {
  const theme = useTheme();
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
      setRecords(res || []);
    } catch (error) {
      logger.error('Failed to load records', error);
    }
  };

  const handleClockIn = async (type: 'sign_in' | 'sign_out') => {
    setLoading(true);
    try {
      const dto: CreateClockDto = {
        employeeId: employeeId,
        clockTime: new Date().toISOString(),
        type,
        source: 'app',
        location: { address: 'Mock Location: Office', latitude: 0, longitude: 0 },
        deviceInfo: { deviceId: 'mock-device', model: 'App' },
      };
      await clockIn(dto);
      Alert.alert('成功', `打卡成功 (${type === 'sign_in' ? '上班' : '下班'})`, [{ text: '确定' }]);
      loadTodayRecords();
    } catch (error) {
      const msg = getErrorMessage(error);
      Alert.alert('失败', msg, [{ text: '确定' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderRecord = ({ item }: { item: ClockRecord }) => (
    <Surface style={styles.recordItem} elevation={1}>
      <View style={styles.recordRow}>
        <Avatar.Icon 
          size={32} 
          icon={item.type === 'sign_in' ? 'login' : 'logout'} 
          style={{ backgroundColor: item.type === 'sign_in' ? theme.colors.primary : theme.colors.error }}
        />
        <View style={styles.recordInfo}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {item.type === 'sign_in' ? '上班打卡' : '下班打卡'}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {new Date(item.clockTime).toLocaleTimeString()}
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.recordLocation}>
          {item.location?.address || '未知位置'}
        </Text>
      </View>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <Text variant="displayMedium" style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
          {currentTime.toLocaleTimeString()}
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onPrimary, opacity: 0.9 }}>
          {currentTime.toLocaleDateString()}
        </Text>
      </Surface>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => handleClockIn('sign_in')}
          loading={loading}
          disabled={loading}
          style={[styles.clockButton, { backgroundColor: theme.colors.primary }]}
          contentStyle={styles.buttonContent}
          icon="login"
        >
          上班打卡
        </Button>
        <Button
          mode="contained"
          onPress={() => handleClockIn('sign_out')}
          loading={loading}
          disabled={loading}
          style={[styles.clockButton, { backgroundColor: theme.colors.secondary }]}
          contentStyle={styles.buttonContent}
          icon="logout"
        >
          下班打卡
        </Button>
      </View>

      <View style={styles.listContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>今日打卡记录</Text>
        {loading && <ActivityIndicator style={{ margin: 20 }} />}
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
              暂无打卡记录
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clockButton: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  buttonContent: {
    height: 56,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  recordItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recordLocation: {
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default ClockInScreen;
