// src/components/Logo/KIMELIAOmniaLogo.js
import React from 'react';
import styled from 'styled-components/native';
import KIMELIAOmniaIcon from './KIMELIAOmniaIcon';
import KIMELIAOmniaText from './KIMELIAOmniaText';

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

// Changed default iconSize and textSize to numbers
const KIMELIAOmniaLogo = ({ iconSize = 60, textSize = 22 }) => { // 60 for icon, 22 for text (equivalent of 2.2rem if 1rem=10px)
  return (
    <LogoContainer>
      <KIMELIAOmniaIcon size={iconSize} />
      <KIMELIAOmniaText fontSize={textSize} />
    </LogoContainer>
  );
};

export default KIMELIAOmniaLogo;