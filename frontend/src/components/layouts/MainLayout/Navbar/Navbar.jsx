import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LuSearch, LuLightbulb, LuUsers } from 'react-icons/lu';
import { AgriTraceIcon } from '../../../Icons/Icons';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Xử lý click bên ngoài để đóng dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      {/* Khối Logo - Nhấn vào quay về Home */}
      <Link to="/" className={styles.logoContainer} style={{ textDecoration: 'none' }}>
        <div className={styles.logoIcon}>
          <AgriTraceIcon />
        </div>
        <span className={styles.logoText}>AgriTrace</span>
      </Link>

      <div className={styles.navContent}>
        <ul className={styles.navLinks}>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
              <LuSearch className={styles.navIcon} />
              <span className={styles.navText}>Tra cứu</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/technology" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
              <LuLightbulb className={styles.navIcon} />
              <span className={styles.navText}>Công nghệ</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
              <LuUsers className={styles.navIcon} />
              <span className={styles.navText}>Về chúng tôi</span>
            </NavLink>
          </li>
        </ul>

        {user ? (
          <div className={styles.avatarWrapper} ref={dropdownRef}>
            <div
              className={styles.avatarBtn}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10B981&color=fff`}
                alt="avatar"
                className={styles.userAvatar}
              />
            </div>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfo}>
                  <p className={styles.userName}>{user.name}</p>
                  <p className={styles.userRole}>
                    {user.role === 'FARMER'
                      ? 'Nông dân'
                      : user.role === 'INSPECTOR'
                        ? 'Kiểm định viên'
                        : user.role === 'DELIVERER'
                          ? 'Người vận chuyển'
                          : 'Không xác định'}
                  </p>
                </div>
                <hr />
                {user.role === 'FARMER' ? (
                  <Link to="/farmer/dashboard" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                    Dashboard Nông dân
                  </Link>
                ) : user.role === 'INSPECTOR' ? (
                  <Link to="/inspector" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                    Dashboard Kiểm định
                  </Link>
                ) : user.role === 'DELIVERER' ? (
                  <Link to="/shipping" className={styles.dropItem} onClick={() => setShowDropdown(false)}>
                    Dashboard Vận chuyển
                  </Link>
                ) : null}
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

export default Navbar;