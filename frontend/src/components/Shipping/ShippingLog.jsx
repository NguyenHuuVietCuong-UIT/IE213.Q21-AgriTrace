import React from 'react';
import { LuMapPin, LuClock, LuUser } from 'react-icons/lu';
import styles from './ShippingLog.module.css';

/**
 * Component: ShippingLog
 * Hiển thị lịch sử vận chuyển của lô hàng (logs từ shipping updates)
 */
const ShippingLog = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <LuMapPin size={32} />
        <p>Chưa có cập nhật vận chuyển</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>📍 Lịch sử vận chuyển</h3>
      
      <div className={styles.timeline}>
        {logs.map((log, index) => (
          <div key={index} className={styles.timelineItem}>
            <div className={styles.timelineMarker}>
              <div className={styles.dot}></div>
              {index !== logs.length - 1 && <div className={styles.line}></div>}
            </div>

            <div className={styles.content}>
              <div className={styles.header}>
                <h4 className={styles.action}>{log.action}</h4>
                <span className={styles.time}>
                  <LuClock size={14} />
                  {formatDate(log.timestamp)}
                </span>
              </div>

              <div className={styles.location}>
                <LuMapPin size={16} />
                {log.location}
              </div>

              {log.actorId && log.actorId !== 'null' && (
                <div className={styles.actor}>
                  <LuUser size={14} />
                  Cập nhật bởi: {log.actorId?.name || 'Người dùng'}
                </div>
              )}

              {!log.actorId || log.actorId === 'null' && (
                <div className={styles.actor + ' ' + styles.system}>
                  <LuUser size={14} />
                  Hệ thống tự động
                </div>
              )}

              {log.imageUrl && (
                <img src={log.imageUrl} alt="Shipping proof" className={styles.image} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingLog;
