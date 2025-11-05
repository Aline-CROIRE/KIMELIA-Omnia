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

const CommunicatorHomeScreen = ({ navigation }) => {
  return (
    <GradientBackground>
      <ContentContainer>
        <Title style={{ color: COLORS.deepCoffee }}>Omnia Communicator</Title>
        <SubTitle style={{ color: COLORS.chocolateBrown, marginBottom: 40, textAlign: 'center' }}>
          Streamline your communication with AI-powered assistance.
        </SubTitle>

        {/* My Messages Navigation Card */}
        <ModuleCard onPress={() => navigation.navigate('MessageList')}>
          <ModuleCardBackground colors={GRADIENTS.primaryButton}>
            <MaterialCommunityIcons name="email-outline" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>My Messages</ModuleCardTitle>
              <ModuleCardDescription>View, create, and manage smart communications.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* AI Assistant Navigation Card (for summarization/drafting) */}
        <ModuleCard onPress={() => navigation.navigate('MessageForm', { mode: 'ai-assist' })}> {/* Example nav to AI assist */}
          <ModuleCardBackground colors={GRADIENTS.goldAccent}>
            <MaterialCommunityIcons name="robot-outline" size={50} color={COLORS.white} />
            <ModuleCardContent>
              <ModuleCardTitle>AI Assistant</ModuleCardTitle>
              <ModuleCardDescription>Summarize text or draft new messages with AI.</ModuleCardDescription>
            </ModuleCardContent>
          </ModuleCardBackground>
        </ModuleCard>

        {/* You can add more cards here for other communicator features */}
      </ContentContainer>
    </GradientBackground>
  );
};

export default CommunicatorHomeScreen;