import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { EmployeeVo } from '@attendance/shared';
import { getEmployees, deleteEmployee } from '../../../services/employee';

export const EmployeeListScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 初始化加载
  useFocusEffect(
    useCallback(() => {
      loadData(1, true);
    }, [])
  );

  useEffect(() => {
    // 防抖搜索
    const timer = setTimeout(() => {
      loadData(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const loadData = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getEmployees({
        page: pageNum,
        pageSize: 20,
        keyword: keyword || undefined,
      });

      if (res.success && res.data) {
        const { items, total } = res.data;
        if (isRefresh) {
          setEmployees(items);
        } else {
          setEmployees(prev => [...prev, ...items]);
        }
        setPage(pageNum);
        setHasMore(items.length === 20 && employees.length + items.length < total);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadData(page + 1);
    }
  };

  const handleDelete = (item: EmployeeVo) => {
    Alert.alert('确认删除', `确定要删除员工"${item.name}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEmployee(item.id);
            loadData(1, true);
          } catch (error) {
            Alert.alert('错误', '删除失败');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: EmployeeVo }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('EmployeeEdit', { id: item.id })}
      onLongPress={() => {
        Alert.alert('操作', item.name, [
          { text: '编辑', onPress: () => navigation.navigate('EmployeeEdit', { id: item.id }) },
          { text: '删除', onPress: () => handleDelete(item), style: 'destructive' },
          { text: '取消', style: 'cancel' }
        ]);
      }}
    >
      <View style={styles.itemContent}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subInfo}>{item.deptName || '无部门'} | {item.employeeNo}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索姓名、工号、手机号"
          value={keyword}
          onChangeText={setKeyword}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('EmployeeEdit')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={styles.loading} /> : null}
        ListEmptyComponent={!loading ? <Text style={styles.emptyText}>无数据</Text> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subInfo: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
  loading: {
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
