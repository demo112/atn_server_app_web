import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Avatar, useTheme, IconButton, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { clearAuth, getUser } from '../utils/auth';
import { logger } from '../utils/logger';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const theme = useTheme();
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

  const isAdmin = user?.role === 'admin';

  const MenuItem = ({ title, icon, route, color }: { title: string; icon: string; route: string; color?: string }) => (
    <Card 
      style={styles.card} 
      onPress={() => navigation.navigate(route)}
      mode="elevated"
    >
      <Card.Content style={styles.cardContent}>
        <Avatar.Icon 
          size={48} 
          icon={icon} 
          style={{ backgroundColor: color || theme.colors.secondaryContainer }} 
          color={theme.colors.onSecondaryContainer}
        />
        <Text variant="titleMedium" style={styles.cardTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: theme.colors.primary }]} elevation={4}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>考勤助手</Text>
          {user && <Text variant="bodyLarge" style={styles.headerSubtitle}>你好, {user.name}</Text>}
        </View>
        <IconButton 
          icon="logout" 
          iconColor={theme.colors.onPrimary} 
          onPress={handleLogout} 
        />
      </Surface>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="titleLarge" style={styles.sectionTitle}>常用功能</Text>
        <View style={styles.grid}>
          <MenuItem title="考勤打卡" icon="map-marker-radius" route="ClockIn" />
          <MenuItem title="请假/出差" icon="airplane-takeoff" route="Leave" />
          <MenuItem title="补卡申请" icon="file-document-edit" route="Correction" />
          <MenuItem title="考勤记录" icon="chart-bar" route="History" />
          <MenuItem title="我的排班" icon="calendar-clock" route="Schedule" />
        </View>

        {isAdmin && (
          <>
            <Text variant="titleLarge" style={[styles.sectionTitle, { marginTop: 24 }]}>管理中心</Text>
            <View style={styles.grid}>
              <MenuItem title="部门管理" icon="domain" route="DepartmentList" color="#E0F2F1" />
              <MenuItem title="人员管理" icon="account-group" route="EmployeeList" color="#E0F2F1" />
              <MenuItem title="排班管理" icon="calendar-edit" route="ShiftList" color="#E0F2F1" />
              <MenuItem title="用户管理" icon="account-cog" route="UserList" color="#E0F2F1" />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60, // Status bar space
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%', // Approx half width minus gap
    marginBottom: 4,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  cardTitle: {
    textAlign: 'center',
  },
});

export default HomeScreen;
