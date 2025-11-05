import React from 'react';
import styled from 'styled-components/native';
import { COLORS, FONTS } from '../../constants'; // Ensure FONTS is imported

const TextWrapper = styled.View`
  flex-direction: row;
  align-items: baseline;
`;

const KIMELIASpan = styled.Text`
  font-family: ${FONTS.logo}; // Uses 'Poppins_600SemiBold'
  font-weight: 600; // Matches Poppins_600SemiBold
  color: ${COLORS.deepCoffee};
  font-size: ${(props) => props.fontSize || 22}px;
  line-height: ${(props) => (props.fontSize ? props.fontSize * 1.2 : 26.4)}px;
  letter-spacing: -0.5px;
  margin-right: 2px;
`;

const OmniaSpan = styled.Text`
  font-family: ${FONTS.logo}; // Uses 'Poppins_600SemiBold'
  font-weight: 700; // Poppins_700Bold if available, otherwise Poppins_600SemiBold will render bolder if possible
  color: ${COLORS.chocolateBrown};
  font-size: ${(props) => (props.fontSize ? props.fontSize * 0.9 : 19.8)}px;
  line-height: ${(props) => (props.fontSize ? props.fontSize * 1.2 : 26.4)}px;
  letter-spacing: -0.2px;
`;

const KIMELIAOmniaText = ({ fontSize = 22 }) => {
  return (
    <TextWrapper>
      <KIMELIASpan fontSize={fontSize}>KIMELIA</KIMELIASpan>
      <OmniaSpan fontSize={fontSize}>Omnia</OmniaSpan>
    </TextWrapper>
  );
};

export default KIMELIAOmniaText;