import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Modal, ScrollView, Alert } from 'react-native';
import { Text, FAB, Surface, useTheme, Card, Chip, TextInput, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { getCorrections, supplementCheckIn, supplementCheckOut, CorrectionVo, CorrectionType } from '../../services/attendance';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/error';

const CorrectionScreen = () => {
  const theme = useTheme();
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
      logger.info('fetchCorrections result shape', { isArray: Array.isArray(res), sample: Array.isArray(res) ? res.slice(0,1) : res });
      const list = Array.isArray(res)
        ? res
        : (res && (res as any).items ? (res as any).items : []);
      setCorrections(list);
    } catch (error) {
      logger.error('fetchCorrections failed', error);
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
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip icon="clock-edit-outline" mode="outlined" style={{ borderColor: theme.colors.primary }}>
            {item.type === 'check_in' ? '补上班卡' : '补下班卡'}
          </Chip>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {new Date(item.correctionTime).toLocaleString()}
          </Text>
        </View>
        <Text variant="bodyMedium" style={{ marginTop: 12 }}>
          备注: {item.remark}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && <ActivityIndicator style={{ margin: 20 }} />}
      
      <FlatList
        data={corrections}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
            暂无补卡记录
          </Text>
        }
      />

      <FAB
        icon="plus"
        label="补卡申请"
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
            <Text variant="titleLarge" style={styles.modalTitle}>补卡申请</Text>
            
            <ScrollView contentContainerStyle={styles.form}>
              <Text variant="titleMedium">补卡类型</Text>
              <RadioButton.Group 
                onValueChange={value => setFormData({...formData, type: value as CorrectionType})} 
                value={formData.type}
              >
                <View style={styles.radioRow}>
                  <View style={styles.radioItem}>
                    <RadioButton value="check_in" />
                    <Text>补上班</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="check_out" />
                    <Text>补下班</Text>
                  </View>
                </View>
              </RadioButton.Group>

              <TextInput
                mode="outlined"
                label="关联考勤记录ID"
                value={formData.dailyRecordId}
                onChangeText={(text) => setFormData({...formData, dailyRecordId: text})}
                style={styles.input}
                keyboardType="numeric"
              />

              <TextInput
                mode="outlined"
                label="补卡时间 (YYYY-MM-DD HH:mm)"
                value={formData.clockTime}
                onChangeText={(text) => setFormData({...formData, clockTime: text})}
                placeholder="2024-01-01 09:00"
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="补卡原因"
                value={formData.remark}
                onChangeText={(text) => setFormData({...formData, remark: text})}
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
    paddingBottom: 80,
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
  radioRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
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

export default CorrectionScreen;
