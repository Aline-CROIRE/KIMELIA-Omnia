import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, View } from 'react-native';
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
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';
import { format } from 'date-fns';

// Removed isValidObjectId helper as we're adapting to backend's actual behavior

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get('/tasks');
      setTasks(response.data.data);
    } catch (e) {
      console.error("Failed to fetch tasks:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load tasks.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
      return () => {};
    }, [fetchTasks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskPress = (item) => {
    // Loosened client-side validation: only check if ID is a non-empty string
    if (!item._id || typeof item._id !== 'string' || item._id.trim() === '') {
      Alert.alert(
        "Invalid Task ID",
        "This task has an invalid ID or it's missing. Cannot open details."
      );
      console.error("Attempted to navigate with invalid task ID:", item._id);
      return;
    }
    navigation.navigate('TaskDetail', { taskId: item._id, taskTitle: item.title });
  };

  const renderTaskItem = ({ item }) => (
    <Card onPress={() => handleTaskPress(item)}>
      <CardTitle>{item.title}</CardTitle>
      {item.description && <CardDescription numberOfLines={2}>{item.description}</CardDescription>}
      <Row>
        <Badge type={item.status}>
          <BadgeText>{item.status}</BadgeText>
        </Badge>
        <Badge type={item.priority}>
          <BadgeText>{item.priority}</BadgeText>
        </Badge>
        {item.dueDate && (
          <Badge type="info">
            <BadgeText>{format(new Date(item.dueDate), 'MMM d')}</BadgeText>
          </Badge>
        )}
      </Row>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <GradientBackground>
        <LoadingIndicator />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ContentContainer style={{ paddingHorizontal: 0 }}>
        <Title style={{ color: COLORS.deepCoffee }}>My Tasks</Title>

        <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 20 }}>
          <GradientButton onPress={() => navigation.navigate('EventList')} style={{ marginBottom: 10 }}>
            <GradientButtonBackground colors={GRADIENTS.goldAccent}>
              <ButtonText>View Events</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </View>

        {error ? <ErrorText>{error}</ErrorText> : null}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          renderItem={renderTaskItem}
          contentContainerStyle={{ paddingHorizontal: 20, width: '100%' }}
          ListEmptyComponent={
            <ErrorText style={{ color: COLORS.deepCoffee }}>No tasks found. Click '+' to add one!</ErrorText>
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
      <FloatingActionButton onPress={() => navigation.navigate('TaskForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

export default TaskListScreen;