// src/components/KIMELIAOmniaText.jsx
import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../theme';

const TextWrapper = styled.div`
  display: flex;
  align-items: baseline;
`;

const KIMELIASpan = styled.span`
  font-family: ${fonts.logo};
  font-weight: 600;
  color: ${colors.darkText}; /* Updated to darkText */
  font-size: ${(props) => props.fontSize || '2rem'};
  letter-spacing: -0.02em;
  margin-right: 0.1em;
  line-height: 1;
`;

const OmniaSpan = styled.span`
  font-family: ${fonts.logo};
  font-weight: 700;
  color: ${colors.primaryPurple}; /* Using primaryPurple for Omnia for distinction */
  font-size: ${(props) => `calc(${props.fontSize || '2rem'} * 0.9)`};
  letter-spacing: -0.01em;
  line-height: 1;
`;

const KIMELIAOmniaText = ({ fontSize }) => {
  return (
    <TextWrapper>
      <KIMELIASpan fontSize={fontSize}>KIMELIA</KIMELIASpan>
      <OmniaSpan fontSize={fontSize}>Omnia</OmniaSpan>
    </TextWrapper>
  );
};

export default KIMELIAOmniaText;