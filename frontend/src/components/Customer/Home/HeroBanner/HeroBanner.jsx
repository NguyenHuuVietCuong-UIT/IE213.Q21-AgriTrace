import React, { useState, useEffect } from 'react';
import { LuSearch, LuShieldCheck, LuScroll, LuSprout, LuScanQrCode, LuX, LuExternalLink, LuBox, LuClipboardList } from "react-icons/lu";
import { Html5QrcodeScanner } from 'html5-qrcode';
import styles from './HeroBanner.module.css';

const HeroBanner = () => {
  const [productId, setProductId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // State quản lý việc hiển thị modal quét QR
  const [showScanner, setShowScanner] = useState(false);

  const handleLookup = async (idToSearch) => {
    // Xử lý logic để nhận id từ string (khi quét QR) hoặc từ state productId (khi click nút)
    const targetId = typeof idToSearch === 'string' ? idToSearch : productId;

    if (!targetId || !targetId.trim()) {
      alert("Vui lòng nhập mã lô hàng để tra cứu!");
      return;
    }

    setIsLoading(true);
    setResultData(null); // Reset dữ liệu cũ trước khi tra cứu mới

    try {
      const response = await fetch(`http://localhost:5000/api/public/batches/${targetId.trim()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không tìm thấy thông tin lô hàng!');
      }

      const data = await response.json();
      console.log("Dữ liệu nhận từ API:", data);

      // Lưu dữ liệu và mở Modal kết quả
      setResultData(data);
      setShowModal(true);

    } catch (error) {
      console.error("Lỗi tra cứu:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Khởi tạo và dọn dẹp Scanner khi mở/đóng modal quét QR
  useEffect(() => {
    let scanner = null;

    if (showScanner) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [0, 1] // 0: Camera, 1: File
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Khi quét hoặc tải ảnh thành công
          setProductId(decodedText);
          setShowScanner(false); // Đóng modal quét QR
          scanner.clear();       // Tắt camera/dọn dẹp scanner
          handleLookup(decodedText); // Tự động gọi API tra cứu bằng mã vừa quét
        },
        (errorMessage) => {
          // Bỏ qua các lỗi frame trong quá trình camera đang tìm kiếm QR
        }
      );
    }

    // Cleanup function để tắt camera khi component unmount hoặc đóng modal
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Lỗi khi đóng scanner: ", error));
      }
    };
  }, [showScanner]);

  return (
    <section className={styles.heroContainer}>
      <div className={styles.contentLeft}>
        <h1 className={styles.heading}>Truy xuất nguồn gốc <br /> Nông sản minh bạch</h1>
        <p className={styles.description}>Quét mã QR để xem toàn bộ hành trình từ nông trại đến bàn ăn</p>
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
              placeholder="Nhập mã lô hàng (Ví dụ: 3)"
              className={styles.productInput}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>
          <button onClick={handleLookup} className={styles.lookupBtn} disabled={isLoading}>
            <LuSearch /> {isLoading ? "Đang tra cứu..." : "Tra cứu ngay"}
          </button>
          <div className={styles.divider}><span>hoặc</span></div>
          <button onClick={() => setShowScanner(true)} className={styles.qrBtn}>
            <LuScanQrCode /> Quét / Tải mã QR lên
          </button>
        </div>
      </div>

      {/* MODAL QUÉT QR */}
      {showScanner && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
            <div className={styles.modalHeader}>
              <h3><LuScanQrCode /> Quét mã QR</h3>
              <button className={styles.closeBtn} onClick={() => setShowScanner(false)}>
                <LuX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Vùng hiển thị Camera hoặc Upload File của thư viện */}
              <div id="qr-reader" style={{ width: "100%" }}></div>
              <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Đưa mã QR lô hàng vào khung hình hoặc chọn tải ảnh từ thiết bị của bạn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KẾT QUẢ */}
      {showModal && resultData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3><LuClipboardList /> Thông tin chi tiết lô hàng</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <LuX size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}><LuBox /> Dữ liệu nông sản (IPFS)</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span>Sản phẩm:</span>
                    <strong>{resultData.productData?.product?.productName || 'Không xác định'}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Ngày thu hoạch:</span>
                    <strong>{resultData.productData?.harvestDate ? new Date(resultData.productData.harvestDate).toLocaleDateString('vi-VN') : 'N/A'}</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Số lượng:</span>
                    <strong>{resultData.productData?.quantity || 0} kg</strong>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Trạng thái:</span>
                    <strong className={styles.statusBadge}>{resultData.productData?.status || 'MINTED'}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.infoSection}>
                <h4 className={styles.sectionTitle}><LuShieldCheck /> Bằng chứng Blockchain</h4>
                <div className={styles.blockchainCard}>
                  <p><strong>NFT Token ID:</strong> #{resultData.metaData?.tokenId || 'N/A'}</p>
                  <p className={styles.addressText}><strong>Địa chỉ hợp đồng:</strong> {resultData.metaData?.contractAddress}</p>
                  <p className={styles.addressText}><strong>Mã Hash IPFS:</strong> {resultData.metaData?.ipfsHash}</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${resultData.metaData?.mintTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.etherscanLink}
                  >
                    Kiểm tra trên Etherscan <LuExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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