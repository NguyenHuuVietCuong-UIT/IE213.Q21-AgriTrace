import React, { useState, useEffect } from 'react';
import { LuBox, LuTrendingUp, LuPackageCheck, LuAward } from "react-icons/lu";
import { storageService } from '../../../services/storageService';
import BatchCard from '../../../components/Farmer/BatchCard/BatchCard';
import styles from './FarmerDashboard.module.css';

const FarmerDashboard = () => {
  const [batches, setBatches] = useState([]);

  // Khởi tạo dữ liệu mẫu
  useEffect(() => {
    storageService.init(); 
    setBatches(storageService.getBatches());
  }, []);

  const handleComplete = (id) => {
    if(window.confirm("Xác nhận hoàn tất lô hàng này?")) {
      const updated = storageService.updateStatus(id, 'pending');
      setBatches(updated);
    }
  };

  const handleAddActivity = (id) => {
    const action = prompt("Nhập hoạt động canh tác:");
    if(action) {
      const updated = storageService.addLog(id, action);
      setBatches(updated);
    }
  };

  // Số liệu cho thống kê
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

      {/* Thống kê */}
      <div className={styles.statsGrid}>
        <StatCard 
          label="Tổng số lô" 
          value={totalBatches} 
          icon={<LuBox />} 
          iconClass={styles.iconTotal} 
        />
        <StatCard 
          label="Đang canh tác" 
          value={farmingCount} 
          valueColor="#10b981"
          icon={<LuTrendingUp />} 
          iconClass={styles.iconFarming} 
        />
        <StatCard 
          label="Chờ kiểm định" 
          value={pendingCount} 
          valueColor="#f59e0b"
          icon={<LuPackageCheck />} 
          iconClass={styles.iconPending} 
        />
        <StatCard 
          label="Đã đúc NFT" 
          value={mintedCount} 
          valueColor="#3b82f6"
          icon={<LuAward />} 
          iconClass={styles.iconMinted} 
        />
      </div>

      {/* Danh sách lô hàng */}
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

// Component con
const StatCard = ({ label, value, icon, iconClass, valueColor }) => (
  <div className={styles.statCard}>

    <div className={styles.statInfo}>
      <span>{label}</span>
      <div className={styles.statNumber} style={{ color: valueColor }}>
        {value}
      </div>
    </div>

    <div className={`${styles.statIcon} ${iconClass}`}>
      {icon}
    </div>
  </div>
);

export default FarmerDashboard;