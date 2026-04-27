# 🌾 AgriTrace - Hệ thống Truy xuất Nguồn gốc Nông sản Ứng dụng Blockchain

## Môn học : IE213 - Kỹ thuật phát triển hệ thống Web

## 👥 Thành viên thực hiện
* **Nguyễn Hữu Việt Cường** - 23520203 (Nhóm trưởng)
* **Huỳnh Thanh Dân** - 23520220
* **Bùi Công Danh** - 23520240
* **Nguyễn Thành Trung** - 23521682
* **Lý Đăng Khoa** - 23520743

---

## 📖 Mô tả đề tài
**AgriTrace** là một hệ thống truy xuất nguồn gốc nông sản toàn diện, tích hợp công nghệ **Blockchain** và lưu trữ phi tập trung **IPFS**. Dự án giải quyết vấn đề thiếu minh bạch trong chuỗi cung ứng nông sản bằng cách ghi nhận mọi bước từ khi gieo trồng, kiểm định đến khi phân phối lên sổ cái chuỗi khối (Blockchain) dưới dạng NFT. Điều này giúp đảm bảo dữ liệu không thể bị thay đổi, giả mạo, mang lại niềm tin tuyệt đối cho người tiêu dùng.

---

## 🚀 Công nghệ sử dụng
* **Frontend**: React.js (Vite), CSS Modules, Web3.js / Ethers.js
* **Backend**: Node.js, Express.js, RESTful APIs
* **Cơ sở dữ liệu**: MongoDB
* **Blockchain & Lưu trữ**: Solidity (Smart Contract), Mạng Sepolia Testnet, IPFS (Pinata)
* **Thiết kế UI/UX**: Figma

---

## 🌟 Các chức năng chính

Hệ thống được chia thành nhiều luồng người dùng (Actor) với các quyền hạn riêng biệt:

### 1. Phân hệ Nông dân (Farmer)
* Quản lý danh sách các lô hàng nông sản (Batch).
* Ghi chép và cập nhật nhật ký canh tác (Farming Log) theo thời gian thực.
* Tương tác với Smart Contract để yêu cầu đúc (mint) thông tin lô hàng.

### 2. Phân hệ Kiểm định viên (Inspector)
* Xem danh sách các lô hàng đang chờ kiểm định.
* Cập nhật trạng thái chất lượng của lô hàng sau khi kiểm tra.
* Xác thực và đưa dữ liệu lô hàng đã đạt chuẩn lên Blockchain.

### 3. Phân hệ Khách hàng (Customer / Public)
* Tra cứu thông tin nguồn gốc nông sản minh bạch.
* Xem chi tiết thông tin từ lúc gieo trồng đến khi thu hoạch.
* Xác minh tính chính xác của dữ liệu thông qua Smart Contract và IPFS.

---

## 📂 Cấu trúc thư mục

```text
📦 IE213.Q21-AgriTrace-dev
 ┣ 📂 backend          # Mã nguồn server Node.js & Express
 ┣ 📂 frontend         # Mã nguồn giao diện người dùng React.js
 ┣ 📂 smartcontract    # Mã nguồn Smart Contract viết bằng Solidity
 ┣ 📂 docs             # Các tài liệu phân tích thiết kế, báo cáo
 ┗ 📜 .gitignore
```

---

## ⚙️ Hướng dẫn cài đặt và chạy (How to run)

