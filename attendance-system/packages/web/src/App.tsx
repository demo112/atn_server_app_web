import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import UserList from './pages/user/UserList';
import SchedulePage from '@/pages/attendance/schedule/SchedulePage';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = () => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h3>Sidebar</h3>
      <nav>
        <ul>
          <li><a href="/attendance/schedule">排班管理</a></li>
          <li><a href="/users">用户管理</a></li>
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
            <Route path="attendance">
               <Route path="schedule" element={<SchedulePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
