

// ============================================================================
// src/components/Logo/KIMELIAOmniaLogo.js
// ============================================================================
import React from 'react';
import styled from 'styled-components/native';
import KIMELIAOmniaIcon from './KIMELIAOmniaIcon';
import KIMELIAOmniaText from './KIMELIAOmniaText';

const LogoContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

const KIMELIAOmniaLogo = ({ iconSize = 60, textSize = 22, showText = true }) => {
  return (
    <LogoContainer>
      <KIMELIAOmniaIcon size={iconSize} />
      {showText && <KIMELIAOmniaText fontSize={textSize} />}
    </LogoContainer>
  );
};

export default KIMELIAOmniaLogo;