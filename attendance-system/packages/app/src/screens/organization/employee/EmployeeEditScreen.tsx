import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CreateEmployeeDto } from '@attendance/shared';
import { createEmployee, updateEmployee, getEmployeeById } from '../../../services/employee';
import { DepartmentSelect } from '../../../components/DepartmentSelect';
import { logger } from '../../../utils/logger';

export const EmployeeEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isEdit = !!route.params?.id;

  const [name, setName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState<number | null>(null);
  const [deptName, setDeptName] = useState('请选择部门');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [selectVisible, setSelectVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? '编辑员工' : '新增员工',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, name, employeeNo, phone, email, deptId, hireDate, isEdit]);

  useEffect(() => {
    if (isEdit) {
      loadDetail();
    }
  }, [isEdit]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const emp = await getEmployeeById(route.params.id);
      setName(emp.name);
      setEmployeeNo(emp.employeeNo);
      setPhone(emp.phone || '');
      setEmail(emp.email || '');
      setDeptId(emp.deptId || null);
      setDeptName(emp.deptName || '请选择部门');
      setHireDate(emp.hireDate || new Date().toISOString().split('T')[0]);
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '加载详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('提示', '请输入姓名');
    if (name.length > 100) return Alert.alert('提示', '姓名不能超过100个字符');
    
    if (!employeeNo.trim()) return Alert.alert('提示', '请输入工号');
    if (employeeNo.length > 50) return Alert.alert('提示', '工号不能超过50个字符');

    if (!deptId) return Alert.alert('提示', '请选择部门');

    if (phone && phone.length > 20) return Alert.alert('提示', '手机号不能超过20个字符');
    if (email && email.length > 100) return Alert.alert('提示', '邮箱不能超过100个字符');

    setLoading(true);
    try {
      if (isEdit) {
        const data = {
          name,
          phone: phone || undefined,
          email: email || undefined,
          deptId,
          hireDate,
        };
        await updateEmployee(route.params.id, data);
        Alert.alert('成功', '更新成功', [{ text: '确定', onPress: () => navigation.goBack() }]);
      } else {
        const data: CreateEmployeeDto = {
          name,
          employeeNo,
          deptId,
          hireDate,
          phone: phone || undefined,
          email: email || undefined,
        };
        await createEmployee(data);
        Alert.alert('成功', '创建成功', [{ text: '确定', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>姓名 *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="请输入姓名"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>工号 * {isEdit && '(不可修改)'}</Text>
          <TextInput
            style={[styles.input, isEdit && styles.disabledInput]}
            value={employeeNo}
            onChangeText={setEmployeeNo}
            placeholder="请输入工号"
            editable={!isEdit}
            maxLength={50}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>所属部门 *</Text>
          <TouchableOpacity style={styles.select} onPress={() => setSelectVisible(true)}>
            <Text style={styles.selectText}>{deptName}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="请输入手机号"
            keyboardType="phone-pad"
            maxLength={20}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>邮箱</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>入职日期 (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={hireDate}
            onChangeText={setHireDate}
            placeholder="2024-01-01"
          />
        </View>
      </ScrollView>

      <DepartmentSelect
        visible={selectVisible}
        value={deptId || undefined}
        onClose={() => setSelectVisible(false)}
        onSelect={(dept) => {
          setDeptId(dept.id);
          setDeptName(dept.name);
          setSelectVisible(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  formGroup: { marginBottom: 20 },
  label: { marginBottom: 8, color: '#666', fontSize: 14 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16 },
  disabledInput: { backgroundColor: '#eee', color: '#999' },
  select: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  selectText: { fontSize: 16, color: '#333' },
});
