import React from 'react';
import styled from 'styled-components/native';
import { COLORS, FONTS } from '../../constants';

const TextWrapper = styled.View`
  flex-direction: row;
  align-items: baseline;
`;

const KIMELIASpan = styled.Text`
  font-family: ${FONTS.logo};
  font-weight: 600;
  color: ${COLORS.deepCoffee};
  /* CORRECTED: Direct numeric values for font-size, line-height, letter-spacing, margin-right */
  font-size: ${(props) => props.fontSize || 22};
  line-height: ${(props) => (props.fontSize ? props.fontSize * 1.2 : 26.4)}; /* Using multiplier for line-height or default */
  letter-spacing: -0.5;
  margin-right: 2;
`;

const OmniaSpan = styled.Text`
  font-family: ${FONTS.logo};
  font-weight: 700;
  color: ${COLORS.chocolateBrown};
  /* CORRECTED: Direct numeric values for font-size, line-height, letter-spacing */
  font-size: ${(props) => (props.fontSize ? props.fontSize * 0.9 : 19.8)}; /* Direct calculation, e.g., 22 * 0.9 = 19.8 */
  line-height: ${(props) => (props.fontSize ? props.fontSize * 1.2 : 26.4)}; /* Using multiplier for line-height or default */
  letter-spacing: -0.2;
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