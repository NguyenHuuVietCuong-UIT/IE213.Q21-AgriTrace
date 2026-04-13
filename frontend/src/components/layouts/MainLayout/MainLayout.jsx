import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar'; 
import style from './MainLayout.module.css';

const MainLayout = () => {
  return (
    <div className={style.body}>
      <Navbar /> 
      <main>
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default MainLayout;