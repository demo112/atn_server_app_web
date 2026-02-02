import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CreateDepartmentDto } from '@attendance/shared';
import { createDepartment, updateDepartment, getDepartmentById } from '../../../services/department';
import { DepartmentSelect } from '../../../components/DepartmentSelect';

export const DepartmentEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isEdit = !!route.params?.id;
  const initialParentId = route.params?.parentId || null;

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(initialParentId);
  const [parentName, setParentName] = useState('无 (根部门)');
  const [sortOrder, setSortOrder] = useState('0');
  const [loading, setLoading] = useState(false);
  const [selectVisible, setSelectVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? '编辑部门' : '新增部门',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>保存</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, name, parentId, sortOrder, isEdit]);

  useEffect(() => {
    if (isEdit) {
      loadDetail();
    } else if (initialParentId) {
        loadParentDetail(initialParentId);
    }
  }, [isEdit]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentById(route.params.id);
      if (res.success && res.data) {
        setName(res.data.name);
        setParentId(res.data.parentId);
        setSortOrder(res.data.sortOrder.toString());
        if (res.data.parentId) {
            loadParentDetail(res.data.parentId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadParentDetail = async (pid: number) => {
      try {
          const res = await getDepartmentById(pid);
          if (res.success && res.data) {
              setParentName(res.data.name);
          }
      } catch (e) {
          console.error(e);
      }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('提示', '请输入部门名称');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name,
        parentId: parentId ?? undefined,
        sortOrder: parseInt(sortOrder) || 0,
      };

      if (isEdit) {
        await updateDepartment(route.params.id, data);
        Alert.alert('成功', '更新成功', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await createDepartment(data as CreateDepartmentDto);
        Alert.alert('成功', '创建成功', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>部门名称</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="请输入部门名称"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>上级部门</Text>
          <TouchableOpacity style={styles.select} onPress={() => setSelectVisible(true)}>
            <Text style={styles.selectText}>{parentName}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>排序 (数字越小越靠前)</Text>
          <TextInput
            style={styles.input}
            value={sortOrder}
            onChangeText={setSortOrder}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      </ScrollView>

      <DepartmentSelect
        visible={selectVisible}
        value={parentId || undefined}
        onClose={() => setSelectVisible(false)}
        onSelect={(dept) => {
          setParentId(dept.id);
          setParentName(dept.name);
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
  select: { backgroundColor: '#fff', padding: 12, borderRadius: 8 },
  selectText: { fontSize: 16, color: '#333' },
});
