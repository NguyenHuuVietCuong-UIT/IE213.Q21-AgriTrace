import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar'; 

const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar /> 
      <main>
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default MainLayout;