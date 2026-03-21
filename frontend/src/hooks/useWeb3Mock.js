import { useState } from 'react';

export const useWeb3Mock = () => {
    const [account, setAccount] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMinting, setIsMinting] = useState(false);

    // GIẢ LẬP: Kết nối ví MetaMask (Sẽ dùng ethers.js thật sau)
    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            // Giả lập delay mở popup MetaMask
            await new Promise(resolve => setTimeout(resolve, 1000));
            // TODO: [TÍCH HỢP WEB3] - Dùng window.ethereum.request({ method: 'eth_requestAccounts' })
            setAccount('0x1234567890abcdef1234567890abcdef123489AB');
        } catch (error) {
            console.error("Lỗi kết nối", error);
        } finally {
            setIsConnecting(false);
        }
    };

    // GIẢ LẬP: Hành động đúc NFT
    const handleMintNFT = async (batchId) => {
        setIsMinting(true);
        try {
            // TODO: [TÍCH HỢP BACKEND] - Gọi API TV3 lấy link IPFS ở đây
            console.log(`Đang gọi API lấy IPFS cho lô ${batchId}...`);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // TODO: [TÍCH HỢP SMART CONTRACT] - Gọi hàm mintBatchNFT của TV1 ở đây
            console.log('Đang chờ chữ ký và xác nhận từ mạng Sepolia...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert(`🎉 Duyệt và Đúc NFT thành công cho lô hàng: ${batchId}`);
        } catch (error) {
            alert("Lỗi khi xử lý Blockchain");
        } finally {
            setIsMinting(false);
        }
    };

    return { account, isConnecting, isMinting, connectWallet, handleMintNFT };
};