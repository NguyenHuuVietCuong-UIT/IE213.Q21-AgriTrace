import React from 'react';
import styles from './StatCard.module.css';

export const StatCard = ({ title, value, icon, type }) => {
    // Biến type ('warning', 'danger', 'info') sẽ quyết định màu nền của icon
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <p className={styles.title}>{title}</p>
                <h2 className={styles.value}>{value}</h2>
            </div>
            <div className={`${styles.iconWrapper} ${styles[type]}`}>
                {icon}
            </div>
        </div>
    );
};