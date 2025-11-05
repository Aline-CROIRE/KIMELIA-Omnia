import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, View, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientBackground,
  ContentContainer,
  Title,
  LoadingIndicator,
  ErrorText,
  Card,
  CardTitle,
  CardDescription,
  Badge,
  BadgeText,
  Row,
  FloatingActionButton,
  FabText,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  SubTitle,
  DetailText,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';
import { format, isPast, parseISO } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const GoalListScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get('/goals');
      setGoals(response.data.data);
    } catch (e) {
      console.error("Failed to fetch goals:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load goals.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load goals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
      return () => {};
    }, [fetchGoals])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchGoals();
  }, [fetchGoals]);

  const handleGoalPress = (item) => {
    // Ensuring _id is a string before passing
    const goalIdString = String(item._id); 
    if (!goalIdString || goalIdString.trim() === '') {
      Alert.alert(
        "Invalid Goal ID",
        "This goal has an invalid ID or it's missing. Cannot open details."
      );
      console.error("Attempted to navigate with invalid goal ID:", item._id);
      return;
    }
    navigation.navigate('GoalDetail', { goalId: goalIdString, goalTitle: item.title }); 
  };

  const renderGoalItem = ({ item }) => (
    <Card onPress={() => handleGoalPress(item)} style={styles.goalCard}>
      <CardTitle style={styles.goalCardTitle}>{item.title}</CardTitle>
      {item.description && <CardDescription numberOfLines={2}>{item.description}</CardDescription>}
      <Row style={styles.badgesContainer}>
        <Badge type={item.status === 'completed' ? 'completed' : 'info'}>
          <BadgeText>{item.status}</BadgeText>
        </Badge>
        {item.targetDate && (
          <Badge type={isPast(parseISO(item.targetDate)) && item.status !== 'completed' ? 'overdue' : 'default'}>
            <BadgeText>
              <Text>Target: </Text>
              {format(parseISO(item.targetDate), 'MMM d, yyyy')}
            </BadgeText>
          </Badge>
        )}
        {item.progress !== undefined && (
          <Badge type="info">
            <BadgeText>
              <Text>Progress: </Text>
              {`${item.progress}%`}
            </BadgeText>
          </Badge>
        )}
      </Row>
    </Card>
  );

  return (
    <GradientBackground>
      <ContentContainer style={styles.contentContainer}>
        <Title style={styles.mainTitle}>My Goals</Title>

        <View style={styles.coachHomeButtonContainer}>
          <GradientButton onPress={() => navigation.navigate('CoachHome')} style={styles.coachHomeButton}>
            <GradientButtonBackground colors={['#9b764b', '#b38d6d']}>
              <ButtonText>Coach Home</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </View>

        {error ? <ErrorText>{error}</ErrorText> : null}
        <FlatList
          data={goals}
          keyExtractor={(item) => item._id}
          renderItem={renderGoalItem}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="target-variant" size={60} color={COLORS.lightCocoa} style={styles.emptyStateIcon} />
              <SubTitle style={styles.emptyStateTitle}>No Goals Set Yet</SubTitle>
              <DetailText style={styles.emptyStateDescription}>
                <Text>Ready to achieve something great? Tap the '+' button below to add your first goal!</Text>
              </DetailText>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.chocolateBrown}
              colors={[COLORS.chocolateBrown]}
            />
          }
        />
      </ContentContainer>
      <FloatingActionButton onPress={() => navigation.navigate('GoalForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 0,
  },
  mainTitle: {
    fontSize: 28,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  coachHomeButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  coachHomeButton: {
    borderRadius: 12,
  },
  flatListContent: {
    paddingHorizontal: 20,
    width: '100%',
  },
  goalCard: {
    borderRadius: 15,
    padding: 18,
  },
  goalCardTitle: {
    fontSize: 19,
    fontFamily: FONTS.primary,
    color: COLORS.deepCoffee,
  },
  badgesContainer: {
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 15,
  },
  emptyStateTitle: {
    color: COLORS.deepCoffee,
    marginBottom: 10,
    fontSize: 20,
    fontFamily: FONTS.primary,
  },
  emptyStateDescription: {
    textAlign: 'center',
    color: COLORS.chocolateBrown,
    paddingHorizontal: 10,
    fontFamily: FONTS.secondary,
  },
});

export default GoalListScreen;