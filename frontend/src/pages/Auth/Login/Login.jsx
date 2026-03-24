import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link vào đây
import { ethers } from 'ethers';
import styles from './Login.module.css';

const API_URL = 'http://localhost:5000/api/auth';

export default function Login() {
    const [role, setRole] = useState('FARMER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleFarmerLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/farmer/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại');

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/farmer/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInspectorLogin = async () => {
        setError('');
        setLoading(true);

        if (!window.ethereum) {
            setError('Vui lòng cài đặt ví MetaMask để tiếp tục!');
            setLoading(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletAddress = accounts[0];

            const nonceRes = await fetch(`${API_URL}/inspector/request-nonce`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress }),
            });
            const nonceData = await nonceRes.json();
            if (!nonceRes.ok) throw new Error(nonceData.message || 'Lỗi khi lấy nonce');

            const signer = await provider.getSigner();
            const message = `AgriTrace login nonce: ${nonceData.nonce}`;
            const signature = await signer.signMessage(message);

            const verifyRes = await fetch(`${API_URL}/inspector/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, signature }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.message || 'Xác thực thất bại');

            localStorage.setItem('token', verifyData.token);
            localStorage.setItem('user', JSON.stringify(verifyData.user));
            navigate('/inspector');

        } catch (err) {
            console.error(err);
            setError(err.message || 'Quá trình đăng nhập Web3 bị hủy hoặc có lỗi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <h2 className={styles.title}>Đăng nhập AgriTrace</h2>

                <div className={styles.roleTabs}>
                    <button
                        className={role === 'FARMER' ? styles.activeTab : styles.tab}
                        onClick={() => setRole('FARMER')}
                    >
                        Nông dân (Web2)
                    </button>
                    <button
                        className={role === 'INSPECTOR' ? styles.activeTab : styles.tab}
                        onClick={() => setRole('INSPECTOR')}
                    >
                        Kiểm định viên (Web3)
                    </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                {role === 'FARMER' ? (
                    <form onSubmit={handleFarmerLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Nhập email của bạn"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Nhập mật khẩu"
                            />
                        </div>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>
                ) : (
                    <div className={styles.web3Container}>
                        <p>Sử dụng ví MetaMask để xác thực danh tính Kiểm định viên.</p>
                        <button
                            onClick={handleInspectorLogin}
                            className={styles.metamaskBtn}
                            disabled={loading}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width="24" />
                            {loading ? 'Đang xác thực...' : 'Kết nối ví MetaMask'}
                        </button>
                    </div>
                )}

                {/* Thêm phần Footer chứa Link chuyển sang trang Đăng ký */}
                <div className={styles.footer}>
                    <span>Chưa có tài khoản? </span>
                    <Link to="/register" className={styles.link}>Đăng ký Nông dân</Link>
                </div>

            </div>
        </div>
    );
}