import React from 'react';
import { Outlet } from 'react-router-dom';
import FarmerNavbar from './FarmerNavbar/FarmerNavbar.jsx'; 
import styles from './FarmerLayout.module.css';

const FarmerLayout = () => {
  return (
    <div className={styles.layoutWrapper}>
    
      <FarmerNavbar />

      <main className={styles.mainContent}>
        {/* Các trang con (Dashboard, Logs, Profile) sẽ được nhúng vào đây */}
        <Outlet />
      </main>
      
    </div>
  );
};

export default FarmerLayout;