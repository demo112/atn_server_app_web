import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { EmployeeVo } from '@attendance/shared';
import { getEmployees, deleteEmployee } from '../../../services/employee';
import { logger } from '../../../utils/logger';

export const EmployeeListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeVo[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { items, total } = await getEmployees({
        page: pageNum,
        pageSize: 20,
        keyword: keyword || undefined,
      });

      if (isRefresh) {
        setEmployees(items);
      } else {
        setEmployees(prev => [...prev, ...items]);
      }
      setPage(pageNum);
      setHasMore(items.length === 20 && employees.length + items.length < total);
    } catch (error) {
      logger.error(error);
      Alert.alert('错误', '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [keyword, loading, employees.length]);

  // 初始化加载
  useFocusEffect(
    useCallback(() => {
      loadData(1, true);
    }, [loadData])
  );

  useEffect(() => {
    // 防抖搜索
    const timer = setTimeout(() => {
      loadData(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(1, true);
  };

  const onLoadMore = () => {
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
    <Card 
      style={styles.card} 
      mode="elevated"
      onPress={() => navigation.navigate('EmployeeEdit', { id: item.id })}
      onLongPress={() => {
        Alert.alert('操作', item.name, [
          { text: '编辑', onPress: () => navigation.navigate('EmployeeEdit', { id: item.id }) },
          { text: '删除', onPress: () => handleDelete(item), style: 'destructive' },
          { text: '取消', style: 'cancel' }
        ]);
      }}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Text 
          size={40} 
          label={item.name.substring(0, 1)} 
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          color={theme.colors.onSecondaryContainer}
        />
        <View style={styles.info}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            工号: {item.employeeNumber} | {item.departmentName || '无部门'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索员工"
          onChangeText={setKeyword}
          value={keyword}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      <FlatList
        data={employees}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 10 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
              暂无员工数据
            </Text>
          ) : null
        }
      />
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('EmployeeEdit')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    backgroundColor: 'white',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
