import React from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { BatchCard } from '../../components/BatchCard/BatchCard';
import { StatCard } from '../../components/StatCard/StatCard'; // 1. Import thẻ StatCard
import { useWeb3 } from '../../hooks/useWeb3';
import styles from './InspectorDashboard.module.css';

// Dán đè đoạn này lên trên hàm export const InspectorDashboard = () => { ... }
const MOCK_BATCHES = [
    {
        id: 'B1',
        name: 'Lô Xoài Cát Chu 2026',
        status: 'Chờ kiểm định',
        farmer: 'Nguyễn Văn An',
        location: 'Đồng Tháp',
        cropType: 'Xoài Cát Chu',
        area: '1.5 ha',
        quantity: '800 kg',
        progress: 100
    },
    {
        id: 'B2',
        name: 'Lô Cà Phê Arabica 2026',
        status: 'Chờ kiểm định',
        farmer: 'Trần Thị Bình',
        location: 'Lâm Đồng',
        cropType: 'Cà Phê Arabica',
        area: '2 ha',
        quantity: '1500 kg',
        progress: 100
    },
    {
        id: 'B3',
        name: 'Lô Thanh Long Ruột Đỏ',
        status: 'Chờ kiểm định',
        farmer: 'Lê Văn Cường',
        location: 'Bình Thuận',
        cropType: 'Thanh Long',
        area: '1.2 ha',
        quantity: '600 kg',
        progress: 100
    }
];

export const InspectorDashboard = () => {
    const { account, isConnecting, isMinting, connectWallet, handleMintNFT } = useWeb3();

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
                        {MOCK_BATCHES.map((batch) => (
                            <BatchCard
                                key={batch.id}
                                batch={batch}
                                onMint={handleMintNFT}
                                isMinting={isMinting}
                            />
                        ))}

                    </div>
                </section>
            </main>
        </div>
    );
};