import React from 'react';
import styles from './Team.module.css';

const Team = () => {
  // Dữ liệu mảng các thành viên 
  const teamMembers = [
    { id: 1, name: 'Huỳnh Thanh Dân', role: 'Web 2 / Frontend', initials: 'HD' },
    { id: 2, name: 'Nguyễn Hữu Việt Cường', role: 'Web System Developer', initials: 'NC' },
    { id: 3, name: 'Bùi Công Danh', role: 'Web 2 / Backend', initials: 'BD' },
    { id: 4, name: 'Nguyễn Thành Trung', role: 'Web 3 / Backend', initials: 'NT' },
    { id: 5, name: 'Lý Đăng Khoa', role: 'Database / Smart Contract ', initials: 'LK' },
  ];

  return (
    <section className={styles.teamSection}>
      <div className={styles.teamHeader}>
        <h2 className={styles.sectionTitle}>Đội ngũ phát triển</h2>
        <p className={styles.sectionSubtitle}>
          Những người đứng sau sứ mệnh minh bạch hóa chuỗi cung ứng nông sản.
        </p>
      </div>

      <div className={styles.teamGrid}>
        {teamMembers.map((member) => (
          <div key={member.id} className={styles.teamCard}>
            {/* <img src="..." /> */}
            <div className={styles.avatarPlaceholder}>
              {member.initials}
            </div>
            <h4 className={styles.memberName}>{member.name}</h4>
            <span className={styles.memberRole}>{member.role}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;