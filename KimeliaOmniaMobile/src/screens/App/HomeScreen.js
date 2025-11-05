import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native'; // Import Text
import { useFocusEffect } from '@react-navigation/native';
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
  Card,
  CardTitle,
  CardDescription,
  Row,
} from '../../components/StyledComponents';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { isAfter, parseISO } from 'date-fns';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    pendingTasks: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
    totalGoals: 0,
    totalLearningResources: 0,
    totalWellnessRecords: 0,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [errorDashboard, setErrorDashboard] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setErrorDashboard('');
    setLoadingDashboard(true);
    try {
      // 1. Fetch User Profile
      const profileResponse = await apiClient.get('/auth/profile');
      setProfileData(profileResponse.data);

      // 2. Fetch Tasks and calculate pending
      const tasksResponse = await apiClient.get('/tasks');
      const pendingTasksCount = tasksResponse.data.data.filter(task => task.status === 'pending').length;

      // 3. Fetch Events and calculate upcoming
      const eventsResponse = await apiClient.get('/events');
      const now = new Date();
      const upcomingEventsCount = eventsResponse.data.data.filter(event => isAfter(parseISO(event.startTime), now)).length;

      // 4. Fetch Messages and calculate unread
      const messagesResponse = await apiClient.get('/messages');
      const unreadMessagesCount = messagesResponse.data.data.filter(message => message.status === 'unread').length;

      // 5. Fetch Goals and count total
      const goalsResponse = await apiClient.get('/goals');
      const totalGoalsCount = goalsResponse.data.data.length;

      // 6. Fetch Learning Resources and count total
      const learningResourcesResponse = await apiClient.get('/learning-resources');
      const totalLearningResourcesCount = learningResourcesResponse.data.data.length;

      // 7. Fetch Wellness Records and count total
      const wellnessRecordsResponse = await apiClient.get('/wellness-records');
      const totalWellnessRecordsCount = wellnessRecordsResponse.data.data.length;

      setDashboardData({
        pendingTasks: pendingTasksCount,
        upcomingEvents: upcomingEventsCount,
        unreadMessages: unreadMessagesCount,
        totalGoals: totalGoalsCount,
        totalLearningResources: totalLearningResourcesCount,
        totalWellnessRecords: totalWellnessRecordsCount,
      });

    } catch (e) {
      console.error("Failed to fetch dashboard data:", e.response?.data || e.message);
      setErrorDashboard(e.response?.data?.message || 'Failed to load dashboard data.');
      Alert.alert('Error', 'Failed to load dashboard. Please try again later.');
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      return () => {
        // Optional cleanup if needed when screen loses focus
      };
    }, [fetchDashboardData])
  );

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer style={styles.contentContainer}>
          {loadingDashboard ? (
            <LoadingIndicator />
          ) : errorDashboard ? (
            <ErrorText>{errorDashboard}</ErrorText>
          ) : (
            <>
              {/* Welcome Header */}
              <View style={styles.headerContainer}>
                <Title style={styles.welcomeTitle}>
                  <Text>Hello, </Text>{/* Wrapped static text */}
                  {profileData?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Omnia User'}!
                </Title>
                <SubTitle style={styles.welcomeSubTitle}>
                  <Text>Your World, Organized Intelligently.</Text> {/* Wrapped static text */}
                </SubTitle>
              </View>

              {/* Quick Overview Cards */}
              <SubTitle style={styles.sectionTitle}>Your Quick Overview</SubTitle>
              <View style={styles.quickStatsGrid}>
                <Card style={styles.statCard} onPress={() => navigation.navigate('PlannerTab', { screen: 'TaskList' })}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={30} color={COLORS.chocolateBrown} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.pendingTasks}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Pending Tasks</CardDescription>
                </Card>

                <Card style={styles.statCard} onPress={() => navigation.navigate('PlannerTab', { screen: 'EventList' })}>
                  <MaterialCommunityIcons name="calendar-check-outline" size={30} color={COLORS.copper} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.upcomingEvents}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Upcoming Events</CardDescription>
                </Card>

                <Card style={styles.statCard} onPress={() => navigation.navigate('CommunicatorTab', { screen: 'MessageList' })}>
                  <MaterialCommunityIcons name="message-text-outline" size={30} color={COLORS.gold} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.unreadMessages}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Unread Messages</CardDescription>
                </Card>

                <Card style={styles.statCard} onPress={() => navigation.navigate('CoachTab', { screen: 'GoalList' })}>
                  <MaterialCommunityIcons name="target-variant" size={30} color={COLORS.tan} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.totalGoals}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Total Goals</CardDescription>
                </Card>

                <Card style={styles.statCard} onPress={() => Alert.alert('Navigate to Learning Resources', 'Learning Resources module not yet implemented.')}>
                  <MaterialCommunityIcons name="book-open-variant" size={30} color={COLORS.chocolateBrown} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.totalLearningResources}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Learning Resources</CardDescription>
                </Card>

                <Card style={styles.statCard} onPress={() => Alert.alert('Navigate to Wellness', 'Wellness module not yet implemented.')}>
                  <MaterialCommunityIcons name="heart-pulse" size={30} color={COLORS.copper} />
                  <CardTitle style={styles.statCardValue}>{dashboardData.totalWellnessRecords}</CardTitle>
                  <CardDescription style={styles.statCardLabel}>Wellness Records</CardDescription>
                </Card>
              </View>

              {/* Quick Action Buttons */}
              <SubTitle style={styles.sectionTitle}>Quick Actions</SubTitle>
              <View style={styles.quickActionsGroup}>
                <GradientButton onPress={() => navigation.navigate('PlannerTab', { screen: 'TaskForm' })} style={styles.actionButton}>
                  <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                    <Row style={styles.actionButtonContent}>
                      <MaterialCommunityIcons name="plus-circle-outline" size={20} color={COLORS.white} />
                      <ButtonText style={styles.actionButtonText}>Add New Task</ButtonText>
                    </Row>
                  </GradientButtonBackground>
                </GradientButton>

                <GradientButton onPress={() => navigation.navigate('CommunicatorTab', { screen: 'MessageForm' })} style={styles.actionButton}>
                  <GradientButtonBackground colors={GRADIENTS.goldAccent}>
                    <Row style={styles.actionButtonContent}>
                      <MaterialCommunityIcons name="email-edit-outline" size={20} color={COLORS.white} />
                      <ButtonText style={styles.actionButtonText}>Draft New Message</ButtonText>
                    </Row>
                  </GradientButtonBackground>
                </GradientButton>

                <GradientButton onPress={() => navigation.navigate('PlannerTab', { screen: 'EventForm' })} style={styles.actionButton}>
                  <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
                    <Row style={styles.actionButtonContent}>
                      <MaterialCommunityIcons name="calendar-plus" size={20} color={COLORS.deepCoffee} />
                      <ButtonText style={[styles.actionButtonText, { color: COLORS.deepCoffee }]}>Schedule New Event</ButtonText>
                    </Row>
                  </GradientButtonBackground>
                </GradientButton>

                <GradientButton onPress={() => navigation.navigate('CoachTab', { screen: 'GoalForm' })} style={styles.actionButton}>
                  <GradientButtonBackground colors={['#9c5c36', '#c89d7d']}>
                    <Row style={styles.actionButtonContent}>
                      <MaterialCommunityIcons name="target-variant" size={20} color={COLORS.white} />
                      <ButtonText style={styles.actionButtonText}>Set New Goal</ButtonText>
                    </Row>
                  </GradientButtonBackground>
                </GradientButton>
              </View>

              <GradientButton onPress={logout} style={styles.logoutButton}>
                <GradientButtonBackground colors={['#A0522D', '#8B4513']}>
                  <ButtonText>Logout</ButtonText>
                </GradientButtonBackground>
              </GradientButton>
            </>
          )}
        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 30,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: FONTS.primary,
    color: COLORS.deepCoffee,
    marginBottom: 5,
  },
  welcomeSubTitle: {
    fontSize: 18,
    fontFamily: FONTS.secondary,
    color: COLORS.chocolateBrown,
    fontWeight: 'normal',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    marginLeft: 5,
    marginBottom: 15,
    marginTop: 25,
    fontSize: 18,
    color: COLORS.chocolateBrown,
    fontFamily: FONTS.secondary,
    fontWeight: '700',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    width: '47%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 15,
  },
  statCardValue: {
    fontSize: 24,
    fontFamily: FONTS.primary,
    color: COLORS.deepCoffee,
    marginTop: 10,
    marginBottom: 2,
  },
  statCardLabel: {
    fontSize: 13,
    fontFamily: FONTS.secondary,
    color: COLORS.chocolateBrown,
    textAlign: 'center',
  },
  quickActionsGroup: {
    width: '100%',
    marginBottom: 30,
  },
  actionButton: {
    marginBottom: 10,
    borderRadius: 12,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
  },
});

export default HomeScreen;