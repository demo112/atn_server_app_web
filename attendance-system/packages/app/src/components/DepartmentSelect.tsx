import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { DepartmentVO } from '@attendance/shared';
import { getDepartmentTree } from '../services/department';

interface DepartmentSelectProps {
  visible: boolean;
  onSelect: (department: DepartmentVO) => void;
  onClose: () => void;
  value?: number; // 当前选中的部门ID
}

interface FlattenedDepartment extends DepartmentVO {
  level: number;
}

export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  visible,
  onSelect,
  onClose,
  value,
}) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<FlattenedDepartment[]>([]);

  useEffect(() => {
    if (visible) {
      loadDepartments();
    }
  }, [visible]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await getDepartmentTree();
      setDepartments(flattenTree(res));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const flattenTree = (nodes: DepartmentVO[], level = 0): FlattenedDepartment[] => {
    let result: FlattenedDepartment[] = [];
    nodes.forEach(node => {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, level + 1));
      }
    });
    return result;
  };

  const renderItem = ({ item }: { item: FlattenedDepartment }) => (
    <TouchableOpacity
      style={[
        styles.item,
        { paddingLeft: 16 + item.level * 20 },
        item.id === value && styles.selectedItem
      ]}
      onPress={() => onSelect(item)}
    >
      <Text style={[styles.itemText, item.id === value && styles.selectedItemText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>选择部门</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>关闭</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <ActivityIndicator style={styles.loading} size="large" />
          ) : (
            <FlatList
              data={departments}
              keyExtractor={item => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 16,
    color: '#007AFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    paddingVertical: 14,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedItemText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  loading: {
    marginTop: 40,
  }
});
