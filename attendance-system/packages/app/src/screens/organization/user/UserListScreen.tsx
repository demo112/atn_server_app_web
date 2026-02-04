import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator, Searchbar, Avatar, Chip } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { UserRole, UserStatus } from '@attendance/shared';
import { getUsers, deleteUser } from '../../../services/user';
import { logger } from '../../../utils/logger';

interface UserItem {
  id: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  employeeName?: string;
  createdAt: string;
}

export const UserListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData(1, true);
    }, [])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(1, true);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const loadData = async (pageNum: number, isRefresh = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { items, total } = await getUsers({
        page: pageNum,
        pageSize: 20,
        keyword: keyword || undefined,
      });

      if (isRefresh) {
        setUsers(items);
      } else {
        setUsers(prev => [...prev, ...items]);
      }
      setPage(pageNum);
      setHasMore(items.length === 20 && users.length + items.length < total);
    } catch (error) {
      logger.error(error);
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

  const handleDelete = (item: UserItem) => {
    Alert.alert('确认删除', `确定要删除用户"${item.username}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUser(item.id);
            loadData(1, true);
          } catch (error) {
            Alert.alert('错误', '删除失败');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: UserItem }) => (
    <Card 
      style={styles.card} 
      mode="elevated"
      onPress={() => navigation.navigate('UserEdit', { id: item.id })}
      onLongPress={() => {
        Alert.alert('操作', item.username, [
          { text: '编辑', onPress: () => navigation.navigate('UserEdit', { id: item.id }) },
          { text: '删除', onPress: () => handleDelete(item), style: 'destructive' },
          { text: '取消', style: 'cancel' }
        ]);
      }}
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon 
          size={40} 
          icon="account" 
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          color={theme.colors.onSecondaryContainer}
        />
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.username}</Text>
            <Chip compact textStyle={{ fontSize: 10, lineHeight: 10, height: 10 }}>{item.role}</Chip>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            {item.employeeName ? `绑定: ${item.employeeName}` : '未绑定员工'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="搜索用户名"
          onChangeText={setKeyword}
          value={keyword}
          style={styles.searchbar}
          elevation={1}
        />
      </View>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 10 }} /> : null}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
              暂无用户数据
            </Text>
          ) : null
        }
      />
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('UserEdit')}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
