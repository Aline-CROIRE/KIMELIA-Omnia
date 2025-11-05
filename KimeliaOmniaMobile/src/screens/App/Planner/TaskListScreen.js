import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientBackground,
  ContentContainer,
  Title,
  LoadingIndicator,
  ErrorText, // Still available for actual errors
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
  SubTitle, // Added for empty state
  DetailText, // Added for empty state
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Added for icons

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={60} color={COLORS.lightCocoa} style={{ marginBottom: 15 }} />
              <SubTitle style={{ color: COLORS.deepCoffee, marginBottom: 10 }}>No Tasks Found</SubTitle>
              <DetailText style={{ textAlign: 'center', color: COLORS.chocolateBrown, paddingHorizontal: 20 }}>
                Looks like your to-do list is empty! Tap the '+' button below to add your first task.
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
      <FloatingActionButton onPress={() => navigation.navigate('TaskForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

export default TaskListScreen;