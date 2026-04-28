import React, { useState, useEffect, useRef } from 'react';
import { LuBox, LuTrendingUp, LuPackageCheck, LuAward, LuPlus, LuMapPin } from "react-icons/lu";
import { Link } from 'react-router-dom';
import BatchCard from '../../../components/Farmer/BatchCard/BatchCard';
import styles from './FarmerDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_URL;

const FarmerDashboard = () => {
  const searchRef = useRef(null);
  const [batches, setBatches] = useState([]);
  const [myFarm, setMyFarm] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- QUẢN LÝ MODAL ---
  const [modalState, setModalState] = useState({ type: null, isOpen: false, batchId: null, message: '' });

  // States cho Form
  const [newFarm, setNewFarm] = useState({ name: '', location: '', description: '' });
  const [newBatch, setNewBatch] = useState({ productId: '', productName: '', harvestDate: '', quantity: '' });
  const [newProduct, setNewProduct] = useState({ name: '', description: '' });
  const [inspectorData, setInspectorData] = useState({ inspectorId: '', inspectorName: '' });
  const [newLog, setNewLog] = useState({ action: '', location: '' });

  // States Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const closeModal = () => {
    setModalState({ type: null, isOpen: false, batchId: null, message: '' });
    setSearchQuery('');
    setSearchResults([]);
  };

  const showMessage = (msg) => setModalState({ type: 'MESSAGE', isOpen: true, message: msg });

  // --- TẢI DỮ LIỆU BAN ĐẦU ---
  const fetchData = async () => {
    try {
      const farmRes = await fetch(`${API_BASE}/resources/farms/mine`, { headers: getAuthHeader() });
      if (farmRes.ok) {
        const farmJson = await farmRes.json();
        setMyFarm(farmJson.data);
      }

      const batchRes = await fetch(`${API_BASE}/batches/mine`, { headers: getAuthHeader() });
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        setBatches(batchData);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- LOGIC TÌM KIẾM MỚI (TỐI ƯU UX) ---
  const handleSearch = (type) => (e) => {
    const q = (e?.target?.value || '').trim().toLowerCase();
    setSearchQuery(q);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const endpoint = type === 'product' ? 'products/search' : 'inspectors/search';

        const res = await fetch(
          `${API_BASE}/resources/${endpoint}?q=${encodeURIComponent(q)}`,
          { headers: getAuthHeader() }
        );

        const json = await res.json();

        if (json.success) {
          const filtered = json.data.filter(item =>
            (item.productName || item.name)
              .toLowerCase()
              .includes(q)
          );

          setSearchResults(filtered);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };
  // --- CÁC HÀM SUBMIT ---
  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/resources/farms`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newFarm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMessage("Tạo nông trại thành công!");
      fetchData();
    } catch (err) { showMessage(err.message); }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/resources/products`, {
        method: 'POST',
        headers: getAuthHeader(),
        // Chú ý gửi đúng định dạng field
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          farmId: myFarm._id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tạo sản phẩm");

      // Tự động gán sản phẩm vừa tạo vào form Lô hàng
      setNewBatch({ ...newBatch, productId: data.data._id, productName: data.data.productName });
      setNewProduct({ name: '', description: '' }); // Reset form
      setSearchQuery('');
      setSearchResults([]);
      setModalState({ type: 'CREATE_BATCH', isOpen: true });
    } catch (err) { showMessage(err.message); }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.productId) return showMessage("Vui lòng chọn sản phẩm!");
    try {
      const res = await fetch(`${API_BASE}/batches`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newBatch)
      });
      if (!res.ok) throw new Error("Lỗi tạo lô hàng");
      showMessage("Tạo lô hàng thành công!");
      fetchData();
    } catch (err) { showMessage(err.message); }
  };

  const handleLockBatch = async (e) => {
    e.preventDefault();
    if (!inspectorData.inspectorId) return showMessage("Vui lòng chọn người kiểm định!");
    try {
      const res = await fetch(`${API_BASE}/batches/${modalState.batchId}/lock`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ inspectorId: inspectorData.inspectorId })
      });
      if (!res.ok) throw new Error("Lỗi gửi yêu cầu");
      showMessage("Gửi yêu cầu kiểm định thành công!");
      fetchData();
    } catch (err) { showMessage(err.message); }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/batches/${modalState.batchId}/logs`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newLog)
      });
      if (!res.ok) throw new Error("Lỗi thêm nhật ký");
      showMessage("Thêm nhật ký thành công!");
      fetchData();
    } catch (err) { showMessage(err.message); }
  };

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu trang trại...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              <h1>Tổng quan trang trại</h1>
            </Link>
            {myFarm ? (
              <p className={styles.farmInfo}>
                <LuMapPin size={16} /> {myFarm.farmName} — <span>{myFarm.location}</span>
              </p>
            ) : (
              <p className={styles.noFarm}>Bạn chưa khởi tạo thông tin nông trại.</p>
            )}
          </div>
          <div className={styles.headerActions}>
            {!myFarm && (
              <button className={styles.addFarmBtn} onClick={() => setModalState({ type: 'CREATE_FARM', isOpen: true })}>
                <LuPlus /> Thiết lập Nông trại
              </button>
            )}
            <button
              className={styles.addBatchBtn}
              onClick={() => {
                if (!myFarm) return showMessage("Hãy thiết lập Nông trại trước!");
                setNewBatch({ productId: '', productName: '', harvestDate: '', quantity: '' }); // Clear data cũ
                setModalState({ type: 'CREATE_BATCH', isOpen: true });
              }}
            >
              <LuPlus /> Tạo lô hàng mới
            </button>
          </div>
        </div>
      </header>

      {/* --- CÁC MODAL --- */}
      {modalState.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>

            {/* Modal Thông báo */}
            {modalState.type === 'MESSAGE' && (
              <>
                <h2>Thông báo</h2>
                <p className={styles.modalMsg}>{modalState.message}</p>
                <div className={styles.modalActions}>
                  <button className={styles.submitBtn} onClick={closeModal}>Đóng</button>
                </div>
              </>
            )}

            {/* Modal Thiết lập Nông trại */}
            {modalState.type === 'CREATE_FARM' && (
              <>
                <h2>Thiết lập Nông trại</h2>
                <form onSubmit={handleCreateFarm}>
                  <div className={styles.formGroup}>
                    <label>Tên Nông trại</label>
                    <input type="text" required value={newFarm.name} onChange={e => setNewFarm({ ...newFarm, name: e.target.value })} placeholder="VD: Nông trại xanh" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Địa chỉ</label>
                    <input type="text" required value={newFarm.location} onChange={e => setNewFarm({ ...newFarm, location: e.target.value })} placeholder="VD: Đà Lạt, Lâm Đồng" />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Hủy</button>
                    <button type="submit" className={styles.submitBtn}>Lưu thông tin</button>
                  </div>
                </form>
              </>
            )}

            {/* Modal Tạo Lô Hàng */}
            {modalState.type === 'CREATE_BATCH' && (
              <>
                <h2>Tạo Lô Hàng Mới</h2>
                <form onSubmit={handleCreateBatch}>
                  <div className={styles.formGroup}>
                    <label>Sản phẩm (Nhấn để chọn)</label>

                    {/* KHU VỰC CHỌN SẢN PHẨM THÔNG MINH */}
                    {!newBatch.productId ? (
                      <div className={styles.searchWrapper} ref={searchRef}>
                        <input
                          type="text"
                          placeholder="Nhấn vào đây để xem danh sách hoặc gõ tìm..."
                          value={searchQuery}
                          onChange={handleSearch('product')}
                          onFocus={() => handleSearch('product')({ target: { value: searchQuery } })}
                        />
                        {searchQuery && (
                          <div className={styles.searchDropdown}>
                            {searchResults.length > 0 ? (
                              searchResults.map(p => (
                                <div
                                  key={p._id}
                                  className={styles.searchItem}
                                  onClick={() => {
                                    setNewBatch({
                                      ...newBatch,
                                      productId: p._id,
                                      productName: p.productName
                                    });
                                    setSearchQuery('');
                                    setSearchResults([]);
                                  }}
                                >
                                  {p.productName}
                                </div>
                              ))
                            ) : (
                              <div className={styles.noResult}>
                                Không tìm thấy sản phẩm
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}>
                        <strong style={{ color: '#047857' }}>{newBatch.productName}</strong>
                        <button type="button" onClick={() => setNewBatch({ ...newBatch, productId: '', productName: '' })} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>Đổi sản phẩm</button>
                      </div>
                    )}

                    {/* NÚT TẠO SẢN PHẨM MỚI */}
                    <button type="button" className={styles.inlineAction} style={{ marginTop: '10px' }} onClick={() => {
                      setSearchQuery(''); setSearchResults([]); // Dọn dẹp tìm kiếm
                      setModalState({ type: 'CREATE_PRODUCT', isOpen: true });
                    }}>
                      + Hoặc tạo sản phẩm mới
                    </button>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Ngày thu hoạch dự kiến</label>
                    <input type="date" required value={newBatch.harvestDate} onChange={e => setNewBatch({ ...newBatch, harvestDate: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Sản lượng dự kiến (kg)</label>
                    <input type="number" required min="1" value={newBatch.quantity} onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })} />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Hủy</button>
                    <button type="submit" className={styles.submitBtn} disabled={!newBatch.productId}>Tạo lô hàng</button>
                  </div>
                </form>
              </>
            )}

            {/* Modal Tạo Sản Phẩm Mới */}
            {modalState.type === 'CREATE_PRODUCT' && (
              <>
                <h2>Thêm Sản Phẩm Mới</h2>
                <form onSubmit={handleCreateProduct}>
                  <div className={styles.formGroup}>
                    <label>Tên Sản phẩm</label>
                    <input type="text" required value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="VD: Cà chua Cherry" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mô tả ngắn</label>
                    <input type="text" required value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Đặc tính, loại hạt giống..." />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setModalState({ type: 'CREATE_BATCH', isOpen: true })}>Quay lại</button>
                    <button type="submit" className={styles.submitBtn}>Lưu Sản phẩm</button>
                  </div>
                </form>
              </>
            )}

            {/* Modal Khóa/Gửi yêu cầu */}
            {modalState.type === 'LOCK_BATCH' && (
              <>
                <h2>Yêu cầu kiểm định</h2>
                <form onSubmit={handleLockBatch}>
                  <div className={styles.formGroup}>
                    <label>Người kiểm định (Nhấn để chọn)</label>

                    {/* KHU VỰC CHỌN INSPECTOR THÔNG MINH */}
                    {!inspectorData.inspectorId ? (
                      <div className={styles.searchWrapper} ref={searchRef}>
                        <input
                          type="text"
                          placeholder="Nhấn vào đây để xem danh sách hoặc gõ tìm..."
                          value={searchQuery}
                          onChange={handleSearch('inspector')}
                          onFocus={handleSearch('inspector')}
                        />
                        {searchQuery && (
                          <div className={styles.searchDropdown}>
                            {searchResults.length > 0 ? (
                              searchResults.map(i => (
                                <div key={i._id} className={styles.searchItem} onClick={() => {
                                  setInspectorData({ inspectorId: i._id, inspectorName: i.name });
                                  setSearchQuery('');
                                  setSearchResults([]);
                                }}>
                                  <strong>{i.name}</strong>
                                  <small style={{ color: '#6b7280' }}>
                                    ({i.walletAddress?.slice(0, 8)}...)
                                  </small>
                                </div>
                              ))
                            ) : (
                              <div className={styles.noResult}>
                                Không tìm thấy kiểm định viên
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '6px' }}>
                        <strong style={{ color: '#047857' }}>{inspectorData.inspectorName}</strong>
                        <button type="button" onClick={() => setInspectorData({ inspectorId: '', inspectorName: '' })} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}>Đổi người</button>
                      </div>
                    )}
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Hủy</button>
                    <button type="submit" className={styles.submitBtn} disabled={!inspectorData.inspectorId}>Gửi yêu cầu</button>
                  </div>
                </form>
              </>
            )}

            {/* Modal Thêm Nhật Ký */}
            {modalState.type === 'ADD_LOG' && (
              <>
                <h2>Thêm Nhật Ký Canh Tác</h2>
                <form onSubmit={handleAddLog}>
                  <div className={styles.formGroup}>
                    <label>Hoạt động</label>
                    <input type="text" required value={newLog.action} onChange={e => setNewLog({ ...newLog, action: e.target.value })} placeholder="VD: Bón phân hữu cơ" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Địa điểm</label>
                    <input type="text" required value={newLog.location} onChange={e => setNewLog({ ...newLog, location: e.target.value })} placeholder="VD: Nhà kính A1" />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeModal}>Hủy</button>
                    <button type="submit" className={styles.submitBtn}>Lưu nhật ký</button>
                  </div>
                </form>
              </>
            )}

          </div>
        </div>
      )}

      {/* THỐNG KÊ (GIỮ NGUYÊN) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Tổng số lô</span><div className={styles.statNumber}>{batches.length}</div></div>
          <div className={`${styles.statIcon} ${styles.iconTotal}`}><LuBox /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Đang canh tác</span><div className={styles.statNumber} style={{ color: '#10b981' }}>{batches.filter(b => b.status === 'PENDING').length}</div></div>
          <div className={`${styles.statIcon} ${styles.iconFarming}`}><LuTrendingUp /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Chờ kiểm định</span><div className={styles.statNumber} style={{ color: '#f59e0b' }}>{batches.filter(b => b.status === 'LOCKED').length}</div></div>
          <div className={`${styles.statIcon} ${styles.iconPending}`}><LuPackageCheck /></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}><span>Đã đúc NFT</span><div className={styles.statNumber} style={{ color: '#3b82f6' }}>{batches.filter(b => b.status === 'MINTED').length}</div></div>
          <div className={`${styles.statIcon} ${styles.iconMinted}`}><LuAward /></div>
        </div>
      </div>

      <div className={styles.batchGrid}>
        {batches.map(batch => (
          <BatchCard
            key={batch._id}
            batch={batch}
            onComplete={() => setModalState({ type: 'LOCK_BATCH', isOpen: true, batchId: batch._id })}
            onAddActivity={() => setModalState({ type: 'ADD_LOG', isOpen: true, batchId: batch._id })}
          />
        ))}
      </div>
    </div>
  );
};

export default FarmerDashboard;