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
  SubTitle, // Added for empty state
  DetailText, // Added for empty state
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Added for icons

const EventListScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data.data);
    } catch (e) {
      console.error("Failed to fetch events:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load events.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      return () => {};
    }, [fetchEvents])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (item) => {
    if (!item._id || typeof item._id !== 'string' || item._id.trim() === '') {
      Alert.alert(
        "Invalid Event ID",
        "This event has an invalid ID or it's missing. Cannot open details."
      );
      console.error("Attempted to navigate with invalid event ID:", item._id);
      return;
    }
    navigation.navigate('EventDetail', { eventId: item._id, eventTitle: item.title });
  };

  const renderEventItem = ({ item }) => (
    <Card onPress={() => handleEventPress(item)}>
      <CardTitle>{item.title}</CardTitle>
      {item.description && <CardDescription numberOfLines={2}>{item.description}</CardDescription>}
      <Row>
        <Badge type="info">
          <BadgeText>{format(new Date(item.startTime), 'MMM d, p')}</BadgeText>
        </Badge>
        {item.category && (
          <Badge type="default">
            <BadgeText>{item.category}</BadgeText>
          </Badge>
        )}
      </Row>
    </Card>
  );

  return (
    <GradientBackground>
      <ContentContainer style={{ paddingHorizontal: 0 }}>
        <Title style={{ color: COLORS.deepCoffee }}>My Events</Title>

        <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 20 }}>
          <GradientButton onPress={() => navigation.navigate('TaskList')} style={{ marginBottom: 10 }}>
            <GradientButtonBackground colors={GRADIENTS.primaryButton}>
              <ButtonText>View Tasks</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </View>

        {error ? <ErrorText>{error}</ErrorText> : null}
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          renderItem={renderEventItem}
          contentContainerStyle={{ paddingHorizontal: 20, width: '100%' }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <MaterialCommunityIcons name="calendar-check-outline" size={60} color={COLORS.lightCocoa} style={{ marginBottom: 15 }} />
              <SubTitle style={{ color: COLORS.deepCoffee, marginBottom: 10 }}>No Events Found</SubTitle>
              <DetailText style={{ textAlign: 'center', color: COLORS.chocolateBrown, paddingHorizontal: 20 }}>
                Your calendar is clear! Tap the '+' button below to schedule your first event.
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
      <FloatingActionButton onPress={() => navigation.navigate('EventForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

export default EventListScreen;