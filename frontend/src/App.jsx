import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { InspectorDashboard } from './pages/InspectorDashboard/InspectorDashboard';
import MainLayout from './components/layouts/MainLayout/MainLayout';
import Home from './pages/Customer/Home';
import About from './pages/Customer/About';
import Technology from './pages/Customer/Technology'

import Register from './pages/Auth/Register/Register';
import Login from './pages/Auth/Login/Login';

import FarmerLayout from './components/layouts/FarmerLayout/FarmerLayout';
import FarmerDashboard from './pages/Farmer/FarmerDashboard/FarmerDashboard';
import FarmingLog from './pages/Farmer/FarmingLog/FarmingLog'

import ShippingManagement from './pages/Shipping/ShippingManagement';

function App() {
  console.log("App AgriTrace đang chạy");

  return (
    <Router>
      <Routes>

        {/* Tuyến đường Đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* Tuyến đường Đăng ký */}
        <Route path="/register" element={<Register />} />

        {/* Customer sử dụng MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/technology" element={<Technology />} />
        </Route>

        {/* Farmer sử dụng FarmerLayout */}
        <Route path="/farmer" element={<FarmerLayout />}>
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="farming-logs" element={<FarmingLog />} />
        </Route>

        {/* Inspector */}
        <Route path="/inspector" element={<InspectorDashboard />} />

        {/* Shipping Management - Stream 5 */}
        <Route path="/shipping" element={<ShippingManagement />} />

        {/* Trang 404 */}
        <Route path="*" element={
          <div>
            <h2>404 - Không tìm thấy trang</h2>
            <p>Vui lòng kiểm tra lại đường dẫn!</p>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;