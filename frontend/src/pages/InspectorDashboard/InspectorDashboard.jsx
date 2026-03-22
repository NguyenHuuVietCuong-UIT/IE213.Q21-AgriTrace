import React, { useState, useEffect } from 'react'; // SỬA: Thêm useState, useEffect
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { BatchCard } from '../../components/BatchCard/BatchCard';
import { StatCard } from '../../components/StatCard/StatCard';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

// XÓA BỎ TOÀN BỘ MẢNG MOCK_BATCHES Ở ĐÂY

export const InspectorDashboard = () => {
    const { account, isConnecting, isMinting, connectWallet, handleMintNFT } = useWeb3();

    // THÊM: State lưu lô hàng và hàm gọi API
    const [batches, setBatches] = useState([]);

    const fetchPendingBatches = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/batches/pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) setBatches(await res.json());
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    useEffect(() => { fetchPendingBatches(); }, []);

    // THÊM: Hàm xử lý quy trình 3 bước (IPFS -> Mint -> Database)
    const processApproveAndMint = async (batchId) => {
        try {
            // 1. Gắn IPFS
            const pinRes = await fetch(`http://localhost:5000/api/batches/${batchId}/pin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const pinData = await pinRes.json();
            if (!pinData.success) throw new Error("Lỗi đẩy IPFS");

            // 2. Ký ví MetaMask (dùng hàm handleMintNFT từ hook)
            const mintResult = await handleMintNFT(`ipfs://${pinData.ipfsHash}`);
            if (!mintResult) return; // Người dùng từ chối ký

            // 3. Báo Backend cập nhật MINTED
            await fetch(`http://localhost:5000/api/batches/${batchId}/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tokenId: mintResult.tokenId, txHash: mintResult.txHash })
            });

            alert(`🎉 Đã đúc NFT thành công! Token ID: ${mintResult.tokenId}`);
            fetchPendingBatches(); // Làm mới giao diện
        } catch (err) {
            alert(`❌ Lỗi: ${err.message}`);
        }
    };

    return (
        <div className={styles.layout}>
            <Sidebar account={account} onConnect={connectWallet} isConnecting={isConnecting} />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>Quản lý kiểm định lô hàng</h1>
                    <p>Duyệt và đúc chứng nhận NFT lên Blockchain</p>
                </header>

                {/* 2. THÊM PHẦN NÀY: Dải 3 thẻ thống kê giống Figma */}
                <div className={styles.statsGrid}>
                    <StatCard title="Yêu cầu chờ duyệt" value="5" icon="!" type="warning" />
                    <StatCard title="Đã từ chối" value="1" icon="✕" type="danger" />
                    <StatCard title="Đã đúc NFT" value="12" icon="🏅" type="info" />
                </div>

                <section className={styles.batchSection}>
                    <h2>Lô hàng chờ kiểm định</h2>
                    <div className={styles.grid}>

                        {/* Đây là đoạn code thực sự yêu cầu React vẽ các thẻ ra: */}
                        {/* SỬA: Đổ dữ liệu thực tế từ Database */}
                        {batches.length === 0 ? <p>Không có lô hàng chờ duyệt.</p> :
                            batches.map((batch) => {
                                // Ánh xạ dữ liệu DB sang cấu trúc của BatchCard Component
                                const displayData = {
                                    id: batch._id,
                                    name: `Lô ${batch.productId?.productName || 'Sản phẩm'}`,
                                    status: 'Chờ kiểm định',
                                    farmer: 'Xem chi tiết...',
                                    location: 'Đã định vị',
                                    cropType: batch.productId?.productName,
                                    area: 'N/A',
                                    quantity: `${batch.quantity} kg`,
                                    progress: 100
                                };

                                return (
                                    <BatchCard
                                        key={displayData.id}
                                        batch={displayData}
                                        onMint={() => processApproveAndMint(batch._id)} // Truyền hàm xử lý mới vào đây
                                        isMinting={isMinting}
                                    />
                                );
                            })
                        }

                    </div>
                </section>
            </main>
        </div>
    );
};