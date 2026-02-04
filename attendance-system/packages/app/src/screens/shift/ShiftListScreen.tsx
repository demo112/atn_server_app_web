import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Shift } from '../../types/shift';

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
  const navigation = useNavigation();
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShifts = useMemo(() => {
    return shifts.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${s.startTime}-${s.endTime}`.includes(searchTerm)
    );
  }, [shifts, searchTerm]);

  const renderItem = ({ item }: { item: Shift }) => (
    <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ShiftEdit' as never, { shift: item, id: item.id } as never)}
    >
      <View>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.startTime}-{item.endTime}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
                style={styles.searchInput}
                placeholder="搜索班次"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ShiftEdit' as never)}
        >
            <MaterialIcons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>添加班次</Text>
        </TouchableOpacity>

        <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
                班次列表 <Text style={styles.count}>({shifts.length}/100)</Text>
            </Text>
        </View>

        <FlatList
            data={filteredShifts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <MaterialIcons name="search-off" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>未找到相关班次</Text>
                </View>
            }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, height: 40 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A' },
    content: { flex: 1, padding: 16 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
    listHeader: { marginBottom: 12 },
    listTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
    count: { color: '#10B981', fontWeight: '600' },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
    cardSubtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    listContent: { paddingBottom: 20 },
    emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyText: { color: '#94A3B8', marginTop: 8, fontSize: 14 }
});
