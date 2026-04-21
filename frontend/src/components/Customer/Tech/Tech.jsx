import React from 'react';
import styles from './Tech.module.css';

const Tech = () => {
  const techStack = [
    {
      id: 1,
      title: 'Mạng lưới Ethereum và Smart Contract',
      desc: 'Mọi lô hàng nông sản khi xuất xưởng đều được đúc (Mint) thành một tài sản độc bản trên mạng lưới Blockchain, đảm bảo tính bất biến của dữ liệu canh tác.'
    },
    {
      id: 2,
      title: 'Lưu trữ phi tập trung IPFS',
      desc: 'Hình ảnh nhật ký canh tác và các tài liệu chứng nhận VietGAP được lưu trữ an toàn trên mạng lưới IPFS, giải quyết bài toán tắc nghẽn lưu trữ tập trung.'
    },
    {
      id: 3,
      title: 'Node.js và MongoDB',
      desc: 'Hệ thống xử lý luồng dữ liệu thời gian thực mạnh mẽ, tối ưu hóa quá trình nông dân nhập liệu hàng ngày trước khi đóng gói lên Blockchain.'
    }
  ];

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={styles.title}>
          Nền tảng công nghệ <span className={styles.highlight}>AgriTrace</span>
        </h1>
        <p className={styles.subtitle}>
          Sự kết hợp giữa tốc độ của Web2 và tính minh bạch tuyệt đối của Web3 (Blockchain Và IPFS) để tạo ra một hệ sinh thái truy xuất nguồn gốc không thể bị phá vỡ.
        </p>
      </div>

      <div className={styles.grid}>
        {techStack.map((tech) => (
          <div key={tech.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{tech.title}</h3>
            <p className={styles.cardDesc}>{tech.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Tech;