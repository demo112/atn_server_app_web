import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';

// 临时占位组件，后续会移动到 components/layouts
const MainLayout = () => (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
      <h3>Sidebar</h3>
      <nav>
        <ul>
          <li><Link to="/attendance/time-periods">时间段设置</Link></li>
          <li><Link to="/attendance/schedule">排班管理</Link></li>
          <li><Link to="/attendance/correction">异常考勤处理</Link></li>
          <li><Link to="/attendance/settings">考勤制度设置</Link></li>
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
import TimePeriodPage from '@/pages/attendance/time-period/TimePeriodPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="attendance">
             <Route path="time-periods" element={<TimePeriodPage />} />
             <Route path="schedule" element={<SchedulePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
