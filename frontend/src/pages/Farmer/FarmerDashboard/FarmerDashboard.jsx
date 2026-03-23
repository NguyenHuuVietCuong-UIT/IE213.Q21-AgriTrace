import React, { useState, useEffect } from 'react';
// SỬA LẠI DÒNG NÀY: Import đúng 4 icon dành riêng cho thẻ thống kê
import { LuBox, LuTrendingUp, LuPackageCheck, LuAward } from "react-icons/lu";
import { storageService } from '../../../services/storageService';
import BatchCard from '../../../components/Farmer/BatchCard/BatchCard';
import styles from './FarmerDashboard.module.css';

const FarmerDashboard = () => {
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    storageService.init(); // Khởi tạo dữ liệu mẫu
    setBatches(storageService.getBatches());
  }, []);

  const handleComplete = (id) => {
    if(window.confirm("Xác nhận hoàn tất lô hàng này?")) {
      const updated = storageService.updateStatus(id, 'pending');
      setBatches(updated); // Cập nhật lại State để giao diện đổi ngay lập tức
    }
  };

  const handleAddActivity = (id) => {
    const action = prompt("Nhập hoạt động canh tác:");
    if(action) {
      const updated = storageService.addLog(id, action);
      setBatches(updated);
    }
  };

  // TÍNH TOÁN SỐ LIỆU CHO 4 THẺ THỐNG KÊ
  const totalBatches = batches.length;
  const farmingCount = batches.filter(b => b.status === 'farming').length;
  const pendingCount = batches.filter(b => b.status === 'pending').length;
  const mintedCount = batches.filter(b => b.status === 'minted').length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Tổng quan trang trại</h1>
        <p>Quản lý các lô hàng và hoạt động canh tác</p>
      </header>

      {/* KHU VỰC THỐNG KÊ */}
      <div className={styles.statsGrid}>
        {/* Thẻ 1: Tổng số */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span>Tổng số lô</span>
            <div className={styles.statNumber}>{totalBatches}</div>
          </div>
          <div className={`${styles.statIcon} ${styles.iconTotal}`}><LuBox /></div>
        </div>

        {/* Thẻ 2: Đang canh tác */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span>Đang canh tác</span>
            <div className={styles.statNumber} style={{color: '#10b981'}}>{farmingCount}</div>
          </div>
          <div className={`${styles.statIcon} ${styles.iconFarming}`}><LuTrendingUp /></div>
        </div>

        {/* Thẻ 3: Chờ kiểm định */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span>Chờ kiểm định</span>
            <div className={styles.statNumber} style={{color: '#f59e0b'}}>{pendingCount}</div>
          </div>
          <div className={`${styles.statIcon} ${styles.iconPending}`}><LuPackageCheck /></div>
        </div>

        {/* Thẻ 4: Đã đúc NFT */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span>Đã đúc NFT</span>
            <div className={styles.statNumber} style={{color: '#3b82f6'}}>{mintedCount}</div>
          </div>
          <div className={`${styles.statIcon} ${styles.iconMinted}`}><LuAward /></div>
        </div>
      </div>

      {/* Grid danh sách lô hàng */}
      <div className={styles.batchGrid}>
        {batches.map(batch => (
          <BatchCard 
            key={batch.id} 
            batch={batch} 
            onComplete={handleComplete}
            onAddActivity={handleAddActivity}
          />
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;