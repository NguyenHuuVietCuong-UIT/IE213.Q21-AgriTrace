import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import InspectorNavbar from './InspectorNavbar/InspectorNavbar';
import styles from './InspectorLayout.module.css'; // Dùng chung layout CSS với FarmerLayout

const InspectorLayout = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthToken = () => localStorage.getItem('token');

    const fetchBatchesFromDB = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/batches/inspector-all`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu');
            const result = await response.json();
            setBatches(Array.isArray(result) ? result : (result.data || []));
        } catch (error) {
            console.error('Lỗi API:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBatchesFromDB(); }, []);

    const stats = {
        total: batches.length,
        pending: batches.filter(b => b.status === 'LOCKED').length,
        approved: batches.filter(b => b.status === 'MINTED').length,
        rejected: batches.filter(b => b.status === 'REJECTED').length
    };

    return (
        <div className={styles.layoutWrapper}>
            <InspectorNavbar />
            <main className={styles.mainContent}>
                {/* Truyền các props cần thiết xuống tất cả các route con qua Outlet */}
                <Outlet context={{ batches, loading, stats, fetchBatchesFromDB }} />
            </main>
        </div>
    );
};

export default InspectorLayout;