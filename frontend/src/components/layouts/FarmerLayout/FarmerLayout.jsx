import React from 'react';
import { Outlet } from 'react-router-dom';
import FarmerNavbar from './FarmerNavbar/FarmerNavbar';
import styles from './FarmerLayout.module.css';

const FarmerLayout = () => {
  return (
    <div className={styles.layoutWrapper}>

      <FarmerNavbar />

      <main className={styles.mainContent}>
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default FarmerLayout;