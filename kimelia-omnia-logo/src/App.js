// src/App.js
import React from 'react';
import { ThemeProvider } from 'styled-components';
import styled, { createGlobalStyle } from 'styled-components';
import { colors, fonts } from './theme';
import KIMELIAOmniaLogo from './components/KIMELIAOmniaLogo';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: ${fonts.secondary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${colors.lightGrey}; /* Default app background */
    color: ${colors.darkText}; /* Default app text color */
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
`;

const SectionTitle = styled.h2`
  color: ${colors.primaryPurple}; /* Updated title color */
  margin-top: 60px;
  margin-bottom: 30px;
  font-family: ${fonts.primary};
  font-weight: 700;
  text-align: center;
`;

const LogoDisplaySection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  margin: 20px 0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  max-width: 90%;
  text-align: center;
`;

const LogoName = styled.p`
  font-weight: 600;
  margin-top: 15px;
  color: ${props => props.textColor || colors.darkText};
`;

function App() {
  return (
    <ThemeProvider theme={{ colors, fonts }}>
      <GlobalStyle />
      <AppContainer>
        <SectionTitle>🌟 KIMELIA Omnia Logo Showcase 🌟</SectionTitle>

        <LogoDisplaySection style={{ backgroundColor: colors.lightGrey }}>
          <KIMELIAOmniaLogo withDownload={true} />
          <LogoName>Default Background (Light Grey)</LogoName>
        </LogoDisplaySection>

        <LogoDisplaySection style={{ backgroundColor: colors.softLavender }}>
          <KIMELIAOmniaLogo iconSize="70px" textSize="2.5rem" />
          <LogoName textColor={colors.darkText}>On Soft Lavender Background</LogoName>
        </LogoDisplaySection>

        <LogoDisplaySection style={{ background: colors.demoGradientBg }}> {/* Using gradient background */}
          <KIMELIAOmniaLogo iconSize="70px" textSize="2.5rem" />
          <LogoName textColor={colors.lightGrey}>On Gradient Background</LogoName>
        </LogoDisplaySection>

        <LogoDisplaySection style={{ backgroundColor: colors.demoDarkBg }}>
          <KIMELIAOmniaLogo iconSize="70px" textSize="2.5rem" />
          <LogoName textColor={colors.lightGrey}>On Deep Purple Background</LogoName>
        </LogoDisplaySection>

        <LogoDisplaySection style={{ backgroundColor: '#FFFFFF', border: `1px solid ${colors.lightGrey}` }}>
          <KIMELIAOmniaLogo iconSize="70px" textSize="2.5rem" />
          <LogoName>On Pure White Background</LogoName>
        </LogoDisplaySection>

        <SectionTitle>Various Sizes</SectionTitle>

        <LogoDisplaySection style={{ backgroundColor: colors.accentTeal }}>
          <KIMELIAOmniaLogo iconSize="40px" textSize="1.5rem" />
          <LogoName textColor={colors.primaryPurple}>Small Logo Example</LogoName>
        </LogoDisplaySection>

        <LogoDisplaySection style={{ backgroundColor: colors.primaryPurple }}>
          <KIMELIAOmniaLogo iconSize="90px" textSize="3.5rem" />
          <LogoName textColor={colors.lightGrey}>Large Logo Example</LogoName>
        </LogoDisplaySection>

      </AppContainer>
    </ThemeProvider>
  );
}

export default App;