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
      const passedShift = route.params.shift as any; // Cast to allow accessing properties from Shift interface
      
      // Calculate default ranges based on start/end time
      const defaultStartTime = passedShift.startTime || '09:00';
      const defaultEndTime = passedShift.endTime || '18:00';
      
      // Simple helper to offset time by hours (simplified for demo)
      const offsetTime = (time: string, offsetHours: number) => {
          const [h, m] = time.split(':').map(Number);
          let newH = h + offsetHours;
          if (newH < 0) newH += 24;
          if (newH > 23) newH -= 24;
          return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };

      const defaultSignInStart = offsetTime(defaultStartTime, -1);
      const defaultSignInEnd = offsetTime(defaultStartTime, 1);
      const defaultSignOutStart = offsetTime(defaultEndTime, -1);
      const defaultSignOutEnd = offsetTime(defaultEndTime, 1);

      // Construct full settings ensuring segments exist
      // 增强鲁棒性：确保 segments 是数组且不为空
      const hasValidSegments = passedShift.segments && Array.isArray(passedShift.segments) && passedShift.segments.length > 0;
      
      const segments = hasValidSegments
          ? passedShift.segments 
          : [{
              id: '1',
              startTime: defaultStartTime,
              endTime: defaultEndTime,
              mustSignIn: true,
              signInRange: `${defaultSignInStart}-${defaultSignInEnd}`,
              mustSignOut: true,
              signOutRange: `${defaultSignOutStart}-${defaultSignOutEnd}`,
          }];

      console.log('[ShiftEdit] Initializing shift:', {
          passedName: passedShift.name,
          hasValidSegments,
          finalSegmentsCount: segments.length
      });

      setShift({
          name: passedShift.name || '',
          segments: segments,
          allowedLateMinutes: passedShift.allowedLateMinutes || 0,
          allowedEarlyLeaveMinutes: passedShift.allowedEarlyLeaveMinutes || 0,
      });
    } else if (route.params?.id) {
        // TODO: fetch shift by id if not passed directly
        // For now, assume shift data is passed or use mock
        // If we are just mocking the list click, we can pass a mock object from the list
    }
  }, [route.params]);

  const updateSegment = (index: number, updated: TimeSegment) => {
    const newSegments = [...shift.segments];
    newSegments[index] = updated;
    setShift({ ...shift, segments: newSegments });
  };

  const handleSave = () => {
    if (!shift.name) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? '编辑班次' : '添加班次'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Name Input */}
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

        {/* Daily Check-ins Selector */}
        <View style={styles.card}>
            <Text style={styles.label}>每日打卡次数</Text>
            <View style={styles.sessionSelector}>
                {[1, 2, 3].map((count) => (
                    <TouchableOpacity
                        key={count}
                        style={[
                            styles.sessionOption,
                            shift.segments.length === count && styles.sessionOptionSelected
                        ]}
                        onPress={() => {
                            if (shift.segments.length === count) return;
                            let newSegments = [...shift.segments];
                            if (count > newSegments.length) {
                                // Add segments
                                for (let i = newSegments.length; i < count; i++) {
                                    newSegments.push({
                                        id: (i + 1).toString(),
                                        startTime: '09:00',
                                        endTime: '17:00',
                                        mustSignIn: true,
                                        signInRange: '08:00-10:00',
                                        mustSignOut: true,
                                        signOutRange: '17:00-19:00',
                                    });
                                }
                            } else {
                                // Remove segments
                                newSegments = newSegments.slice(0, count);
                            }
                            setShift({ ...shift, segments: newSegments });
                        }}
                    >
                        <View style={[
                            styles.radioButton,
                            shift.segments.length === count && styles.radioButtonSelected
                        ]}>
                            {shift.segments.length === count && <View style={styles.radioButtonInner} />}
                        </View>
                        <Text style={[
                            styles.sessionText,
                            shift.segments.length === count && styles.sessionTextSelected
                        ]}>
                            {count} 次
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        {/* Segments */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
                上下班设置
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

        {/* Absence Settings */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>缺勤设置</Text>
        </View>
        <View style={styles.card}>
            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 16, marginBottom: 16 }]}>
                <Text style={styles.rowLabel}>允许迟到时长</Text>
                <View style={styles.rowValue}>
                    <Text style={styles.valueText}>{shift.allowedLateMinutes}分钟</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.row}>
                <Text style={styles.rowLabel}>允许早退时长</Text>
                <View style={styles.rowValue}>
                    <Text style={styles.valueText}>{shift.allowedEarlyLeaveMinutes}分钟</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#CBD5E1" />
                </View>
            </TouchableOpacity>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#0F172A' },
    content: { flex: 1, padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, borderWidth: 1, borderColor: '#F1F5F9' },
    label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 8 },
    required: { color: '#EF4444', marginRight: 4 },
    input: { fontSize: 17, color: '#0F172A', fontWeight: '500', padding: 0 },
    sessionSelector: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
    sessionOption: { flexDirection: 'row', alignItems: 'center' },
    sessionOptionSelected: {},
    radioButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
    radioButtonSelected: { borderColor: '#007AFF' },
    radioButtonInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
    sessionText: { fontSize: 15, color: '#64748B' },
    sessionTextSelected: { color: '#0F172A', fontWeight: '500' },
    sectionHeader: { paddingHorizontal: 4, marginBottom: 8, marginTop: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '500', color: '#64748B' },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginLeft: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    rowLabel: { fontSize: 15, color: '#334155' },
    rowValue: { flexDirection: 'row', alignItems: 'center' },
    valueText: { fontSize: 15, color: '#64748B', marginRight: 4 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 32 },
    saveButton: { backgroundColor: '#007AFF', borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    saveButtonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' }
});
