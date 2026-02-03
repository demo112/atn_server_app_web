import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { getCorrections, supplementCheckIn, supplementCheckOut, CorrectionVo, CorrectionType } from '../../services/attendance';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error';

const CorrectionScreen = () => {
  const [corrections, setCorrections] = useState<CorrectionVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    dailyRecordId: '',
    type: 'check_in' as CorrectionType,
    clockTime: '',
    remark: ''
  });

  useEffect(() => {
    fetchCorrections();
  }, []);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const res = await getCorrections({ page: 1, pageSize: 20 });
      setCorrections(res || []);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.dailyRecordId || !formData.clockTime || !formData.remark) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    try {
      const data = {
        dailyRecordId: formData.dailyRecordId,
        remark: formData.remark,
      };

      if (formData.type === 'check_in') {
        await supplementCheckIn({ ...data, checkInTime: new Date(formData.clockTime).toISOString() });
      } else {
        await supplementCheckOut({ ...data, checkOutTime: new Date(formData.clockTime).toISOString() });
      }

      Alert.alert('成功', '补卡申请提交成功');
      setModalVisible(false);
      fetchCorrections();
    } catch (error: any) {
      Alert.alert('失败', error.response?.data?.error?.message || '提交失败');
    }
  };

  const renderItem = ({ item }: { item: CorrectionVo }) => (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemType}>{item.type === 'check_in' ? '补上班卡' : '补下班卡'}</Text>
        <Text style={styles.itemTime}>
          {new Date(item.correctionTime).toLocaleString()}
        </Text>
      </View>
      <Text style={styles.itemRemark}>备注: {item.remark}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ 补卡申请</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={corrections}
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
            <Text style={styles.modalTitle}>补卡申请</Text>
            
            <Text style={styles.label}>考勤记录ID (DailyRecordId)</Text>
            <TextInput
              style={styles.input}
              value={formData.dailyRecordId}
              onChangeText={text => setFormData({...formData, dailyRecordId: text})}
              keyboardType="numeric"
              placeholder="e.g. 123"
            />

            <Text style={styles.label}>类型 (check_in/check_out)</Text>
            <TextInput
              style={styles.input}
              value={formData.type}
              onChangeText={text => setFormData({...formData, type: text as CorrectionType})}
              placeholder="check_in"
            />

            <Text style={styles.label}>补卡时间 (YYYY-MM-DD HH:mm)</Text>
            <TextInput
              style={styles.input}
              value={formData.clockTime}
              onChangeText={text => setFormData({...formData, clockTime: text})}
              placeholder="2024-01-01 09:00"
            />

            <Text style={styles.label}>原因/备注</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.remark}
              onChangeText={text => setFormData({...formData, remark: text})}
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
  itemTime: {
    color: '#666',
  },
  itemRemark: {
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
  cancelButtonText: {
    color: '#666',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CorrectionScreen;
