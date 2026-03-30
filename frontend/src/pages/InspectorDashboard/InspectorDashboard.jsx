import React, { useState, useEffect } from 'react';
import { LuBox, LuCircleCheck, LuClock, LuTriangleAlert } from "react-icons/lu";
import BatchCard from '../../components/Inspector/BatchCard/BatchCard';
// Vẫn import Sidebar nhưng giờ nó đóng vai trò như thanh Header nằm ngang
import { Sidebar } from '../../components/Inspector/Sidebar/Sidebar';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

export const InspectorDashboard = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy trạng thái ví từ hook Web3 để truyền xuống Sidebar
    const { account, isConnecting, isMinting, connectWallet, handleMintNFT } = useWeb3();

    const getAuthToken = () => localStorage.getItem('token');

    // Hàm gọi DB lấy danh sách lô hàng
    const fetchBatchesFromDB = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch('http://localhost:5000/api/batches/pending', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            const result = await response.json();

            // Xử lý linh hoạt dữ liệu trả về từ API
            if (Array.isArray(result)) {
                setBatches(result);
            } else if (result.success && Array.isArray(result.data)) {
                setBatches(result.data);
            } else {
                setBatches([]);
            }
        } catch (error) {
            console.error('Lỗi API:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatchesFromDB();
    }, []);

    // Hàm xử lý Đúc NFT
    const handleApproveAndMint = async (batchId) => {
        try {
            const token = getAuthToken();

            // 1. Lưu IPFS
            const pinRes = await fetch(`http://localhost:5000/api/batches/${batchId}/pin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const pinData = await pinRes.json();
            if (!pinData.success) throw new Error(pinData.message || "Lỗi IPFS");

            // 2. Ký ví MetaMask
            const mintResult = await handleMintNFT(`ipfs://${pinData.ipfsHash}`);
            if (!mintResult) return;

            // 3. Cập nhật DB
            const confirmRes = await fetch(`http://localhost:5000/api/batches/${batchId}/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tokenId: mintResult.tokenId,
                    txHash: mintResult.txHash
                })
            });

            if (confirmRes.ok) {
                alert(`🎉 Đã cấp chứng nhận NFT thành công!`);
                fetchBatchesFromDB(); // Reset lại danh sách
            }
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
        }
    };

    // Thống kê
    const stats = {
        total: batches.length,
        pending: batches.filter(b => b.status === 'LOCKED').length,
        approved: batches.filter(b => b.status === 'MINTED').length,
        rejected: batches.filter(b => b.status === 'REJECTED').length
    };

    return (
        <div className={styles.layout}>
            {/* Thanh Sidebar nay đã thành Header ngang */}
            <Sidebar
                account={account}
                onConnect={connectWallet}
                isConnecting={isConnecting}
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
                    ) : batches.length === 0 ? (
                        <p className={styles.emptyText}>Hiện không có lô hàng nào cần xử lý.</p>
                    ) : (
                        <div className={styles.batchGrid}>
                            {batches.map(batch => (
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