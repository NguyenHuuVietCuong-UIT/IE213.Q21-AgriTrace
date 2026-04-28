import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Sử dụng React.lazy để tải trang bất đồng bộ
const MainLayout = React.lazy(() => import('./components/layouts/MainLayout/MainLayout'));
const Home = React.lazy(() => import('./pages/Customer/Home'));
const About = React.lazy(() => import('./pages/Customer/About'));
const Technology = React.lazy(() => import('./pages/Customer/Technology'));
const Register = React.lazy(() => import('./pages/Auth/Register/Register'));
const Login = React.lazy(() => import('./pages/Auth/Login/Login'));
const FarmerLayout = React.lazy(() => import('./components/layouts/FarmerLayout/FarmerLayout'));
const FarmerDashboard = React.lazy(() => import('./pages/Farmer/FarmerDashboard/FarmerDashboard'));
const FarmingLog = React.lazy(() => import('./pages/Farmer/FarmingLog/FarmingLog'));
const ShippingManagement = React.lazy(() => import('./pages/Shipping/ShippingManagement'));
const InspectorLayout = React.lazy(() => import('./components/layouts/InspectorLayout/InspectorLayout'));
const InspectorDashboard = React.lazy(() => import('./pages/InspectorDashboard/InspectorDashboard').then(module => ({ default: module.InspectorDashboard })));
const InspectorHistory = React.lazy(() => import('./pages/InspectorDashboard/InspectorHistory').then(module => ({ default: module.InspectorHistory })));
const InspectorSettings = React.lazy(() => import('./pages/InspectorDashboard/InspectorSettings').then(module => ({ default: module.InspectorSettings })));

// Component Loading hiển thị trong lúc chờ tải chunk JS
const PageLoader = () => <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Đang tải trang...</div>;

function App() {
  console.log("App AgriTrace đang chạy");

  return (
    <Router>
      {/* BẮT BUỘC PHẢI THÊM THẺ SUSPENSE Ở ĐÂY */}
      <Suspense fallback={<PageLoader />}>
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

          {/* Inspector sử dụng InspectorLayout */}
          <Route path="/inspector" element={<InspectorLayout />}>
            <Route index element={<InspectorDashboard />} />
            <Route path="dashboard" element={<InspectorDashboard />} />
            <Route path="history" element={<InspectorHistory />} />
            <Route path="settings" element={<InspectorSettings />} />
          </Route>

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
      </Suspense>
    </Router>
  );
}

export default App;