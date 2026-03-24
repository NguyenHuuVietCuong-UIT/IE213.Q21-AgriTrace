import React, { useState, useEffect } from 'react';
import { LuBox, LuTrendingUp, LuPackageCheck, LuAward, LuPlus } from "react-icons/lu";
import BatchCard from '../../../components/Farmer/BatchCard/BatchCard';
import styles from './FarmerDashboard.module.css';

const API_URL = 'http://localhost:5000/api/batches';

const FarmerDashboard = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal thêm lô hàng
  const [showModal, setShowModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    productId: '', // Lưu ý: Cần nhập ID của Product có thật trong DB
    harvestDate: '',
    quantity: ''
  });

  const fetchMyBatches = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Bạn chưa đăng nhập!");

      const response = await fetch(`${API_URL}/mine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error("Lỗi khi tải dữ liệu");
      }

      const data = await response.json();
      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBatches();
  }, []);

  // 1. TÍNH NĂNG THÊM LÔ HÀNG
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBatch)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Lỗi tạo lô hàng");
      }

      alert("Tạo lô hàng mới thành công!");
      setShowModal(false); // Đóng modal
      setNewBatch({ productId: '', harvestDate: '', quantity: '' }); // Reset form
      fetchMyBatches(); // Load lại danh sách
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. TÍNH NĂNG GỬI YÊU CẦU KIỂM ĐỊNH (KHÓA LÔ HÀNG)
  const handleComplete = async (id) => {
    if (window.confirm("Xác nhận hoàn tất canh tác và gửi yêu cầu kiểm định? (Bạn sẽ không thể thêm nhật ký nữa)")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}/lock`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Lỗi khi gửi yêu cầu");

        alert("Đã gửi yêu cầu kiểm định thành công!");
        fetchMyBatches(); // Load lại data
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // TÍNH NĂNG THÊM NHẬT KÝ
  const handleAddActivity = async (id) => {
    const action = prompt("Nhập hoạt động canh tác (VD: Bón phân, Tưới nước):");
    const location = prompt("Nhập địa điểm thực hiện (VD: Khu A, Nhà kính 1):");

    if (action && location) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/${id}/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action, location })
        });

        if (!response.ok) throw new Error("Lỗi khi thêm nhật ký");
        fetchMyBatches();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalBatches = batches.length;
  const farmingCount = batches.filter(b => b.status === 'PENDING').length;
  const pendingCount = batches.filter(b => b.status === 'LOCKED').length;
  const mintedCount = batches.filter(b => b.status === 'MINTED').length;

  if (loading) return <div>Đang tải dữ liệu trang trại...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1>Tổng quan trang trại</h1>
            <p>Quản lý các lô hàng và hoạt động canh tác</p>
          </div>
          {/* Nút Mở Modal Thêm Lô Hàng */}
          <button className={styles.addBatchBtn} onClick={() => setShowModal(true)}>
            <LuPlus /> Tạo lô hàng mới
          </button>
        </div>
      </header>

      {/* MODAL THÊM LÔ HÀNG */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Tạo Lô Hàng Mới</h2>
            <form onSubmit={handleCreateBatch}>
              <div className={styles.formGroup}>
                <label>ID Sản phẩm (Product Object ID)</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập ID sản phẩm từ DB..."
                  value={newBatch.productId}
                  onChange={e => setNewBatch({ ...newBatch, productId: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Ngày thu hoạch dự kiến</label>
                <input
                  type="date"
                  required
                  value={newBatch.harvestDate}
                  onChange={e => setNewBatch({ ...newBatch, harvestDate: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Sản lượng dự kiến (kg)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="VD: 500"
                  value={newBatch.quantity}
                  onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className={styles.submitBtn}>Tạo lô hàng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KHU VỰC THỐNG KÊ */}
      <div className={styles.statsGrid}>
        {/* ... (Giữ nguyên 4 thẻ thống kê của bạn ở đây) ... */}
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Tổng số lô</span><div className={styles.statNumber}>{totalBatches}</div></div>
          <div className={`${styles.statIcon} ${styles.iconTotal}`}><LuBox /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Đang canh tác</span><div className={styles.statNumber} style={{ color: '#10b981' }}>{farmingCount}</div></div>
          <div className={`${styles.statIcon} ${styles.iconFarming}`}><LuTrendingUp /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Chờ kiểm định</span><div className={styles.statNumber} style={{ color: '#f59e0b' }}>{pendingCount}</div></div>
          <div className={`${styles.statIcon} ${styles.iconPending}`}><LuPackageCheck /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Đã đúc NFT</span><div className={styles.statNumber} style={{ color: '#3b82f6' }}>{mintedCount}</div></div>
          <div className={`${styles.statIcon} ${styles.iconMinted}`}><LuAward /></div>
        </div>
      </div>

      {/* LƯỚI DANH SÁCH LÔ HÀNG */}
      <div className={styles.batchGrid}>
        {batches.map(batch => (
          <BatchCard
            key={batch._id}
            batch={batch}
            onComplete={() => handleComplete(batch._id)}
            onAddActivity={() => handleAddActivity(batch._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;