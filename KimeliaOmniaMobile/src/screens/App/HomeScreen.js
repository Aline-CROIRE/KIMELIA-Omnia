import React, { useContext, useEffect, useState } from 'react';
import { Alert, View, Text } from 'react-native';
import {
  GradientBackground,
  Title,
  SubTitle,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  LoadingIndicator,
  ErrorText,
  ScrollContainer,
  ContentContainer,
} from '../../components/StyledComponents';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { COLORS } from '../../constants';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await apiClient.get('/auth/profile');
        setProfileData(response.data);
      } catch (e) {
        setErrorProfile(e.response?.data?.message || 'Failed to fetch profile data.');
        Alert.alert('Error', 'Failed to load user profile. Please try again later.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee }}>Welcome, {profileData?.name || user?.name || 'User'}!</Title>
          <SubTitle style={{ color: COLORS.chocolateBrown }}>Your World, Organized Intelligently.</SubTitle>

          {loadingProfile ? (
            <LoadingIndicator />
          ) : errorProfile ? (
            <ErrorText>{errorProfile}</ErrorText>
          ) : (
            profileData && (
              <View style={{ width: '100%', alignItems: 'center', marginTop: 20 }}>
                <SubTitle style={{ marginTop: 20, color: COLORS.deepCoffee }}>Your Dashboard Overview</SubTitle>
                <Text style={{ color: COLORS.deepCoffee, fontSize: 16, marginBottom: 10, textAlign: 'center' }}>
                  (This is where your personalized insights and quick actions will appear.)
                </Text>
                <GradientButton>
                  <GradientButtonBackground colors={['#7E6E5C', '#6A5B4A']}>
                    <ButtonText>View Your Calendar</ButtonText>
                  </GradientButtonBackground>
                </GradientButton>
                <GradientButton>
                  <GradientButtonBackground colors={['#A9746E', '#8B5B54']}>
                    <ButtonText>Check Recent Messages</ButtonText>
                  </GradientButtonBackground>
                </GradientButton>
              </View>
            )
          )}

          <GradientButton onPress={logout} style={{ marginTop: 30 }}>
            <GradientButtonBackground colors={['#A0522D', '#8B4513']}>
              <ButtonText>Logout</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default HomeScreen;