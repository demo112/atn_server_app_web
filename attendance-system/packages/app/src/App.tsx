import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ErrorBoundary } from './components/ErrorBoundary';
import { appTheme } from './theme';
import LoginScreen from './screens/auth/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ClockInScreen from './screens/attendance/ClockInScreen';
import LeaveScreen from './screens/attendance/LeaveScreen';
import CorrectionScreen from './screens/attendance/CorrectionScreen';
import HistoryScreen from './screens/attendance/HistoryScreen';
import AttendanceCalendar from './screens/attendance/AttendanceCalendar';
import AttendanceRecords from './screens/attendance/AttendanceRecords';
import ScheduleScreen from './screens/attendance/ScheduleScreen';
import { DepartmentListScreen } from './screens/organization/department/DepartmentListScreen';
import { DepartmentEditScreen } from './screens/organization/department/DepartmentEditScreen';
import { EmployeeListScreen } from './screens/organization/employee/EmployeeListScreen';
import { EmployeeEditScreen } from './screens/organization/employee/EmployeeEditScreen';
import { UserListScreen } from './screens/organization/user/UserListScreen';
import { UserEditScreen } from './screens/organization/user/UserEditScreen';
import ShiftListScreen from './screens/shift/ShiftListScreen';
import ShiftEditScreen from './screens/shift/ShiftEditScreen';
import { getToken } from './utils/auth';
import { logger } from './utils/logger';

const Stack = createStackNavigator();

export default function App(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [debugStatus, setDebugStatus] = useState('Initializing...');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setDebugStatus('Checking auth token...');
      console.log('[App] Starting checkAuth');
      
      // Add timeout to prevent hang
      const tokenPromise = getToken();
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => {
          console.warn('[App] getToken timed out');
          resolve(null);
        }, 5000)
      );

      const token = await Promise.race([tokenPromise, timeoutPromise]);
      
      console.log('[App] Token result:', token ? 'Present' : 'Null/Timeout');
      setDebugStatus(`Auth check complete. Token: ${token ? 'Yes' : 'No'}`);
      setIsAuthenticated(!!token);
    } catch (e) {
      console.error('[App] checkAuth failed:', e);
      setDebugStatus(`Auth error: ${e instanceof Error ? e.message : String(e)}`);
      logger.error(e);
    } finally {
      // Short delay to allow reading the debug status if it was fast
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 20, textAlign: 'center' }}>{debugStatus}</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={appTheme}>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={isAuthenticated ? 'Home' : 'Login'}>
            <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ClockIn" 
          component={ClockInScreen} 
          options={{ title: '考勤打卡' }}
        />
        <Stack.Screen 
          name="Leave" 
          component={LeaveScreen} 
          options={{ title: '请假/出差' }}
        />
        <Stack.Screen 
          name="Correction" 
          component={CorrectionScreen} 
          options={{ title: '补卡申请' }}
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: '考勤记录' }}
        />
        <Stack.Screen 
          name="Schedule" 
          component={ScheduleScreen} 
          options={{ title: '我的排班' }}
        />
        <Stack.Screen 
          name="DepartmentList" 
          component={DepartmentListScreen} 
          options={{ title: '部门管理' }}
        />
        <Stack.Screen 
          name="DepartmentEdit" 
          component={DepartmentEditScreen} 
          options={{ title: '编辑部门' }}
        />
        <Stack.Screen 
          name="EmployeeList" 
          component={EmployeeListScreen} 
          options={{ title: '人员管理' }}
        />
        <Stack.Screen 
          name="EmployeeEdit" 
          component={EmployeeEditScreen} 
          options={{ title: '编辑员工' }}
        />
        <Stack.Screen 
          name="UserList" 
          component={UserListScreen} 
          options={{ title: '用户管理' }}
        />
        <Stack.Screen 
          name="UserEdit" 
          component={UserEditScreen} 
          options={{ title: '编辑用户' }}
        />
        <Stack.Screen 
          name="ShiftList" 
          component={ShiftListScreen} 
          options={{ title: '班次管理' }}
        />
        <Stack.Screen 
          name="ShiftEdit" 
          component={ShiftEditScreen} 
          options={{ title: '编辑班次' }}
        />
      </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </PaperProvider>
  );
}
