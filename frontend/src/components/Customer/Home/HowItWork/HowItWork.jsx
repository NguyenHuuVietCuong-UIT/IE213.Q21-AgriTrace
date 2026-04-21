import React from 'react';
import { LuQrCode, LuMap, LuShieldCheck } from "react-icons/lu";
import styles from './HowItWork.module.css';

const HowItWork = () => {
    const steps = [
        {
            number: 1,
            icon: <LuQrCode />,
            title: "Quét mã QR trên sản phẩm",
            desc: "Mỗi lô hàng có mã QR riêng dán trực tiếp lên sản phẩm hoặc kệ siêu thị.",
            color: "#10B981"
        },
        {
            number: 2,
            icon: <LuMap />,
            title: "Xem toàn bộ hành trình",
            desc: "Từ ngày gieo hạt, loại phân bón, ngày thu hoạch đến kiểm định VietGAP.",
            color: "#3B82F6"
        },
        {
            number: 3,
            icon: <LuShieldCheck />,
            title: "Đối chiếu blockchain",
            desc: "Dữ liệu được đối chiếu tự động với NFT trên Ethereum — không thể làm giả.",
            color: "#A855F7"
        }
    ];

    return (
        <section className={styles.section}>

            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Cách hoạt động</h2>
                <p className={styles.sectionSubtitle}>
                    Quy trình đơn giản để truy xuất nguồn gốc nông sản
                </p>
            </div>

            <div className={styles.stepsContainer}>
                {steps.map((step, index) => (

                    <div key={index} className={styles.stepItem}>
                        {/* Vòng tròn */}
                        <div
                            className={styles.numberCircle}
                            style={{ backgroundColor: step.color }}
                        >
                            {step.number}
                        </div>

                        {/* Nội dung */}
                        <div className={styles.stepContent}>
                            <div className={styles.iconWrapper} style={{ color: step.color }}>
                                {step.icon}
                            </div>

                            <h4 className={styles.stepTitle}>{step.title}</h4>
                            <p className={styles.stepDesc}>{step.desc}</p>
                        </div>

                        {/* Nét nối giữa các bước */}
                        {index < steps.length - 1 && <div className={styles.connector} />}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default HowItWork;