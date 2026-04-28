/**
 * shippingService.js
 * Service để quản lý các API calls liên quan đến vận chuyển (Stream 5)
 */

const API_BASE = import.meta.env.VITE_API_URL;

export const shippingService = {
  /**
   * Cập nhật vận chuyển cho lô hàng
   * @param {string} batchId - ID của lô hàng
   * @param {Object} data - { location, status }
   * @returns {Promise}
   */
  updateShipping: async (batchId, data) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    if (!batchId) {
      throw new Error('Thiếu ID lô hàng');
    }

    if (!data.location || !data.status) {
      throw new Error('Thiếu thông tin vị trí hoặc trạng thái');
    }

    try {
      const response = await fetch(`${API_BASE}/batches/${batchId}/shipping`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: data.location,
          status: data.status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Lỗi cập nhật vận chuyển');
      }

      return result;
    } catch (error) {
      console.error('Shipping Service Error:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách lô hàng MINTED
   * @returns {Promise<Array>}
   */
  getMintedBatches: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      const response = await fetch(`${API_BASE}/batches/inspector-all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Lỗi tải dữ liệu');
      }

      // Lọc chỉ lấy lô hàng MINTED
      const batches = Array.isArray(result) ? result : (result.data || []);
      return batches.filter(b => b.status === 'MINTED');
    } catch (error) {
      console.error('Shipping Service Error:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết lô hàng (bao gồm logs)
   * @param {string} batchId - ID của lô hàng
   * @returns {Promise<Object>}
   */
  getBatchDetails: async (batchId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      const response = await fetch(`${API_BASE}/batches/${batchId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Không tìm thấy lô hàng');
      }

      return result;
    } catch (error) {
      console.error('Shipping Service Error:', error);
      throw error;
    }
  },

  /**
   * Tìm kiếm lô hàng
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Array>}
   */
  searchBatches: async (query) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Vui lòng đăng nhập');
    }

    try {
      const response = await fetch(`${API_BASE}/batches/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Lỗi tìm kiếm');
      }

      return result.data || [];
    } catch (error) {
      console.error('Shipping Service Error:', error);
      throw error;
    }
  }
};

export default shippingService;
