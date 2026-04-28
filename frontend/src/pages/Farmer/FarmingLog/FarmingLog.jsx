import React, { useState, useEffect } from 'react';
import styles from './FarmingLog.module.css';
import { LuLeaf, LuPackage, LuBug, LuDroplets, LuSearch, LuImage } from "react-icons/lu";

const API_BASE = import.meta.env.VITE_API_URL;
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const FarmingLog = () => {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ planting: 0, fertilizing: 0, pesticide: 0, watering: 0 });

  useEffect(() => {
    fetchLogsData();
  }, []);

  const fetchLogsData = async () => {
    try {
      setLoading(true);

      const batchRes = await fetch(`${API_BASE}/batches/mine`, { headers: getAuthHeader() });
      if (batchRes.ok) {
        const batches = await batchRes.json();

        let flattenedLogs = [];
        let tempStats = { planting: 0, fertilizing: 0, pesticide: 0, watering: 0 };

        batches.forEach(batch => {
          if (batch.logs && batch.logs.length > 0) {
            batch.logs.forEach(log => {
              // Gắn thông tin Batch mẹ vào Log con
              flattenedLogs.push({
                action: log.action || "Chưa xác định",
                timestamp: log.timestamp,
                location: log.location || "Không rõ địa điểm",
                imageUrl: log.imageUrl || null,

                // Lấy từ Batch mẹ:
                batchId: batch._id,
                productName: batch.productId?.name || "Lô sản phẩm",
                quantity: batch.quantity
              });

              // Thống kê dựa trên trường action thực tế
              const act = (log.action || "").toLowerCase();
              if (act.includes('gieo')) tempStats.planting++;
              if (act.includes('phân')) tempStats.fertilizing++;
              if (act.includes('thuốc')) tempStats.pesticide++;
              if (act.includes('tưới') || act.includes('nước')) tempStats.watering++;
            });
          }
        });

        // Sắp xếp theo trường timestamp (Mới nhất lên đầu)
        flattenedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setAllLogs(flattenedLogs);
        setStats(tempStats);
      }
    } catch (err) {
      console.error("Lỗi tải nhật ký:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm render Icon tùy theo action
  const getActionConfig = (actionStr) => {
    const action = actionStr.toLowerCase();
    if (action.includes('gieo')) return { icon: <LuLeaf />, colorClass: styles.bgGreen, textClass: styles.textGreen };
    if (action.includes('phân')) return { icon: <LuPackage />, colorClass: styles.bgYellow, textClass: styles.textYellow };
    if (action.includes('thuốc')) return { icon: <LuBug />, colorClass: styles.bgPurple, textClass: styles.textPurple };
    if (action.includes('tưới') || action.includes('nước')) return { icon: <LuDroplets />, colorClass: styles.bgBlue, textClass: styles.textBlue };

    return { icon: <LuLeaf />, colorClass: styles.bgGray, textClass: styles.textGray }; // Mặc định
  };

  // BỘ LỌC
  const filteredLogs = allLogs.filter(log => {
    const safeAction = log.action || "";
    const safeLocation = log.location || "";
    const safeProductName = log.productName || "";
    const safeSearch = searchTerm || "";

    return safeAction.toLowerCase().includes(safeSearch.toLowerCase()) ||
      safeLocation.toLowerCase().includes(safeSearch.toLowerCase()) ||
      safeProductName.toLowerCase().includes(safeSearch.toLowerCase());
  });

  if (loading) return <div style={{ padding: '2rem' }}>Đang tải nhật ký...</div>;

  return (
    <div className={styles.logContainer}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Nhật ký canh tác</h1>
        <p className={styles.pageSubtitle}>Theo dõi tất cả hoạt động canh tác</p>
      </div>

      {/* 4 THẺ THỐNG KÊ */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Gieo trồng</p>
            <h3 className={styles.statValue}>{stats.planting}</h3>
          </div>
          <div className={`${styles.statIcon} ${styles.bgGreen} ${styles.textGreen}`}><LuLeaf /></div>
        </div>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Bón phân</p>
            <h3 className={styles.statValue}>{stats.fertilizing}</h3>
          </div>
          <div className={`${styles.statIcon} ${styles.bgYellow} ${styles.textYellow}`}><LuPackage /></div>
        </div>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Phun thuốc</p>
            <h3 className={styles.statValue}>{stats.pesticide}</h3>
          </div>
          <div className={`${styles.statIcon} ${styles.bgPurple} ${styles.textPurple}`}><LuBug /></div>
        </div>
        <div className={styles.statCard}>
          <div>
            <p className={styles.statLabel}>Khác</p>
            <h3 className={styles.statValue}>{stats.watering}</h3>
          </div>
          <div className={`${styles.statIcon} ${styles.bgBlue} ${styles.textBlue}`}><LuDroplets /></div>
        </div>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className={styles.filterSection}>
        <div className={styles.searchBox}>
          <LuSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm kiếm hành động, địa điểm, tên sản phẩm..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* DANH SÁCH NHẬT KÝ */}
      <div className={styles.logList}>
        {filteredLogs.map((log, index) => {
          const config = getActionConfig(log.action);

          return (
            <div key={index} className={styles.logItem}>
              {/* Icon */}
              <div className={`${styles.itemIcon} ${config.colorClass} ${config.textClass}`}>
                {config.icon}
              </div>

              {/* Nội dung */}
              <div className={styles.itemContent}>
                <div className={styles.itemTags}>
                  <span className={`${styles.tagAction} ${config.colorClass} ${config.textClass}`}>
                    {log.action}
                  </span>
                  <span className={styles.tagBatch}>{log.productName}</span>
                </div>

                {/* Vì không có details, ta dùng location làm thông tin chính */}
                <h4 className={styles.itemDetails}>
                  Địa điểm: {log.location}
                </h4>

                <p className={styles.itemMeta}>
                  Mã Lô: ...{log.batchId.toString().slice(-6)} • Số lượng: {log.quantity}
                </p>

                {/* Hiển thị link ảnh nếu có */}
                {log.imageUrl && (
                  <a href={log.imageUrl} target="_blank" rel="noopener noreferrer" className={styles.imageLink}>
                    <LuImage /> Xem ảnh đính kèm
                  </a>
                )}
              </div>

              {/* Ngày tháng (Dùng trường timestamp) */}
              <div className={styles.itemDate}>
                {new Date(log.timestamp).toLocaleDateString('vi-VN')}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className={styles.emptyState}>Không tìm thấy nhật ký nào khớp với tìm kiếm.</div>
        )}
      </div>
    </div>
  );
};

export default FarmingLog;