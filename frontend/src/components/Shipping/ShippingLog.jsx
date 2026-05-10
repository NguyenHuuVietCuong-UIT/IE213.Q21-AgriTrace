import React, { useState } from 'react';
import { LuMapPin, LuClock, LuUser, LuShieldCheck, LuLoader } from 'react-icons/lu';
import { useWeb3 } from '../../hooks/useWeb3'; // Import hook Web3
import styles from './ShippingLog.module.css';

/**
 * Component: ShippingLog
 * Hiển thị lịch sử vận chuyển (Off-chain) kèm tính năng xác minh (On-chain)
 */
const ShippingLog = ({ logs = [], tokenId }) => {
  const { verifyOnChainHistory } = useWeb3();
  const [isVerifying, setIsVerifying] = useState(false);
  const [onChainData, setOnChainData] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  if (!logs || logs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <LuMapPin size={32} />
        <p>Chưa có cập nhật vận chuyển</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Hàm xử lý khi bấm nút "Xác minh Blockchain"
  const handleVerify = async () => {
    if (!tokenId) {
      setVerifyError("Lô hàng này chưa được đúc NFT (Không có Token ID)");
      return;
    }

    setIsVerifying(true);
    setVerifyError('');
    try {
      const chainRecords = await verifyOnChainHistory(tokenId);
      setOnChainData(chainRecords);
    } catch (error) {
      setVerifyError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 className={styles.title} style={{ margin: 0 }}>📍 Lịch sử vận chuyển</h3>

        {/* Nút Xác minh Blockchain */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || onChainData}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '8px',
            backgroundColor: onChainData ? '#ecfdf5' : '#f0f9ff',
            color: onChainData ? '#059669' : '#0284c7',
            border: onChainData ? '1px solid #10b981' : '1px solid #38bdf8',
            cursor: (isVerifying || onChainData) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isVerifying ? <LuLoader className="spinner" /> : <LuShieldCheck size={18} />}
          {onChainData ? 'Đã xác minh On-chain' : 'Xác minh Blockchain'}
        </button>
      </div>

      {verifyError && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{verifyError}</div>}

      <div className={styles.timeline}>
        {logs.map((log, index) => {
          // Đối chiếu log off-chain với on-chain (giả định thứ tự log tương ứng với thứ tự event emit)
          const chainRecord = onChainData && onChainData[index] ? onChainData[index] : null;

          return (
            <div key={index} className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <div className={styles.dot} style={{ backgroundColor: chainRecord ? '#10b981' : undefined }}></div>
                {index !== logs.length - 1 && <div className={styles.line}></div>}
              </div>

              <div className={styles.content}>
                <div className={styles.header}>
                  <h4 className={styles.action}>
                    {log.action}
                    {/* Báo hiệu đã Verify thành công cho dòng này */}
                    {chainRecord && (
                      <span style={{ marginLeft: '10px', color: '#10b981', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <LuShieldCheck /> Đã xác thực
                      </span>
                    )}
                  </h4>
                  <span className={styles.time}>
                    <LuClock size={14} />
                    {formatDate(log.timestamp)}
                  </span>
                </div>

                <div className={styles.location}>
                  <LuMapPin size={16} />
                  {log.location}
                </div>

                {log.actorId && log.actorId !== 'null' ? (
                  <div className={styles.actor}>
                    <LuUser size={14} />
                    Cập nhật bởi: {log.actorId?.name || 'Người dùng'}
                  </div>
                ) : (
                  <div className={styles.actor + ' ' + styles.system}>
                    <LuUser size={14} /> Hệ thống tự động
                  </div>
                )}

                {/* Hiển thị thông tin Blockchain nếu đã xác minh */}
                {chainRecord && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>
                      <strong>IPFS Hash:</strong> {chainRecord.ipfsHash}
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <strong>Tx Hash:</strong> <a href={`https://sepolia.etherscan.io/tx/${chainRecord.txHash}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>{chainRecord.txHash}</a>
                    </div>
                  </div>
                )}

                {log.imageUrl && (
                  <img src={log.imageUrl} alt="Shipping proof" className={styles.image} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShippingLog;