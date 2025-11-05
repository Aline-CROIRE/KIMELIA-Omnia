import React from 'react';
import {
  GradientBackground, // Using the new gradient background
  Title,
  SubTitle,
  GradientButton, // Using the new gradient button
  GradientButtonBackground,
  ButtonText,
} from '../../components/StyledComponents';
import KIMELIAOmniaLogo from '../../components/Logo/KIMELIAOmniaLogo';
import { COLORS, GRADIENTS } from '../../constants';

const WelcomeScreen = ({ navigation }) => {
  return (
    <GradientBackground colors={GRADIENTS.background}> {/* Apply gradient background */}
      <KIMELIAOmniaLogo iconSize={100} textSize={36} /> {/* Larger logo for welcome */}
      
      <Title style={{ marginTop: 40, color: COLORS.deepCoffee, textAlign: 'center' }}>
        Your World, Organized Intelligently.
      </Title>
      
      <SubTitle style={{ marginVertical: 20, color: COLORS.chocolateBrown, textAlign: 'center' }}>
        AI-powered productivity for life and work.
      </SubTitle>

      <GradientButton onPress={() => navigation.navigate('Login')} style={{ marginBottom: 20 }}>
        <GradientButtonBackground>
          <ButtonText>Login</ButtonText>
        </GradientButtonBackground>
      </GradientButton>

      <GradientButton onPress={() => navigation.navigate('Register')}>
        <GradientButtonBackground colors={GRADIENTS.goldAccent}> {/* Different gradient for Register */}
          <ButtonText>Register</ButtonText>
        </GradientButtonBackground>
      </GradientButton>
    </GradientBackground>
  );
};

export default WelcomeScreen;
