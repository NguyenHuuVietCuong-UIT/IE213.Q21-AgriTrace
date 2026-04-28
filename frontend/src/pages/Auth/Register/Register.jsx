import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import styles from './Register.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
    // Thêm vai trò DELIVERER vào state mặc định
    const [role, setRole] = useState('FARMER');

    // State cho Web2 (Farmer & Deliverer)
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    // State cho Web3 (Inspector)
    const [inspectorName, setInspectorName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // --- LUỒNG 1: ĐĂNG KÝ WEB2 (FARMER / DELIVERER) ---
    const handleWeb2Submit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp');
        }
        setLoading(true);

        try {
            // Xác định endpoint dựa trên role đang chọn
            const endpoint = role === 'DELIVERER'
                ? `${API_URL}/deliverer/register`
                : `${API_URL}/farmer/register`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại');

            const roleName = role === 'DELIVERER' ? 'Người vận chuyển' : 'Nông dân';
            setSuccess(`Đăng ký ${roleName} thành công! Đang chuyển hướng...`);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LUỒNG 2: ĐĂNG KÝ KIỂM ĐỊNH VIÊN (WEB3) ---
    const connectWallet = async () => {
        setError('');
        if (!window.ethereum) return setError('Vui lòng cài đặt ví MetaMask!');

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setWalletAddress(accounts[0]);
        } catch (err) {
            setError('Lỗi khi kết nối ví MetaMask.');
        }
    };

    const handleInspectorSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (!walletAddress) return setError('Vui lòng kết nối ví MetaMask trước khi đăng ký.');

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/inspector/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: inspectorName, walletAddress }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại');

            setSuccess('Đăng ký Kiểm định viên thành công! Đang chuyển hướng...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerCard}>
                <h2 className={styles.title}>Đăng ký AgriTrace</h2>

                {/* Tab chuyển đổi vai trò (3 Tabs) */}
                <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'FARMER' ? '#10b981' : 'transparent', color: role === 'FARMER' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('FARMER'); setError(''); setSuccess(''); }}
                    >
                        Nông dân (Web2)
                    </button>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'DELIVERER' ? '#3b82f6' : 'transparent', color: role === 'DELIVERER' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('DELIVERER'); setError(''); setSuccess(''); }}
                    >
                        Vận chuyển (Web2)
                    </button>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'INSPECTOR' ? '#f5841f' : 'transparent', color: role === 'INSPECTOR' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('INSPECTOR'); setError(''); setSuccess(''); }}
                    >
                        Kiểm định (Web3)
                    </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {success && <div className={styles.successMessage}>{success}</div>}

                {/* FORM WEB 2 (FARMER & DELIVERER) */}
                {role === 'FARMER' || role === 'DELIVERER' ? (
                    <form onSubmit={handleWeb2Submit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Họ và tên {role === 'DELIVERER' ? 'Người vận chuyển' : ''}</label>
                            <input type="text" required placeholder="Nhập họ và tên"
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input type="email" required placeholder="example@gmail.com"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mật khẩu</label>
                            <input type="password" required placeholder="Tối thiểu 6 ký tự"
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Xác nhận mật khẩu</label>
                            <input type="password" required placeholder="Nhập lại mật khẩu"
                                value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading || success} style={{ backgroundColor: role === 'DELIVERER' ? '#3b82f6' : '#10b981' }}>
                            {loading ? 'Đang xử lý...' : `Đăng ký ${role === 'DELIVERER' ? 'Người vận chuyển' : 'Nông dân'}`}
                        </button>
                    </form>
                ) : (
                    /* FORM INSPECTOR (GIỮ NGUYÊN) */
                    <form onSubmit={handleInspectorSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Họ và tên Kiểm định viên</label>
                            <input type="text" required placeholder="Nhập họ và tên hoặc tên tổ chức"
                                value={inspectorName} onChange={e => setInspectorName(e.target.value)} />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Địa chỉ ví Web3 (MetaMask)</label>
                            {walletAddress ? (
                                <div style={{ padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px', fontSize: '0.85rem', color: '#374151', wordBreak: 'break-all' }}>
                                    ✅ {walletAddress}
                                </div>
                            ) : (
                                <button type="button" onClick={connectWallet} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width="20" />
                                    Kết nối ví MetaMask
                                </button>
                            )}
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading || success || !walletAddress} style={{ backgroundColor: '#f5841f' }}>
                            {loading ? 'Đang xử lý...' : 'Đăng ký Kiểm định viên'}
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" className={styles.link}>Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}