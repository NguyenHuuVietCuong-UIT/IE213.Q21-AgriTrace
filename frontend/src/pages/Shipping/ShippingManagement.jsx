import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuTruck, LuMapPin, LuSearch } from 'react-icons/lu';
import { ShippingUpdateModal, ShippingLog } from '../../components/Shipping';
import shippingService from '../../services/shippingService';
import Navbar from '../../components/layouts/MainLayout/Navbar/Navbar';
import styles from './ShippingManagement.module.css';

/**
 * Page: ShippingManagement (Deliverer / Inspector)
 * Cho phép tìm kiếm lô hàng theo ID và cập nhật vị trí, trạng thái
 */
const ShippingManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBatch, setCurrentBatch] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Message states
  const [message, setMessage] = useState({ type: '', text: '', isOpen: false });

  // Kiểm tra đăng nhập ngay khi mở trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text, isOpen: true });
    setTimeout(() => setMessage({ type: '', text: '', isOpen: false }), 4000);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setCurrentBatch(null); // Reset kết quả cũ
    try {
      // Dùng hàm có sẵn trong storageService/shippingService bạn đã tạo
      const batch = await shippingService.getBatchDetails(searchQuery.trim());

      if (batch.status !== 'MINTED') {
        throw new Error('Lô hàng này chưa đúc NFT hoặc không khả dụng để vận chuyển.');
      }

      setCurrentBatch(batch);
      showMessage('success', 'Tìm thấy lô hàng thành công!');
    } catch (error) {
      showMessage('error', `Lỗi: ${error.message}`);
      // Nếu API báo lỗi auth (401, 403), văng ra login
      if (error.message.includes('đăng nhập') || error.message.includes('401')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShipping = async (formData) => {
    setIsUpdating(true);
    try {
      await shippingService.updateShipping(currentBatch._id, formData);
      showMessage('success', 'Cập nhật nhật ký vận chuyển thành công!');

      // Tự động tải lại chi tiết lô hàng để hiển thị log mới nhất
      const updatedBatch = await shippingService.getBatchDetails(currentBatch._id);
      setCurrentBatch(updatedBatch);

      setIsModalOpen(false);
    } catch (error) {
      showMessage('error', error.message);
      if (error.message.includes('đăng nhập')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getLastLog = (batch) => {
    if (!batch.logs || batch.logs.length === 0) return null;
    return batch.logs[batch.logs.length - 1];
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <LuTruck className={styles.titleIcon} />
            <h1>Vận chuyển lô hàng</h1>
            <p>Nhập ID lô hàng để cập nhật vị trí và trạng thái</p>
          </div>
        </div>

        {/* Thông báo Message */}
        {message.isOpen && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.type === 'success' ? '✅' : '⚠️'} {message.text}
          </div>
        )}

        {/* Khu vực Tìm kiếm */}
        <form onSubmit={handleSearch} className={styles.filterSection} style={{ display: 'flex', gap: '10px' }}>
          <div className={styles.searchBox} style={{ flex: 1 }}>
            <LuSearch size={18} />
            <input
              type="text"
              placeholder="Nhập mã lô hàng (Batch ID)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            type="submit"
            className={styles.updateBtn}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </form>

        {/* Hiển thị Kết quả lô hàng */}
        <div className={styles.batchesSection}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : currentBatch ? (
            <div className={styles.batchItem} style={{ marginTop: '20px' }}>
              <div className={styles.batchHeader}>
                <div className={styles.batchInfo}>
                  <h3 className={styles.batchTitle}>
                    📦 Lô: {currentBatch._id}
                  </h3>
                  <p className={styles.productName}>
                    Sản phẩm: {currentBatch.productId?.name || 'Không xác định'}
                  </p>
                  <div className={styles.batchMeta}>
                    <span className={styles.tokenId}>NFT ID: {currentBatch.tokenId || 'N/A'}</span>
                    <span className={styles.quantity}>Số lượng: {currentBatch.quantity} kg</span>
                  </div>
                </div>

                <button
                  className={styles.updateBtn}
                  onClick={() => setIsModalOpen(true)}
                  disabled={isUpdating}
                >
                  <LuMapPin size={16} />
                  Thêm nhật ký
                </button>
              </div>

              {/* Trạng thái hiện tại */}
              {(() => {
                const lastLog = getLastLog(currentBatch);
                return lastLog ? (
                  <div className={styles.lastUpdate}>
                    <div className={styles.lastUpdateContent}>
                      <strong className={styles.action}>{lastLog.action}</strong>
                      <div className={styles.location}>
                        <LuMapPin size={14} />
                        {lastLog.location}
                      </div>
                      <small className={styles.timestamp}>
                        {new Date(lastLog.timestamp).toLocaleString('vi-VN')}
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noUpdate}>
                    <p>Chưa có cập nhật vận chuyển</p>
                  </div>
                );
              })()}

              {/* Lịch sử Logs */}
              {currentBatch.logs && currentBatch.logs.length > 0 && (
                <div className={styles.logsPreview} style={{ marginTop: '15px' }}>
                  <h4>Lịch sử vận chuyển:</h4>
                  <ShippingLog logs={currentBatch.logs} />
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <LuTruck size={48} />
              <h3>Chưa chọn lô hàng</h3>
              <p>Vui lòng nhập ID lô hàng hợp lệ vào ô tìm kiếm ở trên.</p>
            </div>
          )}
        </div>

        {/* Modal Cập nhật (Tái sử dụng Component cũ) */}
        <ShippingUpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleUpdateShipping}
          batchId={currentBatch?._id}
          isLoading={isUpdating}
        />
      </div>
    </>
  );
};

export default ShippingManagement;