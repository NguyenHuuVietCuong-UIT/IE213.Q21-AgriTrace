import React, { useState } from 'react';
import { LuPlus, LuCircleCheck, LuExternalLink, LuChevronDown, LuChevronUp } from "react-icons/lu";
import styles from './BatchCard.module.css';

const BatchCard = ({ batch, onAddActivity, onComplete }) => {
  // THÊM STATE ĐỂ ĐÓNG/MỞ NHẬT KÝ
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  const renderStatus = () => {
    switch (batch.status) {
      case 'PENDING': return <span className={styles.badgeFarming}>Đang canh tác</span>;
      case 'LOCKED': return <span className={styles.badgePending}>Chờ kiểm định</span>;
      case 'MINTED': return <span className={styles.badgeMinted}>Đã đúc NFT</span>;
      default: return <span className={styles.badgeFarming}>{batch.status}</span>;
    }
  };

  const productName = batch.productId?.name || 'Sản phẩm chưa rõ';
  const quantity = batch.quantity ? `${batch.quantity} kg` : 'N/A';
  const logsCount = batch.logs ? batch.logs.length : 0;
  const progress = Math.min(logsCount * 25, 100);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Lô hàng: {batch._id?.slice(-6).toUpperCase()}</h3>
        <div className={styles.tags}>
          {renderStatus()}
          <span className={styles.tag}>{productName}</span>
          <span className={styles.tag}>{quantity}</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>Tiến độ (Ước tính)</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className={styles.actions}>
        {batch.status === 'PENDING' && (
          <>
            <button className={styles.btnPrimary} onClick={() => onAddActivity(batch._id)}>
              <LuPlus /> Thêm HĐ
            </button>
            <button className={styles.btnOutline} onClick={() => onComplete(batch._id)}>
              <LuCircleCheck /> Hoàn tất
            </button>
          </>
        )}
        {batch.status === 'LOCKED' && <button className={styles.btnWait} disabled>Chờ kiểm định...</button>}
        {batch.status === 'MINTED' && <button className={styles.btnNFT}><LuExternalLink /> Xem NFT</button>}
      </div>

      {/* NÚT XEM NHẬT KÝ (CÓ TÍNH NĂNG TOGGLE) */}
      <button
        className={styles.btnLogs}
        onClick={() => setIsLogsOpen(!isLogsOpen)}
      >
        {isLogsOpen ? <LuChevronUp /> : <LuChevronDown />}
        {isLogsOpen ? 'Thu gọn' : `Xem nhật ký (${logsCount} hoạt động)`}
      </button>

      {/* KHU VỰC HIỂN THỊ DANH SÁCH NHẬT KÝ */}
      {isLogsOpen && (
        <div className={styles.logsContainer}>
          {logsCount === 0 ? (
            <p className={styles.noLogs}>Chưa có hoạt động nào.</p>
          ) : (
            <ul className={styles.logsList}>
              {batch.logs.map((log, index) => (
                <li key={index} className={styles.logItem}>
                  <div className={styles.logHeader}>
                    <span className={styles.logAction}>{log.action}</span>
                    <span className={styles.logDate}>
                      {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className={styles.logLocation}>📍 {log.location}</div>
                  {log.imageUrl && (
                    <img src={log.imageUrl} alt="Hình ảnh hoạt động" className={styles.logImage} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchCard;