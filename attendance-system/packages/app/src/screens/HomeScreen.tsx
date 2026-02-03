import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearAuth, getUser } from '../utils/auth';
import { logger } from '../utils/logger';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      logger.error(error);
    }
  };

  const handleLogout = async () => {
    await clearAuth();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>考勤助手</Text>
          {user && <Text style={styles.subtitle}>你好, {user.name}</Text>}
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>退出</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>常用功能</Text>
      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('ClockIn')}
        >
          <Text style={styles.cardIcon}>🕒</Text>
          <Text style={styles.cardTitle}>考勤打卡</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Leave')}
        >
          <Text style={styles.cardIcon}>✈️</Text>
          <Text style={styles.cardTitle}>请假/出差</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Correction')}
        >
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={styles.cardTitle}>补卡申请</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardTitle}>考勤记录</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.cardIcon}>📅</Text>
          <Text style={styles.cardTitle}>我的排班</Text>
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <>
          <Text style={styles.sectionTitle}>管理中心</Text>
          <View style={styles.grid}>
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('DepartmentList')}
            >
              <Text style={styles.cardIcon}>🏢</Text>
              <Text style={styles.cardTitle}>部门管理</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('EmployeeList')}
            >
              <Text style={styles.cardIcon}>👥</Text>
              <Text style={styles.cardTitle}>人员管理</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate('UserList')}
            >
              <Text style={styles.cardIcon}>👤</Text>
              <Text style={styles.cardTitle}>用户管理</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutText: {
    color: '#ff4d4f',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default HomeScreen;
