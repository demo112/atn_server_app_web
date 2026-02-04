import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import Login from './pages/Login';
import UserList from './pages/user/UserList';
import EmployeeList from './pages/employee/EmployeeList';
import DepartmentPage from './pages/department/DepartmentPage';
import SchedulePage from '@/pages/attendance/schedule/SchedulePage';
import ShiftPage from '@/pages/attendance/shift/ShiftPage';
import ClockRecordPage from '@/pages/attendance/clock/ClockRecordPage';
import TimePeriodPage from '@/pages/attendance/time-period/TimePeriodPage';
import CorrectionPage from '@/pages/attendance/correction/CorrectionPage';
import AttendanceSettingsPage from '@/pages/attendance/settings/AttendanceSettingsPage';
import LeavePage from '@/pages/attendance/leave/LeavePage';
import DailyRecords from '@/pages/attendance/DailyRecords';
import AttendanceDetailsPage from '@/pages/attendance/details/AttendanceDetailsPage';
import SummaryPage from '@/pages/statistics/SummaryPage';
import ReportPage from '@/pages/statistics/ReportPage';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = (): React.ReactElement => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h3>Sidebar</h3>
      <nav>
        <ul>
          <li><Link to="/attendance/time-periods">时间段设置</Link></li>
          <li><Link to="/attendance/shifts">班次管理</Link></li>
          <li><Link to="/attendance/schedule">排班管理</Link></li>
          <li><Link to="/attendance/clock-records">原始打卡记录</Link></li>
          <li><Link to="/attendance/leave">请假管理</Link></li>
          <li><Link to="/attendance/correction">异常考勤处理</Link></li>
          <li><Link to="/attendance/settings">考勤制度设置</Link></li>
          <li><Link to="/departments">部门管理</Link></li>
          <li><Link to="/employees">人员管理</Link></li>
          <li><Link to="/users">用户管理</Link></li>
          <li><Link to="/attendance/daily-records">每日考勤</Link></li>
          <li><Link to="/statistics/details">考勤明细</Link></li>
          <li><Link to="/statistics/summary">个人考勤汇总</Link></li>
          <li><Link to="/statistics/reports">统计报表</Link></li>
        </ul>
      </nav>
    </div>
    <div style={{ flex: 1, padding: '20px' }}>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  </div>
);

const Home = (): React.ReactElement => <div><h2>Welcome to Attendance System</h2></div>;

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }>
              <Route index element={<Home />} />
              <Route path="users" element={<UserList />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="departments" element={<DepartmentPage />} />
              <Route path="attendance">
                 <Route path="time-periods" element={<TimePeriodPage />} />
                 <Route path="shifts" element={<ShiftPage />} />
                 <Route path="schedule" element={<SchedulePage />} />
                 <Route path="clock-records" element={<ClockRecordPage />} />
                 <Route path="leave" element={<LeavePage />} />
                 <Route path="correction" element={<CorrectionPage />} />
                 <Route path="settings" element={<AttendanceSettingsPage />} />
                 <Route path="daily-records" element={<DailyRecords />} />
              </Route>
              <Route path="statistics">
                  <Route path="details" element={<AttendanceDetailsPage />} />
                  <Route path="summary" element={<SummaryPage />} />
                  <Route path="reports" element={<ReportPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
