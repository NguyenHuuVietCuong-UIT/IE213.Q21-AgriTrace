import React, { useState } from 'react';
import { 
  LuSearch, 
  LuShieldCheck, 
  LuScroll, 
  LuSprout, 
  LuScanQrCode 
} from "react-icons/lu";
import styles from './HeroBanner.module.css';

const HeroBanner = () => {
  const [productId, setProductId] = useState('');

  const handleLookup = () => {
    console.log("Đang tra cứu mã sản phẩm:", productId);
  };

  const handleQrUpload = () => {
    console.log("Mở camera/bộ nhớ để tải ảnh QR");
  };

  return (
    <section className={styles.heroContainer}>

      {/* Cột bên trái: Văn bản giới thiệu */}
      <div className={styles.contentLeft}>
        <h1 className={styles.heading}>
          Truy xuất nguồn gốc <br /> Nông sản minh bạch
        </h1>
        <p className={styles.description}>
          Quét mã QR để xem toàn bộ hành trình từ nông trại đến bàn ăn
        </p>
        
        {/* Các Badge tính năng */}
        <div className={styles.badgeGroup}>
          <FeatureBadge 
            icon={<LuShieldCheck />} 
            title="Blockchain" 
            desc="Bất biến" 
          />
          <FeatureBadge 
            icon={<LuScroll />} 
            title="VietGAP" 
            desc="Đạt chuẩn" 
          />
          <FeatureBadge 
            icon={<LuSprout />} 
            title="Organic" 
            desc="An toàn" 
          />
        </div>
      </div>

      {/* Cột bên phải form tra cứu */}
      <div className={styles.formRight}>

        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Tra cứu sản phẩm</h3>
          
          {/* Ô nhập mã qr */}
          <div className={styles.inputGroup}>
            <input 
              type="text"
              placeholder="Nhập mã sản phẩm (VD: MNG-2026-001)"
              className={styles.productInput}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          
          {/* Nút tra cứu ngay */}
          <button onClick={handleLookup} className={styles.lookupBtn}>
            <LuSearch /> Tra cứu ngay
          </button>
          
          {/* Thanh phân cách */}
          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          {/* Nút tải ảnh qr */}
          <button onClick={handleQrUpload} className={styles.qrBtn}>
            <LuScanQrCode /> Tải lên mã QR
          </button>
          
          {/* Thống kê pr*/}
          <p className={styles.counterText}>
            Hơn <span className={styles.counterHighlight}>10,000+</span> sản phẩm đã được xác thực
          </p>
        </div>
      </div>
    </section>
  );
};

// Component con nội bộ cho Badge
const FeatureBadge = ({ icon, title, desc }) => (
  <div className={styles.badgeItem}>

    <div className={styles.badgeIcon}>{icon}</div>

    <div className={styles.badgeText}>
      <div className={styles.badgeTitle}>{title}</div>
      <div className={styles.badgeDesc}>{desc}</div>
    </div>
  </div>
);

export default HeroBanner;