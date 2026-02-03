import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { getLeaves, createLeave, cancelLeave, LeaveVo, CreateLeaveDto } from '../../services/attendance';
import { LeaveType } from '@attendance/shared';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error';

const LeaveScreen = () => {
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
      setLeaves(res.data || []);
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

    try {
      await createLeave({
        employeeId: 0, // Server will override
        type: formData.type,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        reason: formData.reason!,
      });
      Alert.alert('成功', '申请提交成功');
      setModalVisible(false);
      fetchLeaves();
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
              fetchLeaves();
            } catch (error) {
              Alert.alert('失败', getErrorMessage(error));
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: LeaveVo }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemType}>{item.type}</Text>
        <Text style={[styles.itemStatus, 
          item.status === 'approved' ? styles.statusGreen : 
          item.status === 'rejected' ? styles.statusRed : styles.statusGray
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.itemTime}>
        {new Date(item.startTime).toLocaleDateString()} - {new Date(item.endTime).toLocaleDateString()}
      </Text>
      <Text style={styles.itemReason}>{item.reason}</Text>
      {item.status === 'pending' && (
        <TouchableOpacity 
          style={styles.revokeButton}
          onPress={() => handleCancel(item.id)}
        >
          <Text style={styles.revokeButtonText}>撤销</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ 新申请</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={leaves}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>申请请假/出差</Text>
            
            <Text style={styles.label}>类型 (annual/sick/personal/business_trip)</Text>
            <TextInput
              style={styles.input}
              value={formData.type}
              onChangeText={text => setFormData({...formData, type: text as LeaveType})}
              placeholder="e.g. annual"
            />

            <Text style={styles.label}>开始时间 (YYYY-MM-DD HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={formData.startTime}
              onChangeText={text => setFormData({...formData, startTime: text})}
              placeholder="2024-01-01 09:00"
            />

            <Text style={styles.label}>结束时间 (YYYY-MM-DD HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={formData.endTime}
              onChangeText={text => setFormData({...formData, endTime: text})}
              placeholder="2024-01-01 18:00"
            />

            <Text style={styles.label}>原因</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.reason}
              onChangeText={text => setFormData({...formData, reason: text})}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>提交</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  addButton: {
    margin: 16,
    backgroundColor: '#1890ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemStatus: {
    fontSize: 14,
  },
  statusGreen: { color: 'green' },
  statusRed: { color: 'red' },
  statusGray: { color: 'gray' },
  itemTime: {
    color: '#666',
    marginBottom: 4,
  },
  itemReason: {
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    marginBottom: 4,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  submitButton: {
    backgroundColor: '#1890ff',
  },
  revokeButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff4d4f',
    borderRadius: 4,
  },
  revokeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default LeaveScreen;
