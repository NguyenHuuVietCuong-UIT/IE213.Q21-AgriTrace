import React from 'react';
import styles from './BatchCard.module.css';

const BatchCard = ({ batch, onMint, isMinting, isDisabled }) => {
    // Truy xuất dữ liệu an toàn từ Object ID hoặc Populate
    const productName = batch.productId?.name || "Sản phẩm nông sản";
    const farmerName = batch.farmId?.owner?.name || "Nông dân";

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>Lô {productName}</h3>
                <span className={`${styles.statusBadge} ${styles[batch.status?.toLowerCase()] || ''}`}>
                    {batch.status === 'LOCKED' ? 'Chờ duyệt' : batch.status}
                </span>
            </div>

            <p className={styles.info}>👤 {farmerName}</p>

            <div className={styles.gridInfo}>
                <div><small>Trọng lượng</small><p>{batch.quantity} kg</p></div>
                <div><small>Mã lô</small><p>{batch._id?.slice(-6).toUpperCase()}</p></div>
            </div>

            <button
                className={styles.mintBtn}
                onClick={() => onMint(batch._id)}
                disabled={isMinting || isDisabled}
            >
                {isMinting ? '⏳ Đang đúc NFT...' : 'Phê duyệt & Đúc NFT'}
            </button>
        </div>
    );
};

export default BatchCard;