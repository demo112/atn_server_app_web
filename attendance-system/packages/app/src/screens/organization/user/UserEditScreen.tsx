import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CreateUserDto, UserRole, UserStatus } from '@attendance/shared';
import { createUser, updateUser, getUserById } from '../../../services/user';
import { logger } from '../../../utils/logger';

export const UserEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isEdit = !!route.params?.id;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<UserStatus>('active');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? '编辑用户' : '新增用户',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, username, password, role, status, isEdit]);

  useEffect(() => {
    if (isEdit) {
      loadDetail();
    }
  }, [isEdit]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const user = await getUserById(route.params.id);
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
    if (!isEdit && !password.trim()) return Alert.alert('提示', '请输入密码');

    setLoading(true);
    try {
      if (isEdit) {
        const data = {
          role,
          status,
        };
        await updateUser(route.params.id, data);
        Alert.alert('成功', '更新成功', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        const data: CreateUserDto = {
          username,
          password,
          role,
        };
        await createUser(data);
        Alert.alert('成功', '创建成功', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '保存失败');
    } finally {
      setLoading(false);
    }
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
});
