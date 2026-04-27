import React from 'react';
import styles from './BatchCard.module.css';

const BatchCard = ({ batch, onMint, isMinting, isDisabled }) => {
    // Truy xuất dữ liệu an toàn từ Object ID hoặc Populate
    const productName = batch.productId?.productName || "Chưa rõ sản phẩm";

    // Tuỳ thuộc vào cách backend populate, lấy tên nông dân (từ model User)
    const farmerName = batch.farmerId?.name || "Chưa có thông tin nông dân";

    // Lấy thông tin nông trại
    const farmName = batch.farm?.farmName || "Chưa có thông tin nông trại";
    const address = batch.farm?.location || "Chưa rõ địa chỉ";

    // Nhật ký (logs)
    const logs = batch.logs || [];

    // Tạo link tìm kiếm địa chỉ trên Google Maps
    const mapQuery = encodeURIComponent(address);
    const googleMapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{productName}</h3>
                <span className={`${styles.statusBadge} ${styles[batch.status?.toLowerCase()] || ''}`}>
                    {batch.status === 'LOCKED' ? 'Chờ duyệt' : batch.status}
                </span>
            </div>

            {/* Chi tiết Nông trại & Nông dân */}
            <div className={styles.detailSection}>
                <p><strong>Nông dân:</strong> {farmerName}</p>
                <p><strong>Nông trại:</strong> {farmName}</p>
                <p className={styles.addressLine}>
                    <strong>Địa chỉ:</strong> {address}
                    {address !== "Chưa rõ địa chỉ" && (
                        <a
                            href={googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mapLink}
                            title="Xem trên Google Maps"
                        >
                            (Bản đồ)
                        </a>
                    )}
                </p>
            </div>

            {/* Thông số lô hàng */}
            <div className={styles.gridInfo}>
                <div><small>Trọng lượng</small><p>{batch.quantity} kg</p></div>
                <div><small>Mã lô</small><p>{batch._id?.slice(-6).toUpperCase()}</p></div>
            </div>

            {/* Nhật ký hoạt động */}
            {logs.length > 0 && (
                <div className={styles.logsSection}>
                    <p className={styles.logsTitle}>Nhật ký hoạt động:</p>
                    <ul className={styles.logList}>
                        {logs.slice(0, 3).map((log, index) => ( // Hiển thị 3 log gần nhất để card không quá dài
                            <li key={index} className={styles.logItem}>
                                <span className={styles.logAction}>{log.action}</span>
                                <span className={styles.logDate}>
                                    {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                                </span>
                            </li>
                        ))}
                        {logs.length > 3 && <li className={styles.logMore}>... và {logs.length - 3} hoạt động khác</li>}
                    </ul>
                </div>
            )}

            <button
                className={styles.mintBtn}
                onClick={() => onMint(batch._id)}
                disabled={isMinting || isDisabled}
            >
                {isMinting ? 'Đang xử lý...' : 'Phê duyệt & Đúc NFT'}
            </button>
        </div>
    );
};

export default BatchCard;