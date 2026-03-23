import React from 'react';
// 1. ĐÃ SỬA Ở ĐÂY: LuCheckCircle đổi thành LuCircleCheck
import { LuPlus, LuCircleCheck, LuExternalLink, LuChevronDown } from "react-icons/lu";
import styles from './BatchCard.module.css';

const BatchCard = ({ batch, onAddActivity, onComplete }) => {
  // Hàm render Badge trạng thái
  const renderStatus = () => {
    switch(batch.status) {
      case 'farming': return <span className={styles.badgeFarming}>Đang canh tác</span>;
      case 'pending': return <span className={styles.badgePending}>Chờ kiểm định</span>;
      case 'minted': return <span className={styles.badgeMinted}>Đã đúc NFT</span>;
      default: return null;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{batch.name}</h3>
        <div className={styles.tags}>
          {renderStatus()}
          <span className={styles.tag}>{batch.product}</span>
          <span className={styles.tag}>{batch.area}</span>
          <span className={styles.tag}>{batch.weight}</span>
        </div>
      </div>

      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span>Tiến độ</span>
          <span>{batch.progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${batch.progress}%` }}></div>
        </div>
      </div>

      <div className={styles.actions}>
        {batch.status === 'farming' && (
          <>
            <button className={styles.btnPrimary} onClick={() => onAddActivity(batch.id)}>
              <LuPlus /> Thêm hoạt động
            </button>
            {/* 2. ĐÃ SỬA Ở ĐÂY: Thẻ LuCheckCircle đổi thành LuCircleCheck */}
            <button className={styles.btnOutline} onClick={() => onComplete(batch.id)}>
              <LuCircleCheck /> Hoàn tất
            </button>
          </>
        )}

        {batch.status === 'pending' && (
          <button className={styles.btnWait} disabled>Đang chờ kiểm định...</button>
        )}

        {batch.status === 'minted' && (
          <button className={styles.btnNFT}>
            <LuExternalLink /> Xem NFT
          </button>
        )}
      </div>

      <button className={styles.btnLogs}>
        <LuChevronDown /> Xem nhật ký ({batch.logs.length} hoạt động)
      </button>
    </div>
  );
};

export default BatchCard;