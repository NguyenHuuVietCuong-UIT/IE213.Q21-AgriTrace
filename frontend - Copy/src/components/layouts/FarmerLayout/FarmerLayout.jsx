import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LuLeaf, LuLayoutDashboard, LuBook, LuUser, LuBell } from "react-icons/lu";
import styles from './FarmerLayout.module.css';

const FarmerLayout = () => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ localStorage khi component được render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Xử lý giá trị hiển thị (fallback nếu chưa có data)
  const userName = user?.name || 'Đang tải...';
  const userRole = user?.role === 'FARMER' ? 'Nông dân' : (user?.role || '');

  // Hàm tạo Avatar từ các chữ cái đầu của Tên
  const getAvatarInitials = (name) => {
    if (!name || name === 'Đang tải...') return 'AG'; // Mặc định là AG (AgriTrace)
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className={styles.layoutWrapper}>
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG (TOPBAR) */}
      <nav className={styles.topbar}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={styles.logoGroup}>
            <div className={styles.logoIcon}>
              <LuLeaf size={24} />
            </div>
            <div className={styles.logoText}>
              <span className={styles.brand}>AgriTrace</span>
              <span className={styles.portal}>Farmer Portal</span>
            </div>
          </div>
        </Link>

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

          {/* ĐÃ CẬP NHẬT: Render thông tin người dùng động */}
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{getAvatarInitials(userName)}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>{userRole}</span>
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