import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientBackground,
  ScrollContainer,
  ContentContainer,
  Title,
  LoadingIndicator,
  ErrorText,
  DetailText,
  Label,
  Badge,
  BadgeText,
  Row,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  Section,
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../constants';
import { format, parseISO, isPast } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const GoalDetailScreen = ({ route, navigation }) => {
  // Ensure goalId is stringified upon retrieval if it somehow isn't
  const { goalId: routeGoalId, goalTitle } = route.params;
  const goalId = String(routeGoalId); // --- Explicitly stringify here ---

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!goalId || goalId.trim() === '') { // Use the stringified goalId for validation
    console.error("GoalDetailScreen received invalid or empty goalId:", goalId);
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>
            Error: Invalid or missing Goal ID provided. Cannot retrieve details.
          </ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  useEffect(() => {
    navigation.setOptions({ title: goalTitle || 'Goal Details' });
  }, [navigation, goalTitle]);

  const fetchGoalDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get(`/goals/${goalId}`); // Use stringified goalId
      setGoal(response.data.data);
    } catch (e) {
      console.error("Failed to fetch goal details:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load goal details.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load goal details.');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useFocusEffect(
    useCallback(() => {
      fetchGoalDetails();
      return () => {};
    }, [fetchGoalDetails])
  );

  const handleDeleteGoal = async () => {
    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/goals/${goalId}`); // Use stringified goalId
              Alert.alert("Success", "Goal deleted successfully!");
              navigation.goBack();
            } catch (e) {
              console.error("Failed to delete goal:", e.response?.data || e.message);
              setError(e.response?.data?.message || 'Failed to delete goal.');
              Alert.alert('Error', e.response?.data?.message || 'Could not delete goal.');
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <LoadingIndicator />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>{error}</ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  if (!goal) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>Goal not found.</ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.goalTitle}>{goal.title}</Title>

          <View style={styles.metaRow}>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="trophy-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Status:</Label>
              <Badge type={goal.status === 'completed' ? 'completed' : 'info'}><BadgeText>{goal.status}</BadgeText></Badge>
            </Row>
            {goal.targetDate && (
              <Row style={styles.metaItem}>
                <MaterialCommunityIcons name="calendar-clock-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
                <Label style={styles.metaLabel}>Target:</Label>
                <Badge type={isPast(parseISO(goal.targetDate)) && goal.status !== 'completed' ? 'overdue' : 'default'}>
                  <BadgeText>
                    <Text>Target: </Text>
                    {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
                  </BadgeText>
                </Badge>
              </Row>
            )}
          </View>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Description</Label>
            </Row>
            <DetailText style={styles.detailContent}>{goal.description || 'No description provided.'}</DetailText>
          </Section>

          {goal.progress !== undefined && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="progress-check" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Progress</Label>
              </Row>
              <DetailText style={styles.detailContent}>
                <Text style={styles.progressValue}>{goal.progress}%</Text>
                <Text> - </Text>
                <Text>{goal.status}</Text>
              </DetailText>
            </Section>
          )}

          {goal.category && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tag-text-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Category</Label>
              </Row>
              <Badge type="default" style={styles.categoryBadge}><BadgeText>{goal.category}</BadgeText></Badge>
            </Section>
          )}

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Timestamps</Label>
            </Row>
            {goal.createdAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Created At:</Text> {format(parseISO(goal.createdAt), 'PPPPpppp')}
              </DetailText>
            )}
            {goal.updatedAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Last Updated:</Text> {format(parseISO(goal.updatedAt), 'PPPPpppp')}
              </DetailText>
            )}
          </Section>

          <Row style={styles.buttonGroup}>
            <GradientButton onPress={() => navigation.navigate('GoalForm', { goalId: goal._id, goalToEdit: goal })} style={styles.editButton}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                  <ButtonText>Edit Goal</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={handleDeleteGoal} style={styles.deleteButton}>
              <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                  <ButtonText>Delete Goal</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>
          </Row>

        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  goalTitle: {
    fontSize: 26,
    marginBottom: 25,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
    backgroundColor: COLORS.softCream,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.chocolateBrown,
    marginBottom: 0,
    marginTop: 0,
    fontWeight: '700',
    fontFamily: FONTS.secondary,
  },
  icon: {
    marginRight: 5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightCocoa,
    paddingBottom: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.deepCoffee,
    fontWeight: '700',
    fontFamily: FONTS.secondary,
    marginBottom: 0,
    marginTop: 0,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.deepCoffee,
    marginTop: 8,
    fontFamily: FONTS.secondary,
  },
  progressValue: {
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
  },
  categoryBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  tagsContainer: {
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  timestampLabel: {
    fontWeight: '700',
    color: COLORS.chocolateBrown,
  },
  buttonGroup: {
    marginTop: 30,
    flexDirection: 'column',
    width: '100%',
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 0,
  },
  buttonContent: {
    gap: 10,
  },
});

export default GoalDetailScreen;