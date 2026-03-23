import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LuLeaf, LuLayoutDashboard, LuBook, LuUser, LuBell } from "react-icons/lu";
import styles from './FarmerLayout.module.css';

const FarmerLayout = () => {
  return (
    <div className={styles.layoutWrapper}>
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOPBAR) */}
      <nav className={styles.topbar}>
        
        {/* Logo */}
        <div className={styles.logoGroup}>
          <div className={styles.logoIcon}>
            <LuLeaf size={24} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brand}>AgriTrace</span>
            <span className={styles.portal}>Farmer Portal</span>
          </div>
        </div>

        {/* Menu Điều Hướng */}
        <div className={styles.navLinks}>
          <NavLink 
            to="/farmer/dashboard" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <LuLayoutDashboard /> Tổng quan
          </NavLink>
          
          <NavLink 
            to="/farmer/logs" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <LuBook /> Nhật ký canh tác
          </NavLink>
          
          <NavLink 
            to="/farmer/profile" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <LuUser /> Hồ sơ trang trại
          </NavLink>
        </div>

        {/* Thông tin User & Thông báo */}
        <div className={styles.userSection}>
          <div className={styles.notification}>
            <LuBell size={22} color="#475569" />
            <span className={styles.badge}>3</span>
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.avatar}>NA</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>Nguyễn Văn An</span>
              <span className={styles.userRole}>Nông dân</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <main className={styles.mainContent}>
        {/* FarmerDashboard sẽ được "nhúng" vào cái lỗ này */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default FarmerLayout;