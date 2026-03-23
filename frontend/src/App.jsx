import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { InspectorDashboard } from './pages/InspectorDashboard/InspectorDashboard';

import MainLayout from './components/layouts/MainLayout/MainLayout';
import Home from './pages/Customer/Home/Home';
import FarmerLayout from './components/layouts/FarmerLayout/FarmerLayout';
import FarmerDashboard from './pages/Farmer/FarmerDashboard/FarmerDashboard';

function App() {
  console.log("App AgriTrace đang chạy");

  return (
    <Router>
      <Routes>
        {/* Customer sử dụng MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* Farmer sử dụng FarmerLayout */}
        <Route path="/farmer" element={<FarmerLayout />}>
          <Route path="dashboard" element={<FarmerDashboard />} />
          
        </Route>

        {/* Inspectot */}
        <Route path="/inspector" element={<InspectorDashboard />} />

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