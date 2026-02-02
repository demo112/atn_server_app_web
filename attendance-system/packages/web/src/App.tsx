import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import UserList from './pages/user/UserList';
import EmployeeList from './pages/employee/EmployeeList';
import DepartmentPage from './pages/department/DepartmentPage';
import SchedulePage from '@/pages/attendance/schedule/SchedulePage';
import TimePeriodPage from '@/pages/attendance/time-period/TimePeriodPage';
import CorrectionPage from '@/pages/attendance/correction/CorrectionPage';
import AttendanceSettingsPage from '@/pages/attendance/settings/AttendanceSettingsPage';
import LeavePage from '@/pages/attendance/leave/LeavePage';
import SummaryPage from '@/pages/statistics/SummaryPage';
import ShiftPage from '@/pages/attendance/shift/ShiftPage';
import ClockRecordPage from '@/pages/attendance/clock/ClockRecordPage';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = () => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h3>Sidebar</h3>
      <nav>
        <ul>
          <li><Link to="/attendance/time-periods">时间段设置</Link></li>
          <li><Link to="/attendance/shifts">班次管理</Link></li>
          <li><Link to="/attendance/schedule">排班管理</Link></li>
          <li><Link to="/attendance/leave">请假管理</Link></li>
          <li><Link to="/attendance/correction">异常考勤处理</Link></li>
          <li><Link to="/attendance/records">原始考勤记录</Link></li>
          <li><Link to="/attendance/settings">考勤制度设置</Link></li>
          <li><Link to="/departments">部门管理</Link></li>
          <li><Link to="/users">用户管理</Link></li>
        </ul>
      </nav>
    </div>
    <div style={{ flex: 1, padding: '20px' }}>
      <Outlet />
    </div>
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Home = () => <div><h2>Welcome to Attendance System</h2></div>;

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Home />} />
            <Route path="users" element={<UserList />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="departments" element={<DepartmentPage />} />
            <Route path="attendance">
               <Route path="time-periods" element={<TimePeriodPage />} />
               <Route path="shifts" element={<ShiftPage />} />
               <Route path="schedule" element={<SchedulePage />} />
               <Route path="leave" element={<LeavePage />} />
               <Route path="correction" element={<CorrectionPage />} />
               <Route path="records" element={<ClockRecordPage />} />
               <Route path="settings" element={<AttendanceSettingsPage />} />
            </Route>
            <Route path="statistics">
                <Route path="summary" element={<SummaryPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
