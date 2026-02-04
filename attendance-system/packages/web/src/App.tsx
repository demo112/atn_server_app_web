import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthGuard } from './components/AuthGuard';
import Login from './pages/Login';
import UserList from './pages/user/UserList';
import EmployeeList from './pages/employee/EmployeeList';
import EmployeeManagement from './pages/employee/EmployeeManagement';
import SchedulePage from '@/pages/attendance/schedule/SchedulePage';
import ShiftPage from '@/pages/attendance/shift/ShiftPage';
import ClockRecordPage from '@/pages/attendance/clock/ClockRecordPage';
import TimePeriodPage from '@/pages/attendance/time-period/TimePeriodPage';
import CorrectionPage from '@/pages/attendance/correction/CorrectionPage';
import AttendanceSettingsPage from '@/pages/attendance/settings/AttendanceSettingsPage';
import LeavePage from '@/pages/attendance/leave/LeavePage';
import DailyRecords from '@/pages/attendance/DailyRecords';
import AttendanceDetailsPage from '@/pages/attendance/details/AttendanceDetailsPage';
import GroupPage from '@/pages/attendance/group/GroupPage';
import SummaryPage from '@/pages/statistics/SummaryPage';
import ReportPage from '@/pages/statistics/ReportPage';

import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = (): React.ReactElement => (
  <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
    <Header />
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  </div>
);

const Home = (): React.ReactElement => <div><h2>Welcome to Attendance System</h2></div>;

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
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
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="attendance">
                   <Route path="time-periods" element={<TimePeriodPage />} />
                   <Route path="shifts" element={<ShiftPage />} />
                   <Route path="schedule" element={<SchedulePage />} />
                   <Route path="clock-records" element={<ClockRecordPage />} />
                   <Route path="leave" element={<LeavePage />} />
                   <Route path="correction" element={<CorrectionPage />} />
                   <Route path="settings" element={<AttendanceSettingsPage />} />
                   <Route path="groups" element={<GroupPage />} />
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
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
