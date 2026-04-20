import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "0x_ĐIỀN_ĐỊA_CHỈ_CONTRACT_MỚI_VÀO_ĐÂY";

// THÊM updateBatch VÀO ABI
const MINIMAL_ABI = [
    "function mintBatch(string memory _ipfsHash) public",
    "function updateBatch(uint _tokenId, string memory _newIpfsHash) public",
    "event BatchMinted(uint tokenId, address owner, string ipfsHash)",
    "event BatchUpdated(uint tokenId, address updater, string newIpfsHash)"
];

export const useWeb3 = () => {
    // 1. KHAI BÁO CÁC STATE
    const [account, setAccount] = useState(null);
    const [networkName, setNetworkName] = useState('');
    const [balance, setBalance] = useState('0');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // 2. CÁC HÀM TIỆN ÍCH
    const fetchNetwork = async () => {
        if (window.ethereum) {
            try {
                // Đọc chuỗi Hex ID của mạng cục bộ thay vì gọi API ethers (Tốc độ 0s)
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });

                const networkMap = {
                    '0x1': 'Ethereum Mainnet',
                    '0xaa36a7': 'Sepolia Testnet',
                    '0x89': 'Polygon Mainnet',
                    '0x38': 'BNB Smart Chain',
                    '0x61': 'BSC Testnet',
                    '0x539': 'Ganache Local' // Dành cho trường hợp các bạn dùng Ganache
                };

                // Trả về tên mạng tương ứng, nếu mạng lạ thì trả về ID
                setNetworkName(networkMap[chainId] || `Mạng ID: ${parseInt(chainId, 16)}`);
            } catch (error) {
                console.error("Lỗi đọc mạng lưới:", error);
                setNetworkName('Không xác định');
            }
        }
    };

    const fetchBalance = async (walletAddress) => {
        if (window.ethereum && walletAddress) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const balanceWei = await provider.getBalance(walletAddress);
                const balanceEth = ethers.formatEther(balanceWei);
                setBalance(parseFloat(balanceEth).toFixed(4));
            } catch (error) {
                console.error("Lỗi lấy số dư:", error);
                setBalance('0');
            }
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setNetworkName('');
        setBalance('0');
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                await fetchNetwork();
                await fetchBalance(accounts[0]);
            } else {
                alert("Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt để tiếp tục!");
            }
        } catch (error) {
            console.error("Lỗi kết nối ví:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    // 3. XỬ LÝ SỰ KIỆN KHI TẢI TRANG / ĐỔI VÍ
    useEffect(() => {
        // Tự động kiểm tra xem ví đã kết nối chưa khi tải lại trang (F5)
        const checkWalletConnected = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        await fetchNetwork();
                        await fetchBalance(accounts[0]);
                    }
                } catch (error) {
                    console.error("Lỗi kiểm tra trạng thái ví:", error);
                }
            }
        };

        checkWalletConnected();

        // Lắng nghe thay đổi tài khoản và mạng lưới từ phía MetaMask
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    fetchNetwork();
                    fetchBalance(accounts[0]);
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload(); // Bắt buộc tải lại trang khi đổi mạng theo chuẩn bảo mật Web3
            });
        }
    }, []);

    // 4. CÁC HÀM TƯƠNG TÁC SMART CONTRACT
    const handleMintNFT = async (tokenURI) => {
        if (!account) {
            alert("Vui lòng kết nối ví MetaMask ở góc trái trước khi đúc NFT!");
            return null;
        }

        setIsMinting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer);

            const tx = await contract.mintBatch(tokenURI);
            const receipt = await tx.wait();

            let tokenId = null;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === 'BatchMinted') {
                        tokenId = parsedLog.args[0].toString();
                    }
                } catch (e) { /* Bỏ qua log rác */ }
            }

            return { txHash: receipt.hash, tokenId };
        } catch (error) {
            console.error("Lỗi đúc NFT:", error);
            alert("Có lỗi xảy ra khi gọi ví đúc NFT.");
            return null;
        } finally {
            setIsMinting(false);
        }
    };

    const handleUpdateNFT = async (tokenId, newIpfsHash) => {
        if (!account) {
            alert("Vui lòng kết nối ví MetaMask!");
            return null;
        }

        setIsUpdating(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer);

            const tx = await contract.updateBatch(tokenId, newIpfsHash);
            const receipt = await tx.wait();

            return { txHash: receipt.hash, success: true };
        } catch (error) {
            console.error("Lỗi cập nhật NFT:", error);
            if (error.message && error.message.includes("Chi chu so huu moi duoc cap nhat")) {
                alert("Bạn không có quyền cập nhật lô hàng này!");
            } else {
                alert("Có lỗi xảy ra khi gọi ví cập nhật NFT.");
            }
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    // 5. TRẢ VỀ CHO COMPONENT SỬ DỤNG
    return {
        account,
        networkName,
        balance,
        isConnecting,
        isMinting,
        isUpdating,
        connectWallet,
        disconnectWallet,
        handleMintNFT,
        handleUpdateNFT
    };
};