import React, { useState, useEffect } from 'react';
import { LuTruck, LuMapPin, LuRefreshCw, LuSearch, LuFilter } from 'react-icons/lu';
import { ShippingUpdateModal, ShippingLog } from '../../components/Shipping';
import styles from './ShippingManagement.module.css';

/**
 * Page: ShippingManagement
 * Quản lý vận chuyển cho các lô hàng MINTED
 * Cho phép cập nhật vị trí, trạng thái vận chuyển
 */
const ShippingManagement = () => {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('MINTED');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Message states
  const [message, setMessage] = useState({ type: '', text: '', isOpen: false });

  const API_BASE = 'http://localhost:5000/api';

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Fetch batches
  useEffect(() => {
    fetchBatches();
  }, []);

  // Filter batches
  useEffect(() => {
    let result = batches;

    if (selectedStatus) {
      result = result.filter(b => b.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b._id.toLowerCase().includes(query) ||
        b.productId?.name?.toLowerCase().includes(query) ||
        b.productId?.description?.toLowerCase().includes(query)
      );
    }

    setFilteredBatches(result);
  }, [batches, selectedStatus, searchQuery]);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      // Lấy tất cả batches của inspector
      const response = await fetch(`${API_BASE}/batches/inspector-all`, {
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Không thể tải dữ liệu');

      const data = await response.json();
      const allBatches = Array.isArray(data) ? data : (data.data || []);

      // Lọc chỉ MINTED batches (đã đúc NFT)
      const mintedBatches = allBatches.filter(b => b.status === 'MINTED');
      setBatches(mintedBatches);
    } catch (error) {
      showMessage('error', `Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text, isOpen: true });
    setTimeout(() => setMessage({ ...message, isOpen: false }), 4000);
  };

  const handleUpdateShipping = async (formData) => {
    setIsUpdating(true);
    try {
      const response = await fetch(
        `${API_BASE}/batches/${formData.batchId}/shipping`,
        {
          method: 'POST',
          headers: getAuthHeader(),
          body: JSON.stringify({
            location: formData.location,
            status: formData.status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi cập nhật vận chuyển');
      }

      showMessage('success', 'Cập nhật vận chuyển thành công!');
      
      // Refresh dữ liệu
      await fetchBatches();
      
      // Đóng modal
      setIsModalOpen(false);
      setSelectedBatchId(null);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenModal = (batchId) => {
    setSelectedBatchId(batchId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBatchId(null);
  };

  const getLastLog = (batch) => {
    if (!batch.logs || batch.logs.length === 0) return null;
    return batch.logs[batch.logs.length - 1];
  };

  const stats = {
    total: batches.length,
    updated: batches.filter(b => b.logs && b.logs.length > 0).length,
    pending: batches.filter(b => !b.logs || b.logs.length === 0).length
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <LuTruck className={styles.titleIcon} />
          <h1>Quản lý vận chuyển</h1>
          <p>Cập nhật vị trí và trạng thái vận chuyển cho lô hàng NFT</p>
        </div>

        <button 
          className={styles.refreshBtn}
          onClick={fetchBatches}
          disabled={loading}
          title="Làm mới dữ liệu"
        >
          <LuRefreshCw size={18} />
        </button>
      </div>

      {/* Message */}
      {message.isOpen && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Tổng lô hàng</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div>
            <div className={styles.statValue}>{stats.updated}</div>
            <div className={styles.statLabel}>Đã cập nhật</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔄</div>
          <div>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Chưa cập nhật</div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <LuSearch size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo lô hàng, sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${selectedStatus === 'MINTED' ? styles.active : ''}`}
            onClick={() => setSelectedStatus('MINTED')}
          >
            <LuFilter size={14} />
            Tất cả
          </button>
        </div>
      </div>

      {/* Batches List */}
      <div className={styles.batchesSection}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className={styles.emptyState}>
            <LuTruck size={48} />
            <h3>Không có lô hàng</h3>
            <p>
              {batches.length === 0
                ? 'Bạn chưa có lô hàng nào được phê duyệt'
                : 'Không tìm thấy lô hàng phù hợp'}
            </p>
          </div>
        ) : (
          <div className={styles.batchesList}>
            {filteredBatches.map(batch => {
              const lastLog = getLastLog(batch);
              return (
                <div key={batch._id} className={styles.batchItem}>
                  <div className={styles.batchHeader}>
                    <div className={styles.batchInfo}>
                      <h3 className={styles.batchTitle}>
                        📦 Lô: {batch._id?.slice(-6).toUpperCase()}
                      </h3>
                      <p className={styles.productName}>
                        {batch.productId?.name || 'Sản phẩm'}
                      </p>
                      <div className={styles.batchMeta}>
                        <span className={styles.tokenId}>
                          NFT ID: {batch.tokenId || 'N/A'}
                        </span>
                        <span className={styles.quantity}>
                          {batch.quantity} kg
                        </span>
                      </div>
                    </div>

                    <button
                      className={styles.updateBtn}
                      onClick={() => handleOpenModal(batch._id)}
                      disabled={isUpdating}
                    >
                      <LuMapPin size={16} />
                      Cập nhật vị trí
                    </button>
                  </div>

                  {/* Current Status */}
                  {lastLog && (
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
                  )}

                  {/* Logs History */}
                  {batch.logs && batch.logs.length > 0 && (
                    <div className={styles.logsPreview}>
                      <ShippingLog logs={batch.logs} />
                    </div>
                  )}

                  {!lastLog && (
                    <div className={styles.noUpdate}>
                      <p>Chưa có cập nhật vận chuyển</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shipping Update Modal */}
      <ShippingUpdateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleUpdateShipping}
        batchId={selectedBatchId}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default ShippingManagement;
