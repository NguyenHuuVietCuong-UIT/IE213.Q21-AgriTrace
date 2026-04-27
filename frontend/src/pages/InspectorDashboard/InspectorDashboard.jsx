import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuBox, LuCircleCheck, LuClock, LuTriangleAlert, LuLayoutDashboard } from "react-icons/lu";
import BatchCard from '../../components/Inspector/BatchCard/BatchCard';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

export const InspectorDashboard = () => {
    // Lấy data từ Layout
    const { batches, loading, stats, fetchBatchesFromDB } = useOutletContext();
    const { isMinting, handleMintNFT } = useWeb3();

    const [messageModal, setMessageModal] = useState({ isOpen: false, message: '', type: 'success' });
    const [processingId, setProcessingId] = useState(null);
    const getAuthToken = () => localStorage.getItem('token');

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

    if (loading) return <div className={styles.loadingArea}>Đang tải dữ liệu hệ thống...</div>;

    const pendingBatches = batches.filter(b => b.status === 'LOCKED');

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

            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Quản lý Kiểm định</h1>
                    <p>Chào mừng bạn quay lại hệ thống duyệt lô hàng</p>
                </div>

                {/* Grid Stats */}
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

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <LuLayoutDashboard /> <h2>Danh sách cần phê duyệt</h2>
                    </div>
                    {pendingBatches.length === 0 ? (
                        <p className={styles.emptyText}>Hiện không có lô hàng nào đang chờ duyệt.</p>
                    ) : (
                        <div className={styles.batchGrid}>
                            {pendingBatches.map(batch => (
                                <BatchCard key={batch._id} batch={batch} onMint={handleApproveAndMint} isMinting={isMinting && processingId === batch._id} isDisabled={processingId !== null && processingId !== batch._id} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};