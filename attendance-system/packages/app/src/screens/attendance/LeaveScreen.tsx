import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert, Modal } from 'react-native';
import { Text, FAB, Surface, useTheme, Card, Chip, TextInput, Button, ActivityIndicator, RadioButton } from 'react-native-paper';
import { getLeaves, createLeave, cancelLeave, LeaveVo, CreateLeaveDto } from '../../services/attendance';
import { getEmployees } from '../../services/employee';
import { useAuth } from '../../utils/auth';
import { LeaveType, EmployeeVo } from '@attendance/shared';
import { logger } from '../../utils/logger';
import { withAlpha } from '../../utils/colors';
import { authService } from '../../services/auth';
import { getErrorMessage } from '../../utils/error';

const LeaveScreen = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Employee selection state
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeVo | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<CreateLeaveDto>>({
    type: LeaveType.annual,
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    logger.info('LeaveScreen user state:', user);
    
    // Refresh user info to ensure role is up-to-date
    authService.getMe().then(res => {
      if (res.role === 'admin') {
        setIsAdmin(true);
        fetchEmployees();
      } else {
        setIsAdmin(false);
      }
    }).catch(err => {
      logger.error('Failed to refresh user info', err);
      // Fallback to local user state
      setIsAdmin(user?.role === 'admin');
    });

    fetchLeaves();
    
    if (user?.role === 'admin') {
      setIsAdmin(true);
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ page: 1, pageSize: 100 }); // Load enough employees
      setEmployees(res.items || []);
    } catch (error) {
      logger.error('Failed to fetch employees', error);
    }
  };

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

    if (isAdmin && !selectedEmployee) {
      Alert.alert('提示', '管理员必须选择员工');
      return;
    }

    try {
      await createLeave({
        employeeId: selectedEmployee?.id || 0,
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
    const statusText =
      item.status === 'approved' ? '已通过' :
      item.status === 'rejected' ? '已拒绝' :
      '审核中';

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.type}</Text>
            <Chip 
              mode="flat" 
              style={{ backgroundColor: withAlpha(statusColor, 0.12) }} 
              textStyle={{ color: statusColor }}
            >
              {statusText}
            </Chip>
          </View>
          <Text variant="bodyMedium" style={{ marginTop: 8 }}>
            {new Date(item.startTime).toLocaleString()} - {new Date(item.endTime).toLocaleString()}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8, marginBottom: 8, color: theme.colors.secondary }}>
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
        label="+ 新申请"
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
              {isAdmin && (
                <View style={{ marginBottom: 16 }}>
                  <Text variant="titleMedium">员工</Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => setEmployeeModalVisible(true)}
                    style={{ marginTop: 8 }}
                  >
                    {selectedEmployee ? `${selectedEmployee.name} (${selectedEmployee.employeeNo})` : '选择员工'}
                  </Button>
                </View>
              )}

              <Text variant="titleMedium">类型（年假、病假等）</Text>
              <RadioButton.Group
                onValueChange={value => setFormData({ ...formData, type: value as LeaveType })}
                value={formData.type as LeaveType}
              >
                <View style={styles.radioRow}>
                  <View style={styles.radioItem}>
                    <RadioButton value={LeaveType.annual} testID="input-type-annual" />
                    <Text>年假</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value={LeaveType.sick} testID="input-type-sick" />
                    <Text>病假</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value={LeaveType.personal} testID="input-type-personal" />
                    <Text>事假</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value={LeaveType.business_trip} testID="input-type-business" />
                    <Text>出差</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value={LeaveType.other} testID="input-type-other" />
                    <Text>其他</Text>
                  </View>
                </View>
              </RadioButton.Group>
              <TextInput
                mode="outlined"
                label="开始时间 (YYYY-MM-DD HH:mm)"
                value={formData.startTime}
                onChangeText={(text) => setFormData({...formData, startTime: text})}
                placeholder="2024-01-01 09:00"
                style={styles.input}
                testID="input-startTime"
              />
              <TextInput
                mode="outlined"
                label="结束时间 (YYYY-MM-DD HH:mm)"
                value={formData.endTime}
                onChangeText={(text) => setFormData({...formData, endTime: text})}
                placeholder="2024-01-01 18:00"
                style={styles.input}
                testID="input-endTime"
              />
              <TextInput
                mode="outlined"
                label="原因"
                value={formData.reason}
                onChangeText={(text) => setFormData({...formData, reason: text})}
                multiline
                numberOfLines={3}
                style={styles.input}
                testID="input-reason"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.modalButton}>取消</Button>
              <Button mode="contained" onPress={handleSubmit} style={styles.modalButton}>提交</Button>
            </View>
          </Surface>
        </View>
      </Modal>

      <Modal
        visible={employeeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEmployeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>选择员工</Text>
            <FlatList
              data={employees}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <Card 
                  style={{ marginBottom: 8 }} 
                  onPress={() => {
                    setSelectedEmployee(item);
                    setEmployeeModalVisible(false);
                  }}
                >
                  <Card.Content>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text variant="bodyMedium">{item.employeeNo} | {item.deptName || '无部门'}</Text>
                  </Card.Content>
                </Card>
              )}
              style={{ maxHeight: 400 }}
            />
            <Button mode="outlined" onPress={() => setEmployeeModalVisible(false)} style={{ marginTop: 16 }}>
              取消
            </Button>
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
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
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
