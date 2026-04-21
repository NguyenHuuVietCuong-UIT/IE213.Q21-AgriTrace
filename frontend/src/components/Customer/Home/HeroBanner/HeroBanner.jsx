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
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = async () => {
    if (!productId.trim()) {
      alert("Vui lòng nhập mã lô hàng để tra cứu!");
      return;
    }

    setIsLoading(true);
    try {
      // Backend khai báo route tra cứu GET /api/public/batches/:id
      const response = await fetch(`http://localhost:5000/api/public/batches/${productId.trim()}`);

      if (!response.ok) {
        throw new Error('Không tìm thấy thông tin lô hàng. Vui lòng kiểm tra lại mã!');
      }

      const data = await response.json();
      console.log("Dữ liệu truy xuất thành công từ Backend:", data);

      // data.product.productName, data.product.farmId.farmName
      alert(`Tra cứu thành công!\nSản phẩm: ${data.product?.productName || 'N/A'}\nNông trại: ${data.product?.farmId?.farmName || 'N/A'}\nTrạng thái: ${data.status}`);

    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrUpload = () => {
    console.log("Mở camera/bộ nhớ để tải ảnh QR");
  };

  return (
    <section className={styles.heroContainer}>

      <div className={styles.contentLeft}>
        <h1 className={styles.heading}>
          Truy xuất nguồn gốc <br /> Nông sản minh bạch
        </h1>
        <p className={styles.description}>
          Quét mã QR để xem toàn bộ hành trình từ nông trại đến bàn ăn
        </p>

        <div className={styles.badgeGroup}>
          <FeatureBadge icon={<LuShieldCheck />} title="Blockchain" desc="Bất biến" />
          <FeatureBadge icon={<LuScroll />} title="VietGAP" desc="Đạt chuẩn" />
          <FeatureBadge icon={<LuSprout />} title="Organic" desc="An toàn" />
        </div>
      </div>

      <div className={styles.formRight}>

        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Tra cứu sản phẩm</h3>

          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nhập mã lô hàng" 
              className={styles.productInput}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          <button onClick={handleLookup} className={styles.lookupBtn} disabled={isLoading}>
            <LuSearch /> {isLoading ? "Đang tra cứu..." : "Tra cứu ngay"}
          </button>

          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          <button onClick={handleQrUpload} className={styles.qrBtn}>
            <LuScanQrCode /> Tải lên mã QR
          </button>

          <p className={styles.counterText}>
            Hơn <span className={styles.counterHighlight}>10,000+</span> sản phẩm đã được xác thực
          </p>
        </div>
      </div>
    </section>
  );
};

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