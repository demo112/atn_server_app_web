import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView, Platform } from 'react-native';
import { AxiosError } from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CreateUserDto, UserRole, UserStatus, DepartmentVO, CreateEmployeeDto } from '@attendance/shared';
import { createUser, updateUser, getUserById } from '../../../services/user';
import { createEmployee } from '../../../services/employee';
import { getDepartmentTree } from '../../../services/department';
import { logger } from '../../../utils/logger';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Portal, Modal, List, Button, ActivityIndicator } from 'react-native-paper';
import dayjs from 'dayjs';

const DepartmentPicker = ({ visible, onDismiss, onSelect }: { visible: boolean; onDismiss: () => void; onSelect: (id: number, name: string) => void }) => {
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      setDepartments(res);
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '加载部门失败');
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: DepartmentVO, level = 0) => (
    <React.Fragment key={node.id}>
      <List.Item
        title={node.name}
        style={{ paddingLeft: level * 20 }}
        onPress={() => {
          onSelect(node.id, node.name);
          onDismiss();
        }}
        left={props => <List.Icon {...props} icon="folder" />}
      />
      {node.children?.map(child => renderNode(child, level + 1))}
    </React.Fragment>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContent}>
        <Text style={styles.modalTitle}>选择部门</Text>
        {loading ? (
          <ActivityIndicator style={{ padding: 20 }} />
        ) : (
          <ScrollView style={{ maxHeight: 400 }}>
            {departments.map(dept => renderNode(dept))}
          </ScrollView>
        )}
        <Button onPress={onDismiss} style={{ marginTop: 10 }}>取消</Button>
      </Modal>
    </Portal>
  );
};
import { z } from 'zod';

// ... existing imports ...