### Yêu cầu hệ thống:
* [Node.js](https://nodejs.org/) (Khuyến nghị bản LTS)
* Trình quản lý gói: `npm` hoặc `yarn`
* Ví [MetaMask](https://metamask.io/) Extension (Đã chuyển sang mạng Sepolia)
* Tài khoản [MongoDB Atlas](https://www.mongodb.com/) hoặc MongoDB Local
* Tài khoản Pinata (để sử dụng IPFS)

### Bước 1: Clone Repository
```bash
git clone https://github.com/NguyenHuuVietCuong-UIT/IE213.Q21-AgriTrace
cd IE213.Q21-AgriTrace
```

### Bước 2: Khởi chạy Backend
1. Di chuyển vào thư mục backend: `cd backend`
2. Cài đặt các dependencies: `npm install`
3. Tạo file `.env` dựa trên file `.env.example` (nếu có) và điền các thông tin:
   ```env
   PORT=5000
   MONGO_URI=
   JWT_SECRET=
   JWT_EXPIRES_IN=
   PINATA_API_KEY=
   PINATA_API_SECRET=
   SYSTEM_PRIVATE_KEY=
   NFT_CONTRACT_ADDRESS=
   ETH_RPC_URL=
   ```
4. Chạy server: `npm run dev` (Server sẽ chạy ở `http://localhost:5000`)

### Bước 3: Khởi chạy Frontend
1. Mở một terminal mới, di chuyển vào thư mục frontend: `cd frontend`
2. Cài đặt các dependencies: `npm install`
3. Tạo file `.env` và thiết lập biến môi trường:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CONTRACT_ADDRESS=your_deployed_smart_contract_address
   ```
4. Chạy ứng dụng: `npm run dev` (Frontend sẽ chạy ở `http://localhost:5173`)

### Bước 4: Smart Contract (Dành cho việc deploy lại)
Để hệ thống hoạt động với Blockchain, bạn cần deploy contract `BatchNFT.sol`:
1. Mở [Remix IDE](https://remix.ethereum.org/).
2. Tải file `smartcontract/BatchNFT.sol` lên.
3. Tại tab **Solidity Compiler**, chọn phiên bản tương ứng và nhấn **Compile**.
4. Tại tab **Deploy & Run**, chọn Environment là **Injected Provider - MetaMask**.
5. Đảm bảo ví đang ở mạng **Sepolia Testnet** và nhấn **Deploy**.
6. Copy **Contract Address** vừa tạo và dán vào file `.env` ở phần Frontend.

---

## 🛠️ Khắc phục sự cố thường gặp (Troubleshooting)

| Lỗi / Vấn đề | Nguyên nhân & Cách khắc phục |
| :--- | :--- |
| **Lỗi kết nối MongoDB (Timeout / Auth Failed)** | Hãy kiểm tra xem IP của bạn đã được thêm vào mục **Network Access (IP Whitelist)** trên MongoDB Atlas chưa. Kiểm tra lại chuỗi `MONGODB_URI` trong `.env`. |
| **Lỗi liên quan đến Web3 / MetaMask** | Đảm bảo trình duyệt đã cài MetaMask. Khi tương tác, cần chọn đúng mạng **Sepolia Testnet**. Hãy chắc chắn ví của bạn có đủ Sepolia ETH để trả phí gas. Nếu lỗi thiếu biến state như `isUpdating` hoặc `setNetworkName` trong hook Web3, hãy kiểm tra lại file `useWeb3.js`. |
| **Lỗi CORS (Cross-Origin Resource Sharing)** | Xảy ra khi frontend gọi API backend thất bại. Hãy kiểm tra lại file `server.js` ở backend, đảm bảo đã cấu hình middleware `cors()` đúng với URL của frontend. |
| **Không tải lên được ảnh/tệp tin (IPFS Error)** | Kiểm tra lại `PINATA_API_KEY` và `PINATA_SECRET_API_KEY` trong biến môi trường backend có chính xác và còn hiệu lực hay không. |
| **Lỗi Port đang được sử dụng (EADDRINUSE)** | Nếu port `5000` hoặc `5173` bị chiếm dụng, hãy tắt các tiến trình đang chạy port đó hoặc đổi sang port khác trong file `.env` (backend) và `vite.config.js` (frontend). |

---

## 📜 Giấy phép (License)
Dự án được thực hiện phục vụ cho mục đích học thuật tại trường Đại học Công nghệ Thông tin (UIT).