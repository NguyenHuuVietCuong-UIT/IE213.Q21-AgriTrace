import { useState } from 'react';
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
    const [account, setAccount] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    // ĐÃ THÊM: Khai báo state để quản lý trạng thái loading khi cập nhật
    const [isUpdating, setIsUpdating] = useState(false);

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
            } else {
                alert("🦊 Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt để tiếp tục!");
            }
        } catch (error) {
            console.error("Lỗi kết nối ví:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleMintNFT = async (tokenURI) => {
        if (!account) {
            alert("⚠️ Vui lòng kết nối ví MetaMask ở góc trái trước khi đúc NFT!");
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
            alert("❌ Có lỗi xảy ra khi gọi ví đúc NFT.");
            return null;
        } finally {
            setIsMinting(false);
        }
    };

    const handleUpdateNFT = async (tokenId, newIpfsHash) => {
        if (!account) {
            alert("⚠️ Vui lòng kết nối ví MetaMask!");
            return null;
        }

        setIsUpdating(true); // Đã có thể gọi hàm này vì state đã được khai báo
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, signer);

            const tx = await contract.updateBatch(tokenId, newIpfsHash);
            const receipt = await tx.wait();

            return { txHash: receipt.hash, success: true };
        } catch (error) {
            console.error("Lỗi cập nhật NFT:", error);
            if (error.message.includes("Chi chu so huu moi duoc cap nhat")) {
                alert("❌ Bạn không có quyền cập nhật lô hàng này!");
            } else {
                alert("❌ Có lỗi xảy ra khi gọi ví cập nhật NFT.");
            }
            return null;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        account,
        isConnecting,
        isMinting,
        isUpdating,
        connectWallet,
        handleMintNFT,
        handleUpdateNFT
    };
};