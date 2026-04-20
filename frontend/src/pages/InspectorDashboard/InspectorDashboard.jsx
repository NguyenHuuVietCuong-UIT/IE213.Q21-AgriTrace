import React, { useState, useEffect } from 'react';
import { LuBox, LuCircleCheck, LuClock, LuTriangleAlert, LuWallet, LuHistory, LuLayoutDashboard } from "react-icons/lu";
import BatchCard from '../../components/Inspector/BatchCard/BatchCard';
import { Sidebar } from '../../components/Inspector/Sidebar/Sidebar';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

export const InspectorDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTab, setCurrentTab] = useState('overview');
    const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });
    const [processingId, setProcessingId] = useState(null);

    const { account, networkName, balance, isConnecting, isMinting, connectWallet, disconnectWallet, handleMintNFT } = useWeb3();
    const getAuthToken = () => localStorage.getItem('token');

    const fetchBatchesFromDB = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            // Lấy toàn bộ lô hàng liên quan đến inspector để phân loại vào các Tab
            const response = await fetch('http://localhost:5000/api/batches/inspector-all', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            const result = await response.json();
            setBatches(Array.isArray(result) ? result : (result.data || []));
        } catch (error) {
            console.error('Lỗi API:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBatchesFromDB(); }, []);

    const handleApproveAndMint = async (batchId) => {
        setProcessingId(batchId);
        try {
            const token = getAuthToken();
            const pinRes = await fetch(`http://localhost:5000/api/batches/${batchId}/pin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pinData = await pinRes.json();
            if (!pinData.success) throw new Error(pinData.message || "Lỗi IPFS");

            const mintResult = await handleMintNFT(`ipfs://${pinData.ipfsHash}`);
            if (!mintResult) return;

            const confirmRes = await fetch(`http://localhost:5000/api/batches/${batchId}/mint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tokenId: mintResult.tokenId, txHash: mintResult.txHash })
            });

            if (confirmRes.ok) {
                setMessageModal({ isOpen: true, message: 'Cấp chứng nhận NFT thành công!', type: 'success' });
                fetchBatchesFromDB();
            }
        } catch (err) {
            setMessageModal({ isOpen: true, message: `Lỗi: ${err.message}`, type: 'error' });
        } finally {
            setProcessingId(null);
        }
    };

    const stats = {
        total: batches.length,
        pending: batches.filter(b => b.status === 'LOCKED').length,
        approved: batches.filter(b => b.status === 'MINTED').length,
        rejected: batches.filter(b => b.status === 'REJECTED').length
    };

    const renderContent = () => {
        if (loading) return <div className={styles.loadingArea}>Đang tải dữ liệu hệ thống...</div>;

        switch (currentTab) {
            case 'history':
                const historyBatches = batches.filter(b => b.status === 'MINTED' || b.status === 'REJECTED');
                return (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <LuHistory /> <h2>Lịch sử kiểm định</h2>
                        </div>
                        {historyBatches.length === 0 ? (
                            <p className={styles.emptyText}>Bạn chưa thực hiện kiểm định lô hàng nào.</p>
                        ) : (
                            <div className={styles.batchGrid}>
                                {historyBatches.map(batch => (
                                    <BatchCard key={batch._id} batch={batch} isDisabled={true} />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'settings':
                return (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <LuWallet /> <h2>Cài đặt ví MetaMask</h2>
                        </div>
                        <div className={styles.settingsCard}>
                            <div className={styles.walletInfoRow}>
                                <span>Địa chỉ ví hiện tại:</span>
                                <strong>
                                    {account
                                        ? `${account.slice(0, 6)}...${account.slice(-4)}`
                                        : 'Chưa kết nối'}
                                </strong>
                            </div>
                            <div className={styles.walletInfoRow}>
                                <span>Số dư phí Gas:</span>
                                <strong style={{ color: balance < 0.01 ? '#ef4444' : '#10b981' }}>
                                    {account ? `${balance} ETH` : '0 ETH'}
                                </strong>
                            </div>
                            <div className={styles.walletInfoRow}>
                                <span>Mạng lưới:</span>
                                <span className={styles.networkTag}>
                                    {account ? (networkName || 'Đang tải...') : 'Chưa kết nối'}
                                </span>
                            </div>
                            <button
                                className={account ? styles.disconnectBtn : styles.connectBtn}
                                onClick={account ? disconnectWallet : connectWallet}
                            >
                                {account ? 'Ngắt kết nối ví' : 'Kết nối ví'}
                            </button>
                        </div>
                    </div>
                );

            default:
                const pendingBatches = batches.filter(b => b.status === 'LOCKED');
                return (
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <LuLayoutDashboard /> <h2>Danh sách cần phê duyệt</h2>
                        </div>
                        {pendingBatches.length === 0 ? (
                            <p className={styles.emptyText}>Hiện không có lô hàng nào đang chờ duyệt.</p>
                        ) : (
                            <div className={styles.batchGrid}>
                                {pendingBatches.map(batch => (
                                    <BatchCard
                                        key={batch._id}
                                        batch={batch}
                                        onMint={handleApproveAndMint}
                                        isMinting={isMinting && processingId === batch._id}
                                        isDisabled={processingId !== null && processingId !== batch._id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className={styles.layout}>
            {messageModal.isOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={messageModal.type === 'error' ? styles.err : styles.ok}>
                            {messageModal.type === 'error' ? 'Thất bại' : 'Thành công'}
                        </h3>
                        <p>{messageModal.message}</p>
                        <button onClick={() => setMessageModal({ ...messageModal, isOpen: false })}>Đóng</button>
                    </div>
                </div>
            )}

            <Sidebar
                account={account}
                onConnect={connectWallet}
                isConnecting={isConnecting}
                currentTab={currentTab}
                onTabChange={setCurrentTab}
            />

            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Quản lý Kiểm định</h1>
                    <p>Chào mừng bạn quay lại hệ thống duyệt lô hàng</p>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.blue}`}><LuBox /></div>
                        <div className={styles.statInfo}><p>Tổng yêu cầu</p><h3>{stats.total}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.yellow}`}><LuClock /></div>
                        <div className={styles.statInfo}><p>Đang chờ</p><h3>{stats.pending}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.green}`}><LuCircleCheck /></div>
                        <div className={styles.statInfo}><p>Đã cấp NFT</p><h3>{stats.approved}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.red}`}><LuTriangleAlert /></div>
                        <div className={styles.statInfo}><p>Từ chối</p><h3>{stats.rejected}</h3></div>
                    </div>
                </div>

                {renderContent()}
            </main>
        </div>
    );
};