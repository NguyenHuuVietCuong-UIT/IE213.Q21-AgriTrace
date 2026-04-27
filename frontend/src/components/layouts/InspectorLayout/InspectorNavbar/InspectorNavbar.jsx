import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AgriTraceIcon, MetaMaskIcon } from '../../../Icons/Icons';
import { useWeb3 } from '../../../../hooks/useWeb3';
import styles from './InspectorNavbar.module.css';

const InspectorNavbar = () => {
    const { account, isConnecting, connectWallet } = useWeb3();

    // Đọc cờ ẩn ví
    const isWalletHidden = localStorage.getItem('wallet_hidden') === 'true';

    // Hàm kết nối dành riêng cho nút trên Navbar
    const handleNavbarConnect = async () => {
        await connectWallet();
        localStorage.removeItem('wallet_hidden');
        window.location.reload();
    };

    // Điều kiện hiển thị
    const showWalletInfo = account && !isWalletHidden;

    return (
        <nav className={styles.navbar}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className={styles.logo}>
                    <AgriTraceIcon />
                    <div>
                        <div className={styles.logoTextMain}>AgriTrace</div>
                        <div className={styles.logoTextSub}>Inspector Portal</div>
                    </div>
                </div>
            </Link>

            {/* Menu Điều Hướng */}
            <div className={styles.menu}>
                <NavLink
                    to="/inspector/dashboard"
                    className={({ isActive }) => isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem}
                >
                    Tổng quan
                </NavLink>
                <NavLink
                    to="/inspector/history"
                    className={({ isActive }) => isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem}
                >
                    Lịch sử
                </NavLink>
                <NavLink
                    to="/inspector/settings"
                    className={({ isActive }) => isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem}
                >
                    Cài đặt ví
                </NavLink>
            </div>

            {/* Khối Ví MetaMask */}
            <div className={styles.connectedWallet}>
                <div className={styles.walletHeader}>
                    <div className={styles.metaMaskContainer}>
                        <MetaMaskIcon />
                    </div>
                    <div className={styles.walletTextGroup}>
                        <div className={styles.walletLabel}>Ví MetaMask</div>
                        {showWalletInfo ? (
                            <div className={styles.address}>
                                {`${account.slice(0, 4)}...${account.slice(-4)}`}
                            </div>
                        ) : (
                            <button className={styles.miniConnect} onClick={handleNavbarConnect}>
                                {isConnecting ? '...' : 'Kết nối'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default InspectorNavbar;