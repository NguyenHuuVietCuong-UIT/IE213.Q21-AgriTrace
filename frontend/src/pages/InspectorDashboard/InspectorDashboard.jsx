import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Inspector/Sidebar/Sidebar';
import { BatchCard } from '../../components/Inspector/BatchCard/BatchCard';
import { StatCard } from '../../components/Inspector/StatCard/StatCard';
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

export const InspectorDashboard = () => {
    const { account, isConnecting, isMinting, connectWallet, handleMintNFT } = useWeb3();
    const [batches, setBatches] = useState([]);

    const fetchPendingBatches = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/batches/pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách:", error);
        }
    };

    useEffect(() => {
        fetchPendingBatches();
    }, []);

    const processApproveAndMint = async (batchId) => {
        try {
            // 1. Gắn IPFS
            const pinRes = await fetch(`http://localhost:5000/api/batches/${batchId}/pin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const pinData = await pinRes.json();

            if (!pinRes.ok || !pinData.success) {
                throw new Error(pinData.message || "Lỗi đẩy dữ liệu lên IPFS");
            }

            // 2. Ký ví MetaMask (Gọi Smart Contract)
            // Đảm bảo hook useWeb3 của bạn xử lý và trả về { tokenId, txHash }
            const mintResult = await handleMintNFT(`ipfs://${pinData.ipfsHash}`);
            if (!mintResult) return; // Dừng nếu người dùng ấn "Từ chối" trên MetaMask

            // 3. Báo Backend cập nhật trạng thái MINTED
            const confirmRes = await fetch(`http://localhost:5000/api/batches/${batchId}/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    tokenId: mintResult.tokenId,
                    txHash: mintResult.txHash
                })
            });

            if (!confirmRes.ok) throw new Error("Lỗi khi lưu xác nhận NFT vào Database");

            alert(`🎉 Đã đúc NFT thành công! Token ID: ${mintResult.tokenId}`);
            fetchPendingBatches(); // Làm mới giao diện, lô hàng sẽ biến mất
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

                <div className={styles.statsGrid}>
                    <StatCard title="Yêu cầu chờ duyệt" value={batches.length} icon="!" type="warning" />
                    <StatCard title="Đã từ chối" value="0" icon="✕" type="danger" />
                    <StatCard title="Đã đúc NFT" value="-" icon="🏅" type="info" />
                </div>

                <section className={styles.batchSection}>
                    <h2>Lô hàng chờ kiểm định</h2>
                    <div className={styles.grid}>
                        {batches.length === 0 ? <p>Không có lô hàng chờ duyệt.</p> :
                            batches.map((batch) => {
                                // Fallback lấy tên sản phẩm an toàn
                                const productName = batch.productId?.name || batch.productId?.productName || 'Sản phẩm chưa rõ';

                                const displayData = {
                                    id: batch._id,
                                    name: `Lô ${productName}`,
                                    status: 'Chờ kiểm định',
                                    farmer: batch.inspectorId?.name || 'Nông dân ẩn danh',
                                    location: 'Xem chi tiết nhật ký',
                                    cropType: productName,
                                    area: 'N/A',
                                    quantity: `${batch.quantity} kg`,
                                    progress: 100
                                };

                                return (
                                    <BatchCard
                                        key={displayData.id}
                                        batch={displayData}
                                        onMint={() => processApproveAndMint(batch._id)}
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