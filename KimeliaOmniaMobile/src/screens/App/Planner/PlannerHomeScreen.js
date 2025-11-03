import React from 'react';
import { View } from 'react-native';
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
import { COLORS, GRADIENTS } from '../../../constants';

const PlannerHomeScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <ContentContainer>
        <Title style={{ color: COLORS.deepCoffee }}>Omnia Planner</Title>
        <SubTitle style={{ color: COLORS.chocolateBrown, marginBottom: 40, textAlign: 'center' }}>
          Organize your day, week, and life. Manage your tasks and calendar events seamlessly.
        </SubTitle>

        {/* Tasks Navigation Card */}
        <ModuleCard onPress={() => navigation.navigate('TaskList')}>
          <ModuleCardBackground colors={GRADIENTS.primaryButton}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>My Tasks</ModuleCardTitle>
              <ModuleCardDescription>View, create, and manage your to-do list.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* Events Navigation Card */}
        <ModuleCard onPress={() => navigation.navigate('EventList')}>
          <ModuleCardBackground colors={GRADIENTS.goldAccent}>
            <MaterialCommunityIcons name="calendar-check-outline" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>My Events</ModuleCardTitle>
              <ModuleCardDescription>Manage your calendar appointments and meetings.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* You can add more cards here for other planner features in the future */}
      </ContentContainer>
    </GradientBackground>
  );
};

export default PlannerHomeScreen;