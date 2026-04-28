import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import styles from './Login.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
    const [role, setRole] = useState('FARMER'); // Mặc định là Farmer
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- LUỒNG 1: ĐĂNG NHẬP WEB2 (FARMER / DELIVERER) ---
    const handleWeb2Login = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Chọn endpoint dựa trên Tab đang chọn
            const endpoint = role === 'DELIVERER'
                ? `${API_URL}/user/deliverer/login`
                : `${API_URL}/user/farmer/login`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');

            // Lưu token và thông tin user
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Điều hướng dựa trên vai trò
            if (role === 'DELIVERER') {
                navigate('/shipping'); // Trang vận chuyển vừa tạo
            } else {
                navigate('/farmer/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- LUỒNG 2: ĐĂNG NHẬP WEB3 (INSPECTOR) ---
    const handleInspectorLogin = async () => {
        setError('');
        if (!window.ethereum) return setError('Vui lòng cài đặt MetaMask!');

        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletAddress = accounts[0];

            // 1. Lấy mã Nonce từ server
            const resNonce = await fetch(`${API_URL}/user/inspector/request-nonce`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
            });
            const { nonce } = await resNonce.json();
            if (!resNonce.ok) throw new Error('Ví này chưa được đăng ký!');

            // 2. Ký thông điệp với MetaMask
            const signer = await provider.getSigner();
            const message = `AgriTrace login nonce: ${nonce}`;
            const signature = await signer.signMessage(message);

            // 3. Gửi chữ ký lên server để xác thực
            const resVerify = await fetch(`${API_URL}/user/inspector/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, signature }),
            });

            const data = await resVerify.json();
            if (!resVerify.ok) throw new Error(data.message);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/inspector/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <h2 className={styles.title}>Đăng nhập AgriTrace</h2>

                {/* Tab Vai trò (3 Tabs) */}
                <div style={{ display: 'flex', marginBottom: '1.5rem', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'FARMER' ? '#10b981' : 'transparent', color: role === 'FARMER' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('FARMER'); setError(''); }}
                    >
                        Nông dân
                    </button>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'DELIVERER' ? '#3b82f6' : 'transparent', color: role === 'DELIVERER' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('DELIVERER'); setError(''); }}
                    >
                        Vận chuyển
                    </button>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', cursor: 'pointer', fontWeight: 500, backgroundColor: role === 'INSPECTOR' ? '#f5841f' : 'transparent', color: role === 'INSPECTOR' ? 'white' : '#6b7280' }}
                        onClick={() => { setRole('INSPECTOR'); setError(''); }}
                    >
                        Kiểm định
                    </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {/* HIỂN THỊ FORM TƯƠNG ỨNG */}
                {role === 'INSPECTOR' ? (
                    <div className={styles.form}>
                        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Sử dụng ví MetaMask để xác thực quyền Kiểm định viên.
                        </p>
                        <button onClick={handleInspectorLogin} className={styles.submitBtn} disabled={loading} style={{ backgroundColor: '#f5841f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width="20" />
                            {loading ? 'Đang xác thực...' : 'Đăng nhập với MetaMask'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleWeb2Login} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input type="email" required placeholder="Nhập email của bạn"
                                value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mật khẩu</label>
                            <input type="password" required placeholder="Nhập mật khẩu"
                                value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading} style={{ backgroundColor: role === 'DELIVERER' ? '#3b82f6' : '#10b981' }}>
                            {loading ? 'Đang xử lý...' : `Đăng nhập ${role === 'DELIVERER' ? 'Vận chuyển' : 'Nông dân'}`}
                        </button>
                    </form>
                )}

                <div className={styles.footer}>
                    <span>Chưa có tài khoản? </span>
                    <Link to="/register" className={styles.link}>Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
}