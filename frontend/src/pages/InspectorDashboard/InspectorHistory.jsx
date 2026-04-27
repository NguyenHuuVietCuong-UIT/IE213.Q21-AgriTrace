import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuHistory } from "react-icons/lu";
import BatchCard from '../../components/Inspector/BatchCard/BatchCard';
import styles from './InspectorDashboard.module.css';

export const InspectorHistory = () => {
    const { batches, loading } = useOutletContext();

    if (loading) return <div className={styles.loadingArea}>Đang tải dữ liệu lịch sử...</div>;

    const historyBatches = batches.filter(b => b.status === 'MINTED' || b.status === 'REJECTED');

    return (
        <div className={styles.layout}>
            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <h1>Lịch sử kiểm định</h1>
                </div>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <LuHistory /> <h2>Danh sách đã duyệt/từ chối</h2>
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
            </div>
        </div>
    );
};