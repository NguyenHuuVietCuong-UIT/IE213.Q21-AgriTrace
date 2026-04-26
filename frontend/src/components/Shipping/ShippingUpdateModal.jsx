import React, { useState } from 'react';
import { LuMapPin, LuTruck, LuX, LuLoader } from 'react-icons/lu';
import styles from './ShippingUpdateModal.module.css';

/**
 * Component: ShippingUpdateModal
 * Modal để cập nhật vận chuyển cho lô hàng MINTED
 */
const ShippingUpdateModal = ({ isOpen, onClose, onSubmit, batchId, isLoading = false }) => {
  const [formData, setFormData] = useState({
    location: '',
    status: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const shippingStatuses = [
    { value: 'Bắt đầu vận chuyển', label: '🚚 Bắt đầu vận chuyển' },
    { value: 'Đang vận chuyển', label: '🛣️ Đang vận chuyển' },
    { value: 'Tại cảng/Trạm dừng', label: '🏪 Tại cảng/Trạm dừng' },
    { value: 'Đang nhập kho', label: '📦 Đang nhập kho' },
    { value: 'Đã nhập kho', label: '✅ Đã nhập kho' },
    { value: 'Giao cho khách hàng', label: '🎉 Giao cho khách hàng' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.location.trim()) {
      setError('Vui lòng nhập địa điểm vận chuyển');
      return false;
    }
    if (!formData.status.trim()) {
      setError('Vui lòng chọn trạng thái vận chuyển');
      return false;
    }
    if (formData.location.trim().length < 3) {
      setError('Địa điểm vận chuyển phải có ít nhất 3 ký tự');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        location: formData.location.trim(),
        status: formData.status.trim(),
        batchId
      });

      setSuccess('Cập nhật vận chuyển thành công!');
      setFormData({ location: '', status: '' });

      // Đóng modal sau 2 giây
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Lỗi cập nhật vận chuyển');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <LuTruck className={styles.icon} />
            <h2>Cập nhật vận chuyển</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} disabled={isLoading}>
            <LuX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          {/* Batch ID Info */}
          <div className={styles.batchInfo}>
            <span className={styles.label}>Lô hàng:</span>
            <span className={styles.batchId}>{batchId?.slice(-6).toUpperCase()}</span>
          </div>

          {/* Location Field */}
          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              <LuMapPin size={16} />
              Địa điểm hiện tại <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="VD: Kho lạnh Co.opMart Quận 1, TP.HCM"
              value={formData.location}
              onChange={handleChange}
              disabled={isLoading}
              className={styles.input}
              maxLength={200}
            />
            <small className={styles.hint}>
              {formData.location.length}/200 ký tự
            </small>
          </div>

          {/* Status Field */}
          <div className={styles.formGroup}>
            <label htmlFor="status" className={styles.label}>
              <LuTruck size={16} />
              Trạng thái vận chuyển <span className={styles.required}>*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
              className={styles.select}
            >
              <option value="">-- Chọn trạng thái --</option>
              {shippingStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LuLoader className={styles.spinner} size={16} />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật vận chuyển'
              )}
            </button>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p>
              💡 <strong>Mẹo:</strong> Cập nhật vận chuyển sẽ được ghi lại trên blockchain.
              Hệ thống sẽ tự động ký giao dịch (không tốn phí gas).
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingUpdateModal;
