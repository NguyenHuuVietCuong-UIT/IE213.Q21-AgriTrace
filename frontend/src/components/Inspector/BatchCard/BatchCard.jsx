import React from 'react';
import styles from './BatchCard.module.css';

export const BatchCard = ({ batch, onMint, isMinting }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{batch.name}</h3>
                <span className={styles.statusBadge}>{batch.status}</span>
            </div>

            <p className={styles.info}>👤 {batch.farmer} | 📍 {batch.location}</p>

            <div className={styles.gridInfo}>
                <div><small>Loại cây</small><p>{batch.cropType}</p></div>
                <div><small>Diện tích</small><p>{batch.area}</p></div>
                <div><small>Sản lượng</small><p>{batch.quantity}</p></div>
            </div>

            <div className={styles.progressArea}>
                <div className={styles.progressText}>Tiến độ <span>{batch.progress}%</span></div>
                <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${batch.progress}%` }}></div></div>
            </div>

            <button
                className={styles.mintBtn}
                onClick={() => onMint(batch.id)}
                disabled={isMinting}
            >
                {isMinting ? '⏳ Đang xử lý Blockchain...' : 'Xem hồ sơ & Duyệt'}
            </button>
        </div>
    );
};