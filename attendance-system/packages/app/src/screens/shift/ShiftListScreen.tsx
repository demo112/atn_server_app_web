import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, useTheme, Searchbar, Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Shift } from '../../types/shift';
import AddShiftModal from '../../components/shift/AddShiftModal';

const INITIAL_SHIFTS: Shift[] = [
  { id: '7', name: '默认班次_7', startTime: '09:00', endTime: '18:00' },
  { id: '6', name: '默认班次_6', startTime: '09:00', endTime: '18:00' },
  { id: '5', name: '默认班次_5', startTime: '09:00', endTime: '18:00' },
  { id: '4', name: '默认班次_4', startTime: '09:00', endTime: '18:00' },
  { id: '3', name: '默认班次_3', startTime: '09:00', endTime: '18:00' },
  { id: '2', name: '默认班次_2', startTime: '09:00', endTime: '18:00' },
  { id: '1', name: '默认班次_1', startTime: '09:00', endTime: '18:00' },
];

export default function ShiftListScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const filteredShifts = useMemo(() => {
    return shifts.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.startTime}-${s.endTime}`.includes(searchTerm)
    );
  }, [shifts, searchTerm]);

  const handleAddShift = (newShift: Omit<Shift, 'id'>) => {
    const shift: Shift = {
      ...newShift,
      id: Date.now().toString()
    };
    setShifts([shift, ...shifts]);
  };

  const renderItem = ({ item }: { item: Shift }) => (
    <Card 
      style={styles.card} 
      mode="elevated"
      onPress={() => (navigation as any).navigate('ShiftEdit', { shift: item, id: item.id })}
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
          <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={20} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索班次"
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      <View style={styles.listHeader}>
        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
          班次列表 ({shifts.length})
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

      <FAB
        icon="plus"
        label="添加班次"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setIsModalVisible(true)}
      />

      <AddShiftModal 
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddShift}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    backgroundColor: 'white',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
