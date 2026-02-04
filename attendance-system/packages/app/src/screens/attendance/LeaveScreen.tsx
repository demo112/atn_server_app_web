import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert, Modal } from 'react-native';
import { Text, FAB, Surface, useTheme, Card, Chip, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { getLeaves, createLeave, cancelLeave, LeaveVo, CreateLeaveDto } from '../../services/attendance';
import { LeaveType } from '@attendance/shared';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error';

const LeaveScreen = () => {
  const theme = useTheme();
  const [leaves, setLeaves] = useState<LeaveVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateLeaveDto>>({
    type: LeaveType.annual,
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await getLeaves({ page: 1, pageSize: 20 });
      setLeaves(res || []);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.startTime || !formData.endTime || !formData.reason) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (new Date(formData.startTime) > new Date(formData.endTime)) {
      Alert.alert('提示', '结束时间不能早于开始时间');
      return;
    }

    try {
      await createLeave({
        employeeId: 0,
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason!,
      });
      Alert.alert('成功', '申请提交成功');
      setModalVisible(false);
      await fetchLeaves();
    } catch (error) {
      Alert.alert('失败', getErrorMessage(error));
    }
  };

  const handleCancel = async (id: number) => {
    Alert.alert(
      '确认撤销',
      '确定要撤销这条请假申请吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelLeave(id);
              Alert.alert('成功', '撤销成功');
              await fetchLeaves();
            } catch (error) {
              Alert.alert('失败', getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: LeaveVo }) => {
    const statusColor = 
      item.status === 'approved' ? theme.colors.primary :
      item.status === 'rejected' ? theme.colors.error :
      theme.colors.secondary;

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.type}</Text>
            <Chip 
              mode="flat" 
              style={{ backgroundColor: statusColor + '20' }} 
              textStyle={{ color: statusColor }}
            >
              {item.status}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 4, color: theme.colors.secondary }}>
            原因: {item.reason}
          </Text>
        </Card.Content>
        {item.status === 'pending' && (
          <Card.Actions>
            <Button onPress={() => handleCancel(item.id)} textColor={theme.colors.error}>撤销</Button>
          </Card.Actions>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && <ActivityIndicator style={{ margin: 20 }} />}
      <FlatList
        data={leaves}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
            暂无申请记录
          </Text>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => setModalVisible(true)}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>新建申请</Text>
            
            <ScrollView contentContainerStyle={styles.form}>
              <TextInput
                mode="outlined"
                label="类型 (annual, sick, etc.)"
                value={formData.type}
                onChangeText={(text) => setFormData({...formData, type: text as LeaveType})}
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="开始时间 (YYYY-MM-DD HH:mm)"
                value={formData.startTime}
                onChangeText={(text) => setFormData({...formData, startTime: text})}
                placeholder="2024-01-01 09:00"
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="结束时间 (YYYY-MM-DD HH:mm)"
                value={formData.endTime}
                onChangeText={(text) => setFormData({...formData, endTime: text})}
                placeholder="2024-01-01 18:00"
                style={styles.input}
              />
              <TextInput
                mode="outlined"
                label="原因"
                value={formData.reason}
                onChangeText={(text) => setFormData({...formData, reason: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.modalButton}>取消</Button>
              <Button mode="contained" onPress={handleSubmit} style={styles.modalButton}>提交</Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
  },
});

export default LeaveScreen;
