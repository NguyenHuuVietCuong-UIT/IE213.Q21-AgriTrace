import React, { useState, useEffect } from 'react';
import { LuBox, LuCircleCheck, LuClock, LuTriangleAlert } from "react-icons/lu";
import BatchCard from '../../components/Inspector/BatchCard/BatchCard';
import { Sidebar } from '../../components/Inspector/Sidebar/Sidebar';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css'; // [GIỮ NGUYÊN]

export const InspectorDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // [TẠO MỚI] State quản lý Modal thông báo thay cho alert()
    const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });

    const { account, isConnecting, isMinting, connectWallet, handleMintNFT } = useWeb3();

    const getAuthToken = () => localStorage.getItem('token');

    // [GIỮ NGUYÊN]
    const fetchBatchesFromDB = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/batches/pending', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            const result = await response.json();

            if (Array.isArray(result)) setBatches(result);
            else if (result.success && Array.isArray(result.data)) setBatches(result.data);
            else setBatches([]);
        } catch (error) {
            console.error('Lỗi API:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBatchesFromDB(); }, []);

    // [SỬA ĐỔI] Thay alert bằng Modal
    const handleApproveAndMint = async (batchId) => {
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
                setMessageModal({ isOpen: true, message: '🎉 Đã cấp chứng nhận NFT thành công!', type: 'success' });
                fetchBatchesFromDB();
            }
        } catch (err) {
            setMessageModal({ isOpen: true, message: `❌ Lỗi: ${err.message}`, type: 'error' });
        }
    };

    const stats = {
        total: batches.length,
        pending: batches.filter(b => b.status === 'LOCKED').length,
        approved: batches.filter(b => b.status === 'MINTED').length,
        rejected: batches.filter(b => b.status === 'REJECTED').length
    };

    return (
        <div className={styles.layout}>
            {/* [TẠO MỚI] Modal Overlay ngay trong Layout */}
            {messageModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: '#fff', padding: '30px', borderRadius: '12px',
                        minWidth: '300px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ color: messageModal.type === 'error' ? '#ef4444' : '#10b981' }}>
                            {messageModal.type === 'error' ? 'Thất bại' : 'Thành công'}
                        </h3>
                        <p style={{ margin: '20px 0', color: '#374151' }}>{messageModal.message}</p>
                        <button
                            onClick={() => setMessageModal({ isOpen: false, message: '', type: 'success' })}
                            style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {/* [GIỮ NGUYÊN] */}
            <Sidebar account={account} onConnect={connectWallet} isConnecting={isConnecting} />

            <main className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Quản lý Kiểm định</h1>
                    <p>Chào mừng bạn quay lại hệ thống duyệt lô hàng</p>
                </div>

                {/* KHU VỰC THỐNG KÊ [GIỮ NGUYÊN] */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.blue}`}><LuBox /></div>
                        <div className={styles.statInfo}><p>Tổng yêu cầu</p><h3>{stats.total}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.yellow}`}><LuClock /></div>
                        <div className={styles.statInfo}><p>Đang chờ duyệt</p><h3>{stats.pending}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.green}`}><LuCircleCheck /></div>
                        <div className={styles.statInfo}><p>Đã cấp NFT</p><h3>{stats.approved}</h3></div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.iconWrapper} ${styles.red}`}><LuTriangleAlert /></div>
                        <div className={styles.statInfo}><p>Bị từ chối</p><h3>{stats.rejected}</h3></div>
                    </div>
                </div>

                <div className={styles.batchSection}>
                    <h2>Danh sách lô hàng cần phê duyệt</h2>
                    {loading ? (
                        <div className={styles.loadingArea}>Đang tải dữ liệu...</div>
                    ) : batches.filter(b => b.status === 'LOCKED').length === 0 ? (
                        <p className={styles.emptyText}>Hiện không có lô hàng nào cần phê duyệt.</p>
                    ) : (
                        <div className={styles.batchGrid}>
                            {batches
                                .filter(batch => batch.status === 'LOCKED')
                                .map(batch => (
                                    <BatchCard
                                        key={batch._id}
                                        batch={batch}
                                        onMint={handleApproveAndMint}
                                        isMinting={isMinting}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InspectorDashboard;