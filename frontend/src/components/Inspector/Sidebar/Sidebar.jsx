import React from 'react';
import styles from './Sidebar.module.css';
import { AgriTraceIcon, MetaMaskIcon } from '../Icons/Icons';

export const Sidebar = ({ account, onConnect, isConnecting }) => {
    return (
        <div className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <AgriTraceIcon />
                <div>
                    <div className={styles.logoTextMain}>AgriTrace</div>
                    <div className={styles.logoTextSub}>Inspector Portal</div>
                </div>
            </div>

            {/* Menu giữa */}
            <nav className={styles.menu}>
                <a href="#" className={`${styles.menuItem} ${styles.active}`}>🏠 Tổng quan</a>
                <a href="#" className={styles.menuItem}>📅 Lịch sử kiểm định</a>
                <a href="#" className={styles.menuItem}>⚙️ Cài đặt ví</a>
            </nav>

            {/* Ví MetaMask bên phải */}
            <div className={styles.connectedWallet}>
                <div className={styles.walletHeader}>
                    <div className={styles.metaMaskContainer}><MetaMaskIcon /></div>
                    <div>
                        <div className={styles.walletTextMain}>Trạng thái ví</div>
                        {account ? (
                            <div className={styles.walletTextSub}>
                                {`${account.slice(0, 6)}...${account.slice(-4)}`}
                                <span className={styles.network}>Sepolia</span>
                            </div>
                        ) : (
                            <button className={styles.connectBtn} onClick={onConnect} disabled={isConnecting}>
                                {isConnecting ? 'Đang kết nối...' : 'Connect Wallet'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};