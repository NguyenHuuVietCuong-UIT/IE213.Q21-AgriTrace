import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "0x_ĐIỀN_ĐỊA_CHỈ_CONTRACT_MỚI_VÀO_ĐÂY";

const MINIMAL_ABI = [
    "function mintBatch(string memory _ipfsHash) public",
    "function updateBatch(uint _tokenId, string memory _newIpfsHash) public",
    "event BatchMinted(uint tokenId, address owner, string ipfsHash)",
    "event BatchUpdated(uint tokenId, string newIpfsHash)"
];

// HÀM DỊCH MÃ LỖI WEB3 SANG TIẾNG VIỆT
const parseWeb3Error = (error) => {
    console.error("Mã lỗi gốc:", error);

    // Lỗi người dùng tự hủy/từ chối trên MetaMask (Code 4001)
    if (error.code === 4001 || error?.info?.error?.code === 4001 || error?.error?.code === 4001) {
        return "Bạn đã từ chối giao dịch trên ví MetaMask.";
    }

    // Lỗi có popup MetaMask đang mở bị kẹt (Code -32002)
    if (error.code === -32002) {
        return "MetaMask đang có yêu cầu chờ xử lý. Vui lòng mở tiện ích MetaMask để kiểm tra.";
    }

    // Lỗi không đủ tiền trả phí Gas (Code -32000 hoặc -32603)
    if (error.message && (error.message.includes("insufficient funds") || error.code === -32603)) {
        return "Số dư SepoliaETH của bạn không đủ để trả phí Gas. Vui lòng nạp thêm.";
    }

    // Lỗi bị Smart Contract từ chối (Revert)
    if (error.message && error.message.includes("execution reverted")) {
        // Cố gắng trích xuất chuỗi revert từ contract (VD: "Chi chu so huu moi duoc cap nhat")
        const match = error.message.match(/reason="([^"]+)"/);
        if (match && match[1]) {
            return `Giao dịch bị từ chối: ${match[1]}`;
        }
        return "Giao dịch bị Smart Contract từ chối. Bạn có thể không có quyền thao tác.";
    }

    // Lỗi mặc định
    return `Lỗi Web3: ${error.message || "Không xác định"}`;
};

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

    const SEPOLIA_CHAIN_ID = '0xaa36a7';

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            if (typeof window.ethereum !== 'undefined') {
                // 1. Yêu cầu kết nối tài khoản
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                // 2. Kiểm tra mạng hiện tại
                const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

                if (currentChainId !== SEPOLIA_CHAIN_ID) {
                    try {
                        // 3. Yêu cầu MetaMask chuyển sang Sepolia
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: SEPOLIA_CHAIN_ID }],
                        });
                    } catch (switchError) {
                        // Mã lỗi 4902 nghĩa là mạng chưa được thêm vào MetaMask
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [
                                        {
                                            chainId: SEPOLIA_CHAIN_ID,
                                            chainName: 'Sepolia Test Network',
                                            nativeCurrency: {
                                                name: 'SepoliaETH',
                                                symbol: 'SepoliaETH',
                                                decimals: 18,
                                            },
                                            rpcUrls: ['https://rpc.sepolia.org'],
                                            blockExplorerUrls: ['https://sepolia.etherscan.io'],
                                        },
                                    ],
                                });
                            } catch (addError) {
                                console.error("Không thể thêm mạng Sepolia:", addError);
                            }
                        }
                        console.error("Lỗi chuyển mạng:", switchError);
                    }
                }

                setAccount(accounts[0]);
                await fetchNetwork();
                await fetchBalance(accounts[0]);
            } else {
                throw new Error("Vui lòng cài đặt tiện ích mở rộng MetaMask!");
            }
        } catch (error) {
            console.error("Lỗi kết nối ví:", error);
            // Có thể dùng thông báo lỗi cho giao diện
            if (error.message !== "Vui lòng cài đặt tiện ích mở rộng MetaMask!") {
                const msg = parseWeb3Error(error);
                throw new Error(msg);
            } else {
                throw error;
            }
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

            const tx = await contract.updateShipping(tokenId, newIpfsHash);
            const receipt = await tx.wait();

            return { txHash: receipt.hash, success: true };
        } catch (error) {
            const errorMessage = parseWeb3Error(error);
            throw new Error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const verifyOnChainHistory = async (tokenId) => {
        if (!window.ethereum) {
            throw new Error("Vui lòng cài đặt MetaMask để xác minh.");
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, provider);

            // 1. Để TRỐNG tham số trong filter để lấy TẤT CẢ sự kiện BatchUpdated của toàn bộ hệ thống
            const filter = contract.filters.BatchUpdated();
            const allEventLogs = await contract.queryFilter(filter);

            // 2. Dùng Javascript để lọc ra những sự kiện khớp với tokenId hiện tại
            const eventLogs = allEventLogs.filter(log => log.args[0].toString() === tokenId.toString());

            // 3. Trả về danh sách các bản ghi
            const onChainRecords = eventLogs.map(log => ({
                ipfsHash: log.args[1],
                txHash: log.transactionHash
            }));

            return onChainRecords;
        } catch (error) {
            const errorMessage = parseWeb3Error(error);
            throw new Error(`Lỗi Web3: ${errorMessage}`);
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
        handleUpdateNFT,
        verifyOnChainHistory
    };
};