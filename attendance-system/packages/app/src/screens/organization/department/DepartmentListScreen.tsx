import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator, IconButton, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DepartmentVO } from '@attendance/shared';
import { getDepartmentTree, deleteDepartment } from '../../../services/department';
import { logger } from '../../../utils/logger';

import { z } from 'zod';

export const DepartmentListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const paramsSchema = z.object({
    parentId: z.coerce.number().optional(),
    title: z.string().max(50).optional()
  });
  const params = paramsSchema.parse(route.params || {});

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentVO[]>([]);
  const parentId = params.parentId || null;
  const parentName = params.title || '部门管理';

  useLayoutEffect(() => {
    navigation.setOptions({
      title: parentName,
      headerRight: () => (
        <IconButton 
          icon="plus" 
          iconColor={theme.colors.primary}
          onPress={() => navigation.navigate('DepartmentEdit', { parentId })}
        />
      ),
    });
  }, [navigation, parentId, parentName, theme]);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
        loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      const currentLevelNodes = findChildren(res, parentId);
      setDepartments(currentLevelNodes);
    } catch (error) {
      logger.error(error);
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
    <Card 
      style={styles.card} 
      mode="elevated"
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
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
            负责人: {item.managerId || '未设置'}
          </Text>
        </View>
        <IconButton icon="chevron-right" size={20} />
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading ? (
        <ActivityIndicator style={{ margin: 20 }} />
      ) : (
        <FlatList
          data={departments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.secondary }}>
              暂无子部门
            </Text>
          }
        />
      )}
      
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => navigation.navigate('DepartmentEdit', { parentId })}
      />
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
