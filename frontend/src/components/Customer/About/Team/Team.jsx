import React from 'react';
import styles from './Team.module.css';

const Team = () => {
  // Dữ liệu mảng các thành viên 
  const teamMembers = [
    { id: 1, name: 'Huỳnh Thanh Dân', role: 'Frontend Designer', initials: 'HD' },
    { id: 2, name: 'Thành Viên 2', role: 'Smart Contract / Blockchain', initials: 'TV' },
    { id: 3, name: 'Thành Viên 3', role: 'Web System Developer', initials: 'TV' },
    { id: 4, name: 'Thành Viên 4', role: 'Backend / Database', initials: 'TV' },
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