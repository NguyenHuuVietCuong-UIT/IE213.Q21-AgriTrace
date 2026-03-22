import { useState } from 'react';
import { ethers } from 'ethers'; // THÊM: Thư viện kết nối Blockchain

// THÊM: Khai báo địa chỉ và ABI tối giản của Smart Contract (Có thể đưa vào file .env sau)
const CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "0x_ĐIỀN_ĐỊA_CHỈ_CONTRACT_VÀO_ĐÂY";
const MINIMAL_ABI = [
    "function mintBatchNFT(string memory tokenURI) public returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMinting, setIsMinting] = useState(false); // Trạng thái loading khi đúc NFT

    // Hàm gọi MetaMask hiện lên
    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            // Kiểm tra xem trình duyệt đã cài MetaMask chưa
            if (typeof window.ethereum !== 'undefined') {
                // Yêu cầu người dùng kết nối ví
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]); // Lưu địa chỉ ví lại (VD: 0x123...abc)
            } else {
                alert("🦊 Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt để tiếp tục!");
            }
        } catch (error) {
            console.error("Lỗi kết nối ví:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    // Hàm xử lý khi bấm nút "Duyệt & Đúc NFT"
    // SỬA: Thay thế logic giả lập bằng tương tác Blockchain thật
    const handleMintNFT = async (tokenURI) => {
        if (!account) {
            alert("⚠️ Vui lòng kết nối ví MetaMask ở góc trái trước khi đúc NFT!");
            return null; // Trả về null nếu chưa kết nối ví
        }

        setIsMinting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer);

            // 1. Gọi Blockchain đúc NFT
            const tx = await contract.mintBatchNFT(tokenURI);
            const receipt = await tx.wait(); // Chờ giao dịch hoàn tất

            // 2. Bóc tách Token ID từ sự kiện sinh ra
            let tokenId = null;
            for (const log of receipt.logs) {
                try {
                    const parsedLog = contract.interface.parseLog(log);
                    if (parsedLog && parsedLog.name === 'Transfer') {
                        tokenId = parsedLog.args.tokenId.toString();
                    }
                } catch (e) { /* Bỏ qua log rác */ }
            }

            return { txHash: receipt.hash, tokenId }; // Trả về kết quả cho Dashboard xử lý tiếp
        } catch (error) {
            console.error("Lỗi đúc NFT:", error);
            alert("❌ Có lỗi xảy ra khi gọi ví đúc NFT.");
            return null;
        } finally {
            setIsMinting(false);
        }
    };

    return { account, isConnecting, isMinting, connectWallet, handleMintNFT };
};