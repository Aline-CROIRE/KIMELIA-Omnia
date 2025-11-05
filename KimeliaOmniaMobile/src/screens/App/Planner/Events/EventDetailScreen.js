import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, StyleSheet, Text } from 'react-native'; // Import Text
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
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId, eventTitle } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.eventTitle}>{event.title}</Title>

          <View style={styles.metaRow}>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Category:</Label>
              <Badge type="default"><BadgeText>{event.category}</BadgeText></Badge>
            </Row>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-time-eight-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>All Day:</Label>
              <DetailText style={styles.detailAllDay}>{event.allDay ? 'Yes' : 'No'}</DetailText>
            </Row>
          </View>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="calendar-range" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Event Times</Label>
            </Row>
            <DetailText style={styles.detailContent}>
              <Text style={styles.timestampLabel}>Starts:</Text> {format(new Date(event.startTime), 'PPPPpppp')}
            </DetailText>
            <DetailText style={styles.detailContent}>
              <Text style={styles.timestampLabel}>Ends:</Text> {format(new Date(event.endTime), 'PPPPpppp')}
            </DetailText>
          </Section>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Description</Label>
            </Row>
            <DetailText style={styles.detailContent}>{event.description || 'No description provided.'}</DetailText>
          </Section>

          {event.location && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Location</Label>
              </Row>
              <DetailText style={styles.detailContent}>{event.location}</DetailText>
            </Section>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="account-group-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Attendees</Label>
              </Row>
              <View style={styles.attendeesContainer}>
                {event.attendees.map((attendee, index) => (
                  <DetailText key={index} style={styles.attendeeItem}>
                    <Text>- </Text>{/* Wrapped static text */}
                    {attendee}
                  </DetailText>
                ))}
              </View>
            </Section>
          )}

          {event.reminders && event.reminders.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="bell-ring-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Reminders</Label>
              </Row>
              <View style={styles.remindersContainer}>
                {event.reminders.map((reminder, index) => (
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
            <GradientButton onPress={() => navigation.navigate('EventForm', { eventId: event._id, eventToEdit: event })} style={styles.editButton}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                  <ButtonText>Edit Event</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={handleDeleteEvent} style={styles.deleteButton}>
              <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                  <ButtonText>Delete Event</ButtonText>
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
  eventTitle: {
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
  detailAllDay: {
    fontSize: 14,
    color: COLORS.deepCoffee,
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
  attendeesContainer: {
    marginTop: 8,
  },
  attendeeItem: {
    marginBottom: 4,
    marginLeft: 10,
  },
  remindersContainer: {
    marginTop: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: COLORS.softCream,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    gap: 8,
  },
  reminderBadge: {
    marginBottom: 0,
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

export default EventDetailScreen;