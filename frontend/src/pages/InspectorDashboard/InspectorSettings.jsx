import React from 'react';
import { LuWallet } from "react-icons/lu";
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

export const InspectorSettings = () => {
    const { account, networkName, balance, connectWallet, disconnectWallet } = useWeb3();

    // Kiểm tra cờ ẩn ví trực tiếp từ bộ nhớ
    const isWalletHidden = localStorage.getItem('wallet_hidden') === 'true';

    const handleDisconnect = () => {
        disconnectWallet();
        localStorage.setItem('wallet_hidden', 'true'); // Cắm cờ ẩn ví
        window.location.reload(); // F5 để đồng bộ toàn hệ thống ngay lập tức
    };

    const handleConnect = async () => {
        await connectWallet();
        localStorage.removeItem('wallet_hidden'); // Xóa cờ ẩn ví
        window.location.reload(); // F5 để Navbar lấy lại địa chỉ ví
    };

    // Chỉ hiển thị ví khi có account VÀ cờ ẩn ví không bị bật
    const showWalletInfo = account && !isWalletHidden;

    return (
        <div className={styles.layout}>
            <div className={styles.mainContent}>

                <div className={styles.header}>
                    <h1>Cài đặt ví</h1>
                </div>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <LuWallet /> <h2>Cài đặt ví MetaMask</h2>
                    </div>
                    <div className={styles.settingsCard}>
                        <div className={styles.walletInfoRow}>
                            <span>Địa chỉ ví hiện tại:</span>
                            <strong>
                                {showWalletInfo ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Chưa kết nối'}
                            </strong>
                        </div>
                        <div className={styles.walletInfoRow}>
                            <span>Số dư phí Gas:</span>
                            <strong style={{ color: (showWalletInfo && balance < 0.01) ? '#ef4444' : '#10b981' }}>
                                {showWalletInfo ? `${balance} ETH` : '0 ETH'}
                            </strong>
                        </div>
                        <div className={styles.walletInfoRow}>
                            <span>Mạng lưới:</span>
                            <span className={styles.networkTag}>
                                {showWalletInfo ? (networkName || 'Đang tải...') : 'Chưa kết nối'}
                            </span>
                        </div>

                        <button
                            className={showWalletInfo ? styles.disconnectBtn : styles.connectBtn}
                            onClick={showWalletInfo ? handleDisconnect : handleConnect}
                        >
                            {showWalletInfo ? 'Ngắt kết nối ví' : 'Kết nối ví'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};