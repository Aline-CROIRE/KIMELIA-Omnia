import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
        <Title style={styles.mainTitle}><Text>Omnia Coach</Text></Title>
        <SubTitle style={styles.tagline}>
          <Text>Track your progress, achieve your goals, and master new skills.</Text>
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

        {/* Learning Resources Module Card */}
        <ModuleCard onPress={() => navigation.navigate('LearningResourceList')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.goldAccent}>
            <MaterialCommunityIcons name="book-open-variant" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>Learning Resources</ModuleCardTitle>
              <ModuleCardDescription>Discover and manage your learning paths.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* --- NEW: AI Generate Resources Card --- */}
        <ModuleCard onPress={() => navigation.navigate('LearningResourceAIGenerate')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.tertiaryButton}> {/* Using a distinct gradient for AI */}
            <MaterialCommunityIcons name="robot-happy-outline" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>AI Resource Generator</ModuleCardTitle>
              <ModuleCardDescription>Let AI suggest new learning materials for you.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>
        {/* --- END NEW --- */}

        {/* Motivational Tips Card (Placeholder for later implementation) */}
        <ModuleCard onPress={() => console.log('Show Motivational Tip')} style={styles.moduleCard}>
          <ModuleCardBackground colors={GRADIENTS.secondaryButton}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={50} color={COLORS.deepCoffee} />
            <ModuleCardContent>
              <ModuleCardTitle style={{ color: COLORS.deepCoffee }}><Text>Motivational Tip</Text></ModuleCardTitle>
              <ModuleCardDescription style={{ color: COLORS.chocolateBrown }}><Text>Get inspired with a daily dose of motivation.</Text></ModuleCardDescription>
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