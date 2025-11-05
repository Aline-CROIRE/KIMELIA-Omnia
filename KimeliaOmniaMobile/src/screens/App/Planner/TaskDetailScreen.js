import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
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
  Section, // Ensure Section is imported
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // For icons

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskId, taskTitle } = route.params;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Frontend validation remains loosened to send whatever ID is passed
  if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
    console.error("TaskDetailScreen received invalid or empty taskId:", taskId);
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>
            Error: Invalid or missing Task ID provided. Cannot retrieve details.
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
    navigation.setOptions({ title: taskTitle || 'Task Details' });
  }, [navigation, taskTitle]);

  const fetchTaskDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      setTask(response.data.data);
    } catch (e) {
      console.error("Failed to fetch task details:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load task details.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load task details.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      fetchTaskDetails();
      return () => {};
    }, [fetchTaskDetails])
  );

  const handleDeleteTask = async () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/tasks/${taskId}`);
              Alert.alert("Success", "Task deleted successfully!");
              navigation.goBack();
            } catch (e) {
              console.error("Failed to delete task:", e.response?.data || e.message);
              setError(e.response?.data?.message || 'Failed to delete task.');
              Alert.alert('Error', e.response?.data?.message || 'Could not delete task.');
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
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

  if (!task) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>Task not found.</ErrorText>
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
          <Title style={styles.taskTitle}>{task.title}</Title>

          <View style={styles.metaRow}>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="list-status" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Status:</Label>
              <Badge type={task.status}><BadgeText>{task.status}</BadgeText></Badge>
            </Row>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="flag-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Priority:</Label>
              <Badge type={task.priority}><BadgeText>{task.priority}</BadgeText></Badge>
            </Row>
          </View>

          {task.dueDate && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="calendar-clock-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Due Date</Label>
              </Row>
              <DetailText style={styles.detailContent}>{format(new Date(task.dueDate), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Description</Label>
            </Row>
            <DetailText style={styles.detailContent}>{task.description || 'No description provided.'}</DetailText>
          </Section>

          {task.tags && task.tags.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Tags</Label>
              </Row>
              <Row style={styles.tagsContainer}>
                {task.tags.map((tag, index) => (
                  <Badge key={index} type="default">
                    <BadgeText>{tag}</BadgeText>
                  </Badge>
                ))}
              </Row>
            </Section>
          )}

          {task.project && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="folder-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Project</Label>
              </Row>
              <DetailText style={styles.detailContent}>{task.project.name || task.project || 'N/A'}</DetailText>
            </Section>
          )}

          {task.reminders && task.reminders.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Reminders</Label>
              </Row>
              <View style={styles.remindersContainer}>
                {task.reminders.map((reminder, index) => (
                  <Row key={index} style={styles.reminderItem}>
                    <Badge type="info" style={styles.reminderBadge}>
                      <BadgeText>{format(new Date(reminder.time), 'MMM d, p')}</BadgeText>
                    </Badge>
                    <Badge type="default" style={styles.reminderBadge}>
                      <BadgeText>{reminder.method}</BadgeText>
                    </Badge>
                  </Row>
                ))}
              </View>
            </Section>
          )}

          <Row style={styles.buttonGroup}>
            <GradientButton onPress={() => navigation.navigate('TaskForm', { taskId: task._id, taskToEdit: task })} style={styles.editButton}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                  <ButtonText>Edit Task</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={handleDeleteTask} style={styles.deleteButton}>
              <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                  <ButtonText>Delete Task</ButtonText>
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
  taskTitle: {
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
    marginBottom: 0, // Reset default Label margin-bottom
    marginTop: 0, // Reset default Label margin-top
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
    marginTop: 8, // Added space after section header
    fontFamily: FONTS.secondary,
  },
  tagsContainer: {
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8, // Spacing between tags
  },
  remindersContainer: {
    marginTop: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow badges to wrap
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 8, // Space between badges in a reminder item
  },
  reminderBadge: {
    marginBottom: 0, // Reset default badge margin
  },
  buttonGroup: {
    marginTop: 30,
    flexDirection: 'column', // Stack buttons vertically
    width: '100%',
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 0, // Last button doesn't need bottom margin
  },
  buttonContent: {
    gap: 10,
  },
});

export default TaskDetailScreen;
