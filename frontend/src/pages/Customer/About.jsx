import React from 'react';
import AboutInfo from '../../components/Customer/About/AboutInfo/AboutInfo';
import Team from '../../components/Customer/About/Team/Team';

const About = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 5%' }}>
      <AboutInfo />
      <Team />
    </div>
  );
};

export default About;