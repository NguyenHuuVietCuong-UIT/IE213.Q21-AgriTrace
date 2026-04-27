import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LuLeaf, LuLayoutDashboard, LuBook, LuUser, LuBell } from "react-icons/lu";
import styles from './FarmerNavbar.module.css';
import { AgriTraceIcon } from '../../../Icons/Icons';

const FarmerNavbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

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
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Xử lý click outside và thông tin
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/'); // Đẩy về trang chủ Customer
  };

  return (
    <nav className={styles.topbar}>
      {/* Logo */}
      <Link to="/" className={styles.logoLink}>
        <div className={styles.logoGroup}>
          <div className={styles.logoIcon}>
            <AgriTraceIcon />
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
          to="/farmer/farming-logs"
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
        {/* <div className={styles.notification}>
          <LuBell size={22} color="#475569" />
          <span className={styles.badge}>3</span>
        </div> */}

        {user ? (
          <div className={styles.avatarWrapper} ref={dropdownRef}>

            <div
              className={styles.userInfoTrigger}
              onClick={() => setShowDropdown(!showDropdown)}
            >

              {/* Đưa thông tin Role và Name lên Navbar*/}
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{getAvatarInitials(userName)}</div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>{userName}</span>
                  <span className={styles.userRole}>
                    {user.role === 'FARMER' ? 'Nông dân' : 'Kiểm định viên'}
                  </span>
                </div>
              </div>
            </div>

            {/* Khối Dropdown Menu */}
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{user.name}</p>
                </div>
                <hr />
                {user.role === 'FARMER' ? (
                  <Link to="/" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                    Trang chủ khách hàng
                  </Link>
                ) : (
                  <Link to="/inspector" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                    Dashboard Kiểm định
                  </Link>
                )}
                <Link to="/profile" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                  Thông tin cá nhân
                </Link>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn}>
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

export default FarmerNavbar;