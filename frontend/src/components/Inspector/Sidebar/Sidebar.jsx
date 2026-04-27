import React from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';
import { AgriTraceIcon, MetaMaskIcon } from '../Icons/Icons';

export const Sidebar = ({ account, onConnect, isConnecting, currentTab, onTabChange }) => {
    return (
        <div className={styles.sidebar}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className={styles.logo}>
                    <AgriTraceIcon />
                    <div>
                        <div className={styles.logoTextMain}>AgriTrace</div>
                        <div className={styles.logoTextSub}>Inspector Portal</div>
                    </div>
                </div>
            </Link>

            <nav className={styles.menu}>
                <button
                    onClick={() => onTabChange('overview')}
                    className={`${styles.menuItem} ${currentTab === 'overview' ? styles.active : ''}`}
                >
                    Tổng quan
                </button>
                <button
                    onClick={() => onTabChange('history')}
                    className={`${styles.menuItem} ${currentTab === 'history' ? styles.active : ''}`}
                >
                    Lịch sử
                </button>
                <button
                    onClick={() => onTabChange('settings')}
                    className={`${styles.menuItem} ${currentTab === 'settings' ? styles.active : ''}`}
                >
                    Cài đặt ví
                </button>
            </nav>

            <div className={styles.connectedWallet}>
                <div className={styles.walletHeader}>
                    <div className={styles.metaMaskContainer}><MetaMaskIcon /></div>
                    <div className={styles.walletTextGroup}>
                        <div className={styles.walletLabel}>Ví MetaMask</div>
                        {account ? (
                            <div className={styles.address}>
                                {`${account.slice(0, 4)}...${account.slice(-4)}`}
                            </div>
                        ) : (
                            <button className={styles.miniConnect} onClick={onConnect}>
                                {isConnecting ? '...' : 'Kết nối'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};