import { useState } from 'react';

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
    const handleMintNFT = async (batchId) => {
        if (!account) {
            alert("⚠️ Vui lòng kết nối ví MetaMask ở góc trái trước khi đúc NFT!");
            return;
        }

        setIsMinting(true);
        try {
            // Tạm thời giả lập thời gian chờ Blockchain xác nhận (2 giây)
            // Sau này Thành viên 5 sẽ gọi API của Backend tại đây
            await new Promise(resolve => setTimeout(resolve, 2000));

            alert(`🎉 Thành công! Đã duyệt và đúc chứng nhận NFT cho lô hàng: ${batchId}`);
        } catch (error) {
            console.error("Lỗi đúc NFT:", error);
            alert("❌ Có lỗi xảy ra khi đúc NFT.");
        } finally {
            setIsMinting(false);
        }
    };

    return { account, isConnecting, isMinting, connectWallet, handleMintNFT };
};