import React from 'react';
import styles from './AboutInfo.module.css';
import { LuShieldCheck, LuLeaf, LuLink } from 'react-icons/lu';

const AboutInfo = () => {
  return (
    <div className={styles.infoWrapper}>
      {/* HERO GIỚI THIỆU */}

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Minh bạch từ <span className={styles.textGreen}>nông trại</span> đến <span className={styles.textGreen}>bàn ăn</span>
          </h1>
          <p className={styles.description}>
            AgriTrace ra đời với sứ mệnh mang lại sự an tâm tuyệt đối cho người tiêu dùng. Bằng cách ứng dụng công nghệ chuỗi khối (Blockchain), chúng tôi số hóa mọi bước trong quy trình canh tác, đảm bảo mỗi sản phẩm bạn cầm trên tay đều có một "cuốn hộ chiếu" rõ ràng và trung thực nhất.
          </p>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.imagePlaceholder}>
            <span>AgriTrace Vision</span>
          </div>
        </div>
      </section>

      {/* GIÁ TRỊ CỐT LÕI */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Giá trị cốt lõi</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={styles.iconWrapper}><LuShieldCheck /></div>
            <h3>Dữ liệu bất biến</h3>
            <p>Mọi nhật ký canh tác và kiểm định đều được mã hóa, không ai có thể làm giả hay xóa bỏ.</p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.iconWrapper}><LuLink /></div>
            <h3>Kết nối trực tiếp</h3>
            <p>Xóa bỏ khoảng cách thông tin giữa người nông dân tận tụy và người tiêu dùng thông thái.</p>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.iconWrapper}><LuLeaf /></div>
            <h3>Nông nghiệp xanh</h3>
            <p>Thúc đẩy và tôn vinh những phương pháp canh tác bền vững, an toàn cho môi trường.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutInfo;