import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  GradientBackground,
  ContentContainer,
  Title,
  SubTitle,
  ModuleCard,
  ModuleCardBackground,
  ModuleCardContent,
  ModuleCardTitle,
  ModuleCardDescription,
} from '../../../components/StyledComponents';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, GRADIENTS, FONTS } from '../../../constants';

const CoachHomeScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <ContentContainer style={styles.contentContainer}>
        <Title style={styles.mainTitle}>Omnia Coach</Title>
        <SubTitle style={styles.tagline}>
          Track your progress, achieve your goals, and master new skills.
        </SubTitle>

        {/* Goals Module Card */}
        <ModuleCard onPress={() => navigation.navigate('GoalList')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.primaryButton}>
            <MaterialCommunityIcons name="target-variant" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>My Goals</ModuleCardTitle>
              <ModuleCardDescription>Set, track, and achieve your personal objectives.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* Learning Resources Module Card (Placeholder for later implementation) */}
        <ModuleCard onPress={() => console.log('Navigate to Learning Resources')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.goldAccent}>
            <MaterialCommunityIcons name="book-open-variant" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>Learning Resources</ModuleCardTitle>
              <ModuleCardDescription>Discover and manage your learning paths.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* Motivational Tips Card (Placeholder for later implementation) */}
        <ModuleCard onPress={() => console.log('Show Motivational Tip')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.secondaryButton}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={50} color={COLORS.deepCoffee} />
            <ModuleCardContent>
              <ModuleCardTitle style={{ color: COLORS.deepCoffee }}>Motivational Tip</ModuleCardTitle>
              <ModuleCardDescription style={{ color: COLORS.chocolateBrown }}>Get inspired with a daily dose of motivation.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

      </ContentContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 28,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.chocolateBrown,
    fontFamily: FONTS.secondary,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 40,
  },
  moduleCard: {
    marginBottom: 20,
  },
});

export default CoachHomeScreen;