import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = () => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h3>Sidebar</h3>
      <nav>
        <ul>
          <li><a href="/attendance/schedule">排班管理</a></li>
          <li><a href="/attendance/correction">异常考勤处理</a></li>
        </ul>
      </nav>
    </div>
    <div style={{ flex: 1, padding: '20px' }}>
      <Outlet />
    </div>
  </div>
);

const Home = () => <div><h2>Welcome to Attendance System</h2></div>;

import SchedulePage from '@/pages/attendance/schedule/SchedulePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="attendance">
             <Route path="schedule" element={<SchedulePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