export const UserEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  
  const paramsSchema = z.object({
    id: z.coerce.number().optional()
  });
  const params = paramsSchema.parse(route.params || {});
  
  const isEdit = !!params.id;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [loading, setLoading] = useState(false);

  // Employee creation states
  const [createEmployeeMode, setCreateEmployeeMode] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [deptId, setDeptId] = useState<number | null>(null);
  const [deptName, setDeptName] = useState('');
  const [hireDate, setHireDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? '编辑用户' : '新增用户',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, username, password, role, status, isEdit, createEmployeeMode, employeeName, employeeNo, deptId, hireDate]);

  useEffect(() => {
    if (isEdit) {
      loadDetail();
    }
  }, [isEdit]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      if (!params.id) throw new Error('Missing ID');
      const user = await getUserById(params.id);
      setUsername(user.username);
      setRole(user.role);
      setStatus(user.status);
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '加载详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) return Alert.alert('提示', '请输入用户名');
    if (username.trim().length < 3) return Alert.alert('提示', '用户名至少需要3个字符');
    if (!isEdit && !password.trim()) return Alert.alert('提示', '请输入密码');
    if (!isEdit && password.trim().length < 6) return Alert.alert('提示', '密码至少需要6个字符');

    if (createEmployeeMode) {
      if (!employeeNo.trim()) return Alert.alert('提示', '请输入工号');
      if (!employeeName.trim()) return Alert.alert('提示', '请输入姓名');
      if (!deptId) return Alert.alert('提示', '请选择部门');
    }

    setLoading(true);
    try {
      let newEmployeeId: number | undefined;

      // 1. Create Employee if needed
      if (createEmployeeMode) {
        try {
          const empDto: CreateEmployeeDto = {
            employeeNo,
            name: employeeName,
            deptId: deptId!,
            hireDate: dayjs(hireDate).format('YYYY-MM-DD'),
          };
          const emp = await createEmployee(empDto);
          newEmployeeId = emp.id;
          logger.info('Employee created automatically', { id: emp.id });
        } catch (err: any) {
          logger.error(err);
          const { getErrorMessage } = await import('../../../utils/error');
          const msg = getErrorMessage(err);
          Alert.alert('错误', `创建人员失败: ${msg}`);
          setLoading(false);
          return; // Stop here if employee creation fails
        }
      }

      // 2. Create/Update User
      if (isEdit) {
        if (!params.id) throw new Error('Missing ID');
        const data = {
          role,
          status,
        };
        await updateUser(params.id, data);
        Alert.alert('成功', '更新成功', [{ text: '确定', onPress: () => navigation.goBack() }]);
      } else {
        const data: CreateUserDto = {
          username,
          password,
          role,
          employeeId: newEmployeeId, // Link the newly created employee
        };
        await createUser(data);
        
        let msg = '创建成功';
        if (createEmployeeMode && newEmployeeId) {
          msg += ` 并已关联人员 "${employeeName}"`;
        }
        Alert.alert('成功', msg, [{ text: '确定', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      logger.error(error);
      if (error instanceof AxiosError) {
        // If user creation fails but employee was created, we should ideally warn the user
        // But for now just show the error.
        // In a real robust system we might want to rollback (delete employee) or show a specific message.
      }
      const msg = (error as any)?.message || '保存失败';
      Alert.alert('错误', String(msg));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || hireDate;
    setShowDatePicker(Platform.OS === 'ios');
    setHireDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>用户名 * {isEdit && '(不可修改)'}</Text>
        <TextInput
          style={[styles.input, isEdit && styles.disabledInput]}
          value={username}
          onChangeText={setUsername}
          placeholder="请输入用户名"
          editable={!isEdit}
          autoCapitalize="none"
        />
      </View>

      {!isEdit && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>密码 *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            secureTextEntry
          />
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>角色</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, role === 'user' && styles.radioSelected]}
            onPress={() => setRole('user')}
          >
            <Text style={[styles.radioText, role === 'user' && styles.radioTextSelected]}>普通用户</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radioButton, role === 'admin' && styles.radioSelected]}
            onPress={() => setRole('admin')}
          >
            <Text style={[styles.radioText, role === 'admin' && styles.radioTextSelected]}>管理员</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isEdit && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>状态</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{status === 'active' ? '正常' : '禁用'}</Text>
            <Switch
              value={status === 'active'}
              onValueChange={(val) => setStatus(val ? 'active' : 'inactive')}
            />
          </View>
        </View>
      )}

      {!isEdit && (
        <>
          <View style={styles.divider} />
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>同时创建人员档案</Text>
              <Switch
                value={createEmployeeMode}
                onValueChange={setCreateEmployeeMode}
              />
            </View>
            <Text style={styles.hint}>开启后，将自动创建人员并与该账号关联</Text>
          </View>

          {createEmployeeMode && (
            <View style={styles.subForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>工号 *</Text>
                <TextInput
                  style={styles.input}
                  value={employeeNo}
                  onChangeText={setEmployeeNo}
                  placeholder="请输入工号"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>姓名 *</Text>
                <TextInput
                  style={styles.input}
                  value={employeeName}
                  onChangeText={setEmployeeName}
                  placeholder="请输入真实姓名"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>部门 *</Text>
                <TouchableOpacity 
                  style={styles.input} 
                  onPress={() => setShowDeptPicker(true)}
                >
                  <Text style={{ color: deptId ? '#000' : '#999' }}>
                    {deptName || '请选择部门'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>入职日期 *</Text>
                <TouchableOpacity 
                  style={styles.input} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{dayjs(hireDate).format('YYYY-MM-DD')}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={hireDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
              </View>
            </View>
          )}
        </>
      )}

      <DepartmentPicker 
        visible={showDeptPicker}
        onDismiss={() => setShowDeptPicker(false)}
        onSelect={(id, name) => {
          setDeptId(id);
          setDeptName(name);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  formGroup: { marginBottom: 20 },
  label: { marginBottom: 8, color: '#666', fontSize: 14 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16 },
  disabledInput: { backgroundColor: '#eee', color: '#999' },
  radioGroup: { flexDirection: 'row' },
  radioButton: { 
    flex: 1, 
    padding: 12, 
    backgroundColor: '#fff', 
    marginRight: 8, 
    borderRadius: 8, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  radioSelected: { borderColor: '#007AFF', backgroundColor: '#e6f2ff' },
  radioText: { color: '#333' },
  radioTextSelected: { color: '#007AFF', fontWeight: 'bold' },
  switchRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 8 
  },
  switchLabel: { fontSize: 16, color: '#333' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  hint: { fontSize: 12, color: '#999', marginTop: 4, marginLeft: 4 },
  subForm: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 8, 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  }
});
