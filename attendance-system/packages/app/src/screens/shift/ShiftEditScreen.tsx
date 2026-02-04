import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ShiftSettings, TimeSegment } from '../../types/shift';
import SegmentCard from '../../components/shift/SegmentCard';

type RootStackParamList = {
  ShiftEdit: { shift?: ShiftSettings; id?: string } | undefined;
};

type ShiftEditScreenRouteProp = RouteProp<RootStackParamList, 'ShiftEdit'>;

export default function ShiftEditScreen() {
  const navigation = useNavigation();
  const route = useRoute<ShiftEditScreenRouteProp>();
  const isEditMode = !!route.params?.shift || !!route.params?.id;
  
  const [shift, setShift] = useState<ShiftSettings>({
    name: '',
    segments: [
      {
        id: '1',
        startTime: '09:00',
        endTime: '17:00',
        mustSignIn: true,
        signInRange: '08:30-09:30',
        mustSignOut: true,
        signOutRange: '16:30-17:30',
      }
    ],
    allowedLateMinutes: 0,
    allowedEarlyLeaveMinutes: 0,
  });

  useEffect(() => {
    if (route.params?.shift) {
      setShift(route.params.shift);
    }
  }, [route.params]);

  const addSegment = () => {
    if (shift.segments.length >= 3) return;
    
    const newId = (shift.segments.length + 1).toString();
    setShift({
      ...shift,
      segments: [
        ...shift.segments,
        {
          id: newId,
          startTime: '09:00',
          endTime: '17:00',
          mustSignIn: true,
          signInRange: '08:30-09:30',
          mustSignOut: true,
          signOutRange: '16:30-17:30',
        }
      ]
    });
  };

  const updateSegment = (index: number, updated: TimeSegment) => {
    const newSegments = [...shift.segments];
    newSegments[index] = updated;
    setShift({ ...shift, segments: newSegments });
  };

  const handleSave = () => {
    if (!shift.name.trim()) {
      Alert.alert('提示', '请输入班次名称');
      return;
    }
    console.log('Saving Shift Config:', shift);
    Alert.alert('成功', '配置已成功保存！', [
      { text: '确定', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '编辑班次' : '添加班次'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Shift Name Input Card */}
        <View style={styles.card}>
            <Text style={styles.label}>
                <Text style={styles.required}>*</Text>班次名称
            </Text>
            <TextInput
                style={styles.input}
                value={shift.name}
                onChangeText={(text) => setShift({ ...shift, name: text })}
                placeholder="请输入"
                placeholderTextColor="#94A3B8"
            />
        </View>

        {/* Time Segments */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
                上下班设置 ({shift.segments.length}/3)
            </Text>
        </View>

        {shift.segments.map((seg, idx) => (
            <SegmentCard
                key={seg.id}
                segment={seg}
                index={idx}
                onUpdate={(updated) => updateSegment(idx, updated)}
            />
        ))}

        {shift.segments.length < 3 && (
            <TouchableOpacity 
                style={styles.addButton}
                onPress={addSegment}
                activeOpacity={0.7}
            >
                <MaterialIcons name="add" size={24} color="#007AFF" />
                <Text style={styles.addButtonText}>添加时间段</Text>
            </TouchableOpacity>
        )}

        {/* Absence Settings */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>缺勤设置</Text>
        </View>
        <View style={styles.card}>
            <TouchableOpacity 
                style={[styles.row, { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16, marginBottom: 16 }]}
                onPress={() => console.log('Edit allowed late minutes')}
            >
                <Text style={styles.rowLabel}>允许迟到时长</Text>
                <View style={styles.rowValue}>
                    <Text style={styles.valueText}>{shift.allowedLateMinutes}分钟</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.row}
                onPress={() => console.log('Edit allowed early leave minutes')}
            >
                <Text style={styles.rowLabel}>允许早退时长</Text>
                <View style={styles.rowValue}>
                    <Text style={styles.valueText}>{shift.allowedEarlyLeaveMinutes}分钟</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
            <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#F1F5F9' 
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
    content: { flex: 1, padding: 16 },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 24, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 2, 
        elevation: 2, 
        borderWidth: 1, 
        borderColor: '#F1F5F9' 
    },
    label: { fontSize: 13, fontWeight: '500', color: '#64748B', marginBottom: 8 },
    required: { color: '#EF4444', marginRight: 4 },
    input: { fontSize: 17, color: '#0F172A', fontWeight: '500', padding: 0 },
    sectionHeader: { paddingHorizontal: 4, marginBottom: 12 },
    sectionTitle: { fontSize: 13, fontWeight: '500', color: '#64748B' },
    addButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#fff', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 24, 
        borderWidth: 1, 
        borderColor: '#E2E8F0',
        borderStyle: 'dashed'
    },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginLeft: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontSize: 15, color: '#334155' },
    rowValue: { flexDirection: 'row', alignItems: 'center' },
    valueText: { fontSize: 15, color: '#64748B', marginRight: 4 },
    footer: { 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: 16, 
        backgroundColor: '#fff', 
        borderTopWidth: 1, 
        borderTopColor: '#F1F5F9', 
        paddingBottom: 34 // Safe area
    },
    saveButton: { 
        backgroundColor: '#007AFF', 
        borderRadius: 14, 
        paddingVertical: 16, 
        alignItems: 'center', 
        shadowColor: '#007AFF', 
        shadowOffset: { width: 0, height: 4 }, 
        shadowOpacity: 0.2, 
        shadowRadius: 8, 
        elevation: 4 
    },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' }
});
