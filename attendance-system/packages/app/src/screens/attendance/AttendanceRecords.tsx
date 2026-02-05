import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Searchbar, Button, Chip, Modal, Portal, Provider, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { DailyRecordVo, AttendanceStatus } from '@attendance/shared';
import { getDailyRecordDetails } from '../../services/statistics';
import { useAuth } from '../../utils/auth';
import { logger } from '../../utils/logger';
import { withAlpha } from '../../utils/colors';

const statusMap: Record<AttendanceStatus, { text: string; color: string }> = {
  normal: { text: '正常', color: '#52c41a' },
  late: { text: '迟到', color: '#faad14' },
  early_leave: { text: '早退', color: '#faad14' },
  absent: { text: '缺勤', color: '#ff4d4f' },
  leave: { text: '请假', color: '#1890ff' },
  business_trip: { text: '出差', color: '#13c2c2' },
};

export default function AttendanceRecords() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyRecordVo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<AttendanceStatus | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date(dayjs().startOf('month').valueOf()));
  const [endDate, setEndDate] = useState(new Date());
  
  // UI State
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const fetchRecords = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getDailyRecordDetails({
        page: pageNum,
        pageSize: 20,
        employeeName: searchQuery || undefined,
        status,
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
      });

      if (isRefresh) {
        setData(res.items);
      } else {
        setData(prev => [...prev, ...(res.items || [])]);
      }
      setHasMore(pageNum < (res.totalPages || 0));
      setPage(pageNum);
    } catch (error) {
      logger.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecords(1, true);
  }, [status, startDate, endDate]); // Trigger on filter change

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords(1, true);
  };

  const onEndReached = () => {
    if (hasMore && !loading) {
      fetchRecords(page + 1);
    }
  };

  const renderItem = ({ item }: { item: DailyRecordVo }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.employeeName} ({item.employeeNo})</Text>
          <Chip 
            style={{ backgroundColor: withAlpha(statusMap[item.status]?.color, 0.12) }}
            textStyle={{ color: statusMap[item.status]?.color, fontSize: 12 }}
          >
            {statusMap[item.status]?.text}
          </Chip>
        </View>
        <Text style={styles.deptText}>{item.deptName}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>日期</Text>
            <Text style={styles.value}>{item.workDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>班次</Text>
            <Text style={styles.value}>{item.shiftName || '-'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>签到</Text>
            <Text style={styles.value}>
              {item.checkInTime ? dayjs(item.checkInTime).format('HH:mm:ss') : '-'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>签退</Text>
            <Text style={styles.value}>
              {item.checkOutTime ? dayjs(item.checkOutTime).format('HH:mm:ss') : '-'}
            </Text>
          </View>
        </View>

        {(item.lateMinutes > 0 || item.earlyLeaveMinutes > 0) && (
          <View style={styles.abnormalRow}>
            {item.lateMinutes > 0 && <Text style={styles.abnormalText}>迟到 {item.lateMinutes}分</Text>}
            {item.earlyLeaveMinutes > 0 && <Text style={styles.abnormalText}>早退 {item.earlyLeaveMinutes}分</Text>}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="搜索姓名"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={() => fetchRecords(1, true)}
            style={styles.searchBar}
          />
          <Button mode="outlined" onPress={() => setShowFilterModal(true)} style={styles.filterBtn}>
            筛选
          </Button>
        </View>

        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {dayjs(startDate).format('MM-DD')} 至 {dayjs(endDate).format('MM-DD')}
          </Text>
        </View>

        <FlatList
          testID="records-list"
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.listContent}
        />

        <Portal>
          <Modal visible={showFilterModal} onDismiss={() => setShowFilterModal(false)} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>筛选条件</Text>
            
            <Text style={styles.filterLabel}>日期范围</Text>
            <View style={styles.dateRow}>
              <Button mode="outlined" onPress={() => setShowStartPicker(true)}>
                {dayjs(startDate).format('YYYY-MM-DD')}
              </Button>
              <Text> - </Text>
              <Button mode="outlined" onPress={() => setShowEndPicker(true)}>
                {dayjs(endDate).format('YYYY-MM-DD')}
              </Button>
            </View>

            <Text style={styles.filterLabel}>状态</Text>
            <View style={styles.statusContainer}>
              <Chip 
                selected={status === undefined} 
                onPress={() => setStatus(undefined)}
                style={styles.statusChip}
                testID="filter-chip-all"
              >全部</Chip>
              {Object.keys(statusMap).map((key) => (
                <Chip 
                  key={key}
                  selected={status === key}
                  onPress={() => setStatus(key as AttendanceStatus)}
                  style={styles.statusChip}
                  testID={`filter-chip-${key}`}
                >{statusMap[key as AttendanceStatus].text}</Chip>
              ))}
            </View>

            <Button mode="contained" onPress={() => setShowFilterModal(false)} style={styles.confirmBtn} testID="filter-confirm-btn">
              确定
            </Button>
          </Modal>
        </Portal>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
        
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filterBtn: {
    marginLeft: 10,
  },
  dateInfo: {
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
  },
  dateText: {
    color: '#1890ff',
    fontSize: 12,
  },
  listContent: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deptText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  value: {
    fontSize: 13,
  },
  abnormalRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  abnormalText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginRight: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusChip: {
    margin: 4,
  },
  confirmBtn: {
    marginTop: 20,
  },
});
