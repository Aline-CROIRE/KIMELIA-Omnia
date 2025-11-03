import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View } from 'react-native';
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
import { COLORS, GRADIENTS } from '../../../constants';
import { format } from 'date-fns';

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
      // --- ENHANCED LOGGING ---
      console.log('Fetching task with ID:', taskId, ' (type:', typeof taskId, ')');
      // --- END ENHANCED LOGGING ---

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
              // --- ENHANCED LOGGING ---
              console.log('Deleting task with ID:', taskId, ' (type:', typeof taskId, ')');
              // --- END ENHANCED LOGGING ---
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
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee }}>{task.title}</Title>

          <Section style={{ width: '100%', alignItems: 'flex-start' }}>
            <Label>Description:</Label>
            <DetailText>{task.description || 'No description provided.'}</DetailText>
          </Section>

          <Section style={{ width: '100%', alignItems: 'flex-start' }}>
            <Label>Status:</Label>
            <Row>
              <Badge type={task.status}><BadgeText>{task.status}</BadgeText></Badge>
            </Row>
          </Section>

          <Section style={{ width: '100%', alignItems: 'flex-start' }}>
            <Label>Priority:</Label>
            <Row>
              <Badge type={task.priority}><BadgeText>{task.priority}</BadgeText></Badge>
            </Row>
          </Section>

          {task.dueDate && (
            <Section style={{ width: '100%', alignItems: 'flex-start' }}>
              <Label>Due Date:</Label>
              <DetailText>{format(new Date(task.dueDate), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          {task.tags && task.tags.length > 0 && (
            <Section style={{ width: '100%', alignItems: 'flex-start' }}>
              <Label>Tags:</Label>
              <Row>
                {task.tags.map((tag, index) => (
                  <Badge key={index} type="default">
                    <BadgeText>{tag}</BadgeText>
                  </Badge>
                ))}
              </Row>
            </Section>
          )}

          {task.project && (
            <Section style={{ width: '100%', alignItems: 'flex-start' }}>
              <Label>Project:</Label>
              <DetailText>{task.project.name || task.project || 'N/A'}</DetailText>
            </Section>
          )}

          {task.reminders && task.reminders.length > 0 && (
            <Section style={{ width: '100%', alignItems: 'flex-start' }}>
              <Label>Reminders:</Label>
              {task.reminders.map((reminder, index) => (
                <Row key={index} style={{ backgroundColor: COLORS.softCream, padding: 8, borderRadius: 8, marginBottom: 8, width: '100%' }}>
                  <Badge type="info" style={{ marginRight: 10, marginBottom: 5 }}>
                    <BadgeText>{format(new Date(reminder.time), 'MMM d, p')}</BadgeText>
                  </Badge>
                  <Badge type="default">
                    <BadgeText>{reminder.method}</BadgeText>
                  </Badge>
                </Row>
              ))}
            </Section>
          )}

          <GradientButton onPress={() => navigation.navigate('TaskForm', { taskId: task._id, taskToEdit: task })} style={{ marginTop: 20 }}>
            <GradientButtonBackground>
              <ButtonText>Edit Task</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

          <GradientButton onPress={handleDeleteTask}>
            <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
              <ButtonText>Delete Task</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default TaskDetailScreen;