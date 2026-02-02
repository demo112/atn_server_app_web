import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DepartmentVO } from '@attendance/shared';
import { getDepartmentTree, deleteDepartment } from '../../../services/department';

export const DepartmentListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);
  const parentId = route.params?.parentId || null;
  const parentName = route.params?.title || '部门管理';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: parentName,
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('DepartmentEdit', { parentId })}
          style={{ marginRight: 16 }}
        >
          <Text style={{ fontSize: 16, color: '#007AFF' }}>新增</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, parentId, parentName]);

  useEffect(() => {
    loadData();
    // 监听焦点事件，返回时刷新
    const unsubscribe = navigation.addListener('focus', () => {
        loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      if (res.success && res.data) {
        const currentLevelNodes = findChildren(res.data, parentId);
        setDepartments(currentLevelNodes);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const findChildren = (tree: DepartmentVO[], pid: number | null): DepartmentVO[] => {
    if (pid === null) return tree;
    
    const findNode = (nodes: DepartmentVO[]): DepartmentVO | null => {
      for (const node of nodes) {
        if (node.id === pid) return node;
        if (node.children) {
          const found = findNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parentNode = findNode(tree);
    return parentNode?.children || [];
  };

  const handleDelete = (item: DepartmentVO) => {
    Alert.alert('确认删除', `确定要删除部门"${item.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDepartment(item.id);
            loadData();
          } catch (error) {
            Alert.alert('错误', '删除失败');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: DepartmentVO }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        navigation.push('DepartmentList', { parentId: item.id, title: item.name });
      }}
      onLongPress={() => {
         Alert.alert('操作', item.name, [
           { text: '编辑', onPress: () => navigation.navigate('DepartmentEdit', { id: item.id }) },
           { text: '删除', onPress: () => handleDelete(item), style: 'destructive' },
           { text: '取消', style: 'cancel' }
         ]);
      }}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>无子部门</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  item: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 16 },
  arrow: { fontSize: 20, color: '#999' },
  loading: { marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});
