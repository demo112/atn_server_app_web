import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, useTheme, Searchbar, Avatar, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Shift, TimeSlot } from '../../types/shift';

const generateTimeSlot = (id: string, start: string, end: string): TimeSlot => ({
  id,
  startTime: start,
  endTime: end,
  mustCheckIn: true,
  checkInWindow: '08:30-09:30',
  mustCheckOut: true,
  checkOutWindow: '17:30-18:30',
});

const INITIAL_SHIFTS: Shift[] = [
  {
    id: '1',
    name: '默认班次_1',
    timeSlots: [generateTimeSlot('ts1', '09:00', '18:00')]
  },
  {
    id: '2',
    name: '早班',
    timeSlots: [generateTimeSlot('ts2', '07:00', '15:00')]
  },
  {
    id: '3',
    name: '两头班',
    timeSlots: [
      generateTimeSlot('ts3a', '09:00', '12:00'),
      generateTimeSlot('ts3b', '14:00', '18:00')
    ]
  },
];

export default function ShiftListScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShifts = useMemo(() => {
    return shifts.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shifts, searchTerm]);

  // Navigate to ShiftEditScreen for adding a new shift
  const handleAddShift = () => {
    (navigation as any).navigate('ShiftEdit', { shift: null });
  };

  // Navigate to ShiftEditScreen for editing an existing shift
  const handleEditShift = (shift: Shift) => {
    (navigation as any).navigate('ShiftEdit', { shift });
  };

  const renderItem = ({ item }: { item: Shift }) => (
    <Card 
      style={styles.card} 
      mode="elevated"
      onPress={() => handleEditShift(item)}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon 
          size={40} 
          icon="clock-outline" 
          style={{ backgroundColor: theme.colors.tertiaryContainer }}
          color={theme.colors.onTertiaryContainer}
        />
        <View style={styles.info}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <View style={styles.timeSlotsContainer}>
            {item.timeSlots.map((slot, index) => (
              <Text key={slot.id} variant="bodyMedium" style={{ color: theme.colors.secondary }}>
                {slot.startTime} - {slot.endTime}
                {index < item.timeSlots.length - 1 ? ', ' : ''}
              </Text>
             ))}
          </View>
        </View>
        <IconButton icon="chevron-right" size={20} />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <IconButton icon="chevron-left" size={24} onPress={() => (navigation as any).goBack()} />
          <Text variant="titleLarge" style={[styles.headerTitle, { flex: 1 }]}>班次设置</Text>
          <View style={{ width: 48 }} />
        </View>
        <Searchbar
          placeholder="搜索班次"
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchbar}
          elevation={0}
        />
      </View>

      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleAddShift}
          icon="plus"
          style={styles.addButton}
          contentStyle={styles.addButtonContent}
        >
          添加班次
        </Button>
      </View>

      <View style={styles.listHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
          班次列表 <Text style={{ color: theme.colors.primary }}>({filteredShifts.length})</Text>
        </Text>
      </View>

      <FlatList
        data={filteredShifts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
            未找到相关班次
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: 'white',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  searchbar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  addButton: {
    borderRadius: 8,
  },
  addButtonContent: {
    height: 48,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  list: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
