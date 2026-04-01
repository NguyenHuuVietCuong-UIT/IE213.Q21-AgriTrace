import React, { useState, useEffect } from 'react'; 
import { NavLink } from 'react-router-dom';
import { LuLeaf, LuLayoutDashboard, LuBook, LuUser, LuBell } from "react-icons/lu";
import styles from './FarmerNavbar.module.css';

const FarmerNavbar = () => {
  const [user, setUser] = useState(null);

  // Lấy thông tin user từ localStorage khi component được render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi parse dữ liệu user:", error);
      }
    }
  }, []);

  // Xử lý giá trị hiển thị (fallback nếu chưa có data)
  const userName = user?.name || 'Đang tải...';
  const userRole = user?.role === 'FARMER' ? 'Nông dân' : (user?.role || 'Khách');

  // Hàm tạo Avatar từ các chữ cái đầu của Tên
  const getAvatarInitials = (name) => {
    if (!name || name === 'Đang tải...') return 'AG'; 
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  return (
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

      {/* Thông tin User và Thông báo */}
      <div className={styles.userSection}>
        <div className={styles.notification}>
          <LuBell size={22} color="#475569" />
          <span className={styles.badge}>3</span>
        </div>

        <div className={styles.userInfo}>
          {/* 2. ĐÃ SỬA: Dùng hàm tạo avatar động */}
          <div className={styles.avatar}>{getAvatarInitials(userName)}</div>
          
          <div className={styles.userDetails}>
            {/* 3. ĐÃ SỬA: Dùng biến userName và userRole động */}
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FarmerNavbar;