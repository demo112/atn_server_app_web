import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Card, Chip, IconButton } from 'react-native-paper';
import { getDailyRecords, DailyRecordVo } from '../../services/attendance';
import { useNavigation } from '@react-navigation/native';
import { logger } from '../../utils/logger';
import { withAlpha } from '../../utils/colors';

const HistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
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
      case 'normal': return theme.colors.primary;
      case 'late': return theme.colors.error;
      case 'early_leave': return theme.colors.error;
      case 'absent': return theme.colors.error;
      default: return theme.colors.secondary;
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

  const renderItem = ({ item }: { item: DailyRecordVo }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {item.workDate}
            </Text>
            <Chip 
              mode="flat" 
              style={{ backgroundColor: withAlpha(statusColor, 0.12) }} 
              textStyle={{ color: statusColor }}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>
          
          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>签到</Text>
              <Text variant="bodyLarge">
                {item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : '-'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.timeRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>签退</Text>
              <Text variant="bodyLarge">
                {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : '-'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={2}>
        <IconButton icon="chevron-left" onPress={() => changeMonth(-1)} />
        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
          {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <IconButton 
            icon="calendar" 
            testID="calendar-btn"
            onPress={() => navigation.navigate('AttendanceCalendar' as never)} 
          />
          <IconButton icon="chevron-right" onPress={() => changeMonth(1)} />
        </View>
      </Surface>

      {loading ? (
        <ActivityIndicator style={{ margin: 20 }} />
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
              本月暂无记录
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  timeRow: {
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
  },
});

export default HistoryScreen;
