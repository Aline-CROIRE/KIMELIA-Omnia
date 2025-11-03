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
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../../constants';
import { format } from 'date-fns';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Frontend validation remains loosened to send whatever ID is passed
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    console.error("EventDetailScreen received invalid or empty eventId:", eventId);
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>
            Error: Invalid or missing Event ID provided. Cannot retrieve details.
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
    navigation.setOptions({ title: eventTitle || 'Event Details' });
  }, [navigation, eventTitle]);

  const fetchEventDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      // --- ENHANCED LOGGING ---
      console.log('Fetching event with ID:', eventId, ' (type:', typeof eventId, ')');
      // --- END ENHANCED LOGGING ---
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data.data);
    } catch (e) {
      console.error("Failed to fetch event details:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load event details.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load event details.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      fetchEventDetails();
      return () => {};
    }, [fetchEventDetails])
  );

  const handleDeleteEvent = async () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
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
              console.log('Deleting event with ID:', eventId, ' (type:', typeof eventId, ')');
              // --- END ENHANCED LOGGING ---
              await apiClient.delete(`/events/${eventId}`);
              Alert.alert("Success", "Event deleted successfully!");
              navigation.goBack();
            } catch (e) {
              console.error("Failed to delete event:", e.response?.data || e.message);
              setError(e.response?.data?.message || 'Failed to delete event.');
              Alert.alert('Error', e.response?.data?.message || 'Could not delete event.');
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

  if (!event) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>Event not found.</ErrorText>
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
          <Title style={{ color: COLORS.deepCoffee }}>{event.title}</Title>

          <Section>
            <Label>Description:</Label>
            <DetailText>{event.description || 'No description provided.'}</DetailText>
          </Section>

          <Section>
            <Label>Location:</Label>
            <DetailText>{event.location || 'Not specified.'}</DetailText>
          </Section>

          <Section>
            <Label>Category:</Label>
            <Row>
              <Badge type="default"><BadgeText>{event.category}</BadgeText></Badge>
            </Row>
          </Section>

          <Section>
            <Label>Starts:</Label>
            <DetailText>{format(new Date(event.startTime), 'PPPPpppp')}</DetailText>
          </Section>

          <Section>
            <Label>Ends:</Label>
            <DetailText>{format(new Date(event.endTime), 'PPPPpppp')}</DetailText>
          </Section>

          <Section>
            <Label>All Day:</Label>
            <DetailText>{event.allDay ? 'Yes' : 'No'}</DetailText>
          </Section>

          {event.attendees && event.attendees.length > 0 && (
            <Section>
              <Label>Attendees:</Label>
              {event.attendees.map((attendee, index) => (
                <DetailText key={index}>- {attendee}</DetailText>
              ))}
            </Section>
          )}

          {event.reminders && event.reminders.length > 0 && (
            <Section style={{ width: '100%', alignItems: 'flex-start' }}>
              <Label>Reminders:</Label>
              {event.reminders.map((reminder, index) => (
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

          <GradientButton onPress={() => navigation.navigate('EventForm', { eventId: event._id, eventToEdit: event })} style={{ marginTop: 20 }}>
            <GradientButtonBackground>
              <ButtonText>Edit Event</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

          <GradientButton onPress={handleDeleteEvent}>
            <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
              <ButtonText>Delete Event</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default EventDetailScreen;