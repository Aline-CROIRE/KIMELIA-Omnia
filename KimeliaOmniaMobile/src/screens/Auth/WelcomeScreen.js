import React from 'react';
import { View, StyleSheet, Text } from 'react-native'; // Import StyleSheet for local styles and Text
import {
  GradientBackground,
  Title,
  SubTitle,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  ContentContainer,
  ScrollContainer,
} from '../../components/StyledComponents';
import KIMELIAOmniaLogo from '../../components/Logo/KIMELIAOmniaLogo';
import { COLORS, GRADIENTS, FONTS } from '../../constants'; // Import FONTS

const WelcomeScreen = ({ navigation }) => {
  return (
    <GradientBackground colors={GRADIENTS.background}>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <KIMELIAOmniaLogo iconSize={120} textSize={40} /> {/* Slightly larger logo */}
          </View>
          
          {/* Main Title & Tagline */}
          <Title style={styles.mainTitle}>
            <Text>Your World, Organized Intelligently.</Text>
          </Title>
          
          <SubTitle style={styles.tagline}>
            <Text>AI-powered productivity for life and work.</Text>
          </SubTitle>

          {/* Call-to-Action Buttons */}
          <View style={styles.buttonGroup}>
            <GradientButton onPress={() => navigation.navigate('Login')} style={styles.button}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <ButtonText>Login</ButtonText>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={() => navigation.navigate('Register')} style={styles.button}>
              <GradientButtonBackground colors={GRADIENTS.goldAccent}>
                <ButtonText>Create Account</ButtonText> {/* More inviting text */}
              </GradientButtonBackground>
            </GradientButton>
          </View>
        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50, // Added vertical padding for scrollable content
  },
  contentContainer: {
    paddingHorizontal: 30, // Increased horizontal padding slightly
  },
  logoContainer: {
    marginBottom: 50, // More space below the logo
    // Align logo if needed, but KIMELIAOmniaLogo handles its own internal layout
  },
  mainTitle: {
    marginTop: 0, // Reset default Title margin-top as controlled by logoContainer
    marginBottom: 15,
    fontSize: 32, // Slightly larger title for impact
    fontFamily: FONTS.primary, // Ensure font is explicitly used
  },
  tagline: {
    marginVertical: 25, // More vertical margin for tagline emphasis
    fontSize: 22, // Slightly larger tagline
    fontFamily: FONTS.secondary, // Ensure font is explicitly used
    color: COLORS.deepCoffee, // Deeper color for better contrast
    lineHeight: 30,
  },
  buttonGroup: {
    marginTop: 40, // More space before buttons
    width: '100%',
  },
  button: {
    marginBottom: 15, // Consistent spacing between buttons
  },
});

export default WelcomeScreen;