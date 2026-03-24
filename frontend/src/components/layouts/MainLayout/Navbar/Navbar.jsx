import React from 'react';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      {/* Khối Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>LOGO</div>
        <span className={styles.logoText}>AgriTrace</span>
      </div>

      {/* Khối Menu */}
      <div className={styles.navContent}>
        <ul className={styles.navLinks}>
          <li><a href="#search" className={styles.link}>Tra cứu</a></li>
          <li><a href="#how-it-works" className={styles.link}>Cách hoạt động</a></li>
          <li><a href="#about" className={styles.link}>Về chúng tôi</a></li>
        </ul>

        {/* Nút Đăng nhập */}
        <Link to="/login" className={styles.loginBtn}>
          Đăng nhập
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;