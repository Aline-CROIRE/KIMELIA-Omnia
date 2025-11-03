import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Platform, Modal, TouchableOpacity, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isBefore, isValid } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  GradientBackground,
  ScrollContainer,
  ContentContainer,
  Title,
  Input,
  TextArea,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  ErrorText,
  SuccessText,
  LoadingIndicator,
  Label,
  ModalBackground,
  ModalContent,
  ModalButtonRow,
  DateDisplayButton,
  DateDisplayButtonText,
  Row,
  Badge,
  BadgeText,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../../constants';

const EVENT_CATEGORIES = ['meeting', 'appointment', 'personal', 'work', 'study', 'reminder', 'other'];

const EventFormScreen = ({ route, navigation }) => {
  const { eventId, eventToEdit } = route.params || {};
  const isEditing = !!eventId;

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [startTime, setStartTime] = useState(eventToEdit?.startTime ? new Date(eventToEdit.startTime) : new Date());
  const [endTime, setEndTime] = useState(eventToEdit?.endTime ? new Date(eventToEdit.endTime) : new Date());
  const [allDay, setAllDay] = useState(eventToEdit?.allDay || false);
  const [category, setCategory] = useState(eventToEdit?.category || 'meeting');
  const [attendees, setAttendees] = useState(eventToEdit?.attendees ? eventToEdit.attendees.join(', ') : '');

  const [reminders, setReminders] = useState(
    eventToEdit?.reminders?.map(r => ({ ...r, time: new Date(r.time) })) || []
  );
  const [newReminderTime, setNewReminderTime] = useState(new Date());
  const [newReminderMethod, setNewReminderMethod] = useState('app_notification');
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [showDatePickerFor, setShowDatePickerFor] = useState(null); // 'start_date', 'start_time', 'end_date', 'end_time'

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Event' : 'Create New Event',
    });
  }, [isEditing, navigation]);

  // --- CRITICAL FIX: Date/Time Pickers for Event Start/End ---
  const onDateTimeChange = (event, selectedValue) => {
    console.log("[EventForm] Event Start/End Picker - event:", event, "selectedValue:", selectedValue, "showDatePickerFor:", showDatePickerFor);

    if (Platform.OS === 'android') {
      // In both 'set' or 'dismissed', close the picker AFTER the event is processed
      setTimeout(() => setShowDatePickerFor(null), 0);
    } else { // iOS handling for live updates in picker without immediate modal close
      if (selectedValue) {
        if (showDatePickerFor === 'start_date') {
          const newDate = new Date(startTime);
          newDate.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
          setStartTime(newDate);
          if (isBefore(newDate, endTime) && !isBefore(startTime, endTime)) {
              const newEndTime = new Date(endTime);
              newEndTime.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
              setEndTime(newEndTime);
          }
        } else if (showDatePickerFor === 'start_time') {
          const newTime = new Date(startTime);
          newTime.setHours(selectedValue.getHours(), selectedValue.getMinutes());
          setStartTime(newTime);
        } else if (showDatePickerFor === 'end_date') {
          const newDate = new Date(endTime);
          newDate.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
          setEndTime(newDate);
          if (isBefore(newDate, startTime)) {
              const newStartTime = new Date(startTime);
              newStartTime.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
              setStartTime(newStartTime);
          }
        } else if (showDatePickerFor === 'end_time') {
          const newTime = new Date(endTime);
          newTime.setHours(selectedValue.getHours(), selectedValue.getMinutes());
          setEndTime(newTime);
        }
      }
    }

    // Only update the state if the user actually "set" a date/time
    if (event && event.type === 'set' && selectedValue) {
      if (showDatePickerFor === 'start_date') {
        const newDate = new Date(startTime);
        newDate.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
        setStartTime(newDate);
        if (isBefore(newDate, endTime) && !isBefore(startTime, endTime)) {
            const newEndTime = new Date(endTime);
            newEndTime.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
            setEndTime(newEndTime);
        }
      } else if (showDatePickerFor === 'start_time') {
        const newTime = new Date(startTime);
        newTime.setHours(selectedValue.getHours(), selectedValue.getMinutes());
        setStartTime(newTime);
      } else if (showDatePickerFor === 'end_date') {
        const newDate = new Date(endTime);
        newDate.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
        setEndTime(newDate);
        if (isBefore(newDate, startTime)) {
            const newStartTime = new Date(startTime);
            newStartTime.setFullYear(selectedValue.getFullYear(), selectedValue.getMonth(), selectedValue.getDate());
            setStartTime(newStartTime);
        }
      } else if (showDatePickerFor === 'end_time') {
        const newTime = new Date(endTime);
        newTime.setHours(selectedValue.getHours(), selectedValue.getMinutes());
        setEndTime(newTime);
      }
    }
  };

  const openDatePicker = (type) => {
    setShowDatePickerFor(type);
  };

  const handleConfirmDateTime = () => { // For iOS modal
    setShowDatePickerFor(null);
  };

  const handleCancelDateTime = () => { // For iOS modal
    setShowDatePickerFor(null);
  };

  // --- CRITICAL FIX: Reminder Logic DatePicker ---
  const handleAddReminder = () => {
    if (!newReminderTime || !isValid(newReminderTime)) {
      Alert.alert('Error', 'Please set a valid time for the reminder.');
      return;
    }
    setReminders([...reminders, { time: newReminderTime, method: newReminderMethod }]);
    setNewReminderTime(new Date());
    setShowReminderPicker(false); // Ensure reminder picker is closed after adding
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const onNewReminderDateTimeChange = (event, selectedValue) => {
    console.log("[EventForm] Reminder Picker - event:", event, "selectedValue:", selectedValue);

    if (Platform.OS === 'android') {
      // In both 'set' or 'dismissed', close the picker AFTER the event is processed
      setTimeout(() => setShowReminderPicker(false), 0);
    } else { // iOS handling for live updates in picker without immediate modal close
      if (selectedValue) {
        setNewReminderTime(selectedValue);
      }
    }

    // Only update the state if the user actually "set" a date/time
    if (event && event.type === 'set' && selectedValue) {
      setNewReminderTime(selectedValue);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!title || !startTime || !endTime || !category) {
      setError('Title, Start Time, End Time, and Category are required.');
      return;
    }
    if (!isValid(startTime) || !isValid(endTime)) {
        setError('Invalid Start or End Time. Please select valid dates and times.');
        return;
    }
    if (isBefore(endTime, startTime)) {
      setError('End Time cannot be before Start Time.');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title,
        description: description || undefined,
        location: location || undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        allDay: allDay,
        category,
        attendees: attendees ? attendees.split(',').map(email => email.trim()).filter(Boolean) : undefined,
        reminders: reminders.map(r => ({
          time: r.time.toISOString(),
          method: r.method,
        })),
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/events/${eventId}`, eventData);
      } else {
        response = await apiClient.post('/events', eventData);
      }

      Alert.alert('Success', isEditing ? 'Event updated successfully!' : 'Event created successfully!');
      navigation.goBack();
    } catch (e) {
      console.error("Event form error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      let displayError = 'Failed to save event. Please try again.';

      if (backendMessage) {
        displayError = backendMessage;
      }
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  const pickerValue = (() => {
    switch (showDatePickerFor) {
      case 'start_date':
      case 'start_time':
        return startTime;
      case 'end_date':
      case 'end_time':
        return endTime;
      default:
        return new Date();
    }
  })();

  const pickerMode = (() => {
    switch (showDatePickerFor) {
      case 'start_date':
      case 'end_date':
        return 'date';
      case 'start_time':
      case 'end_time':
        return 'time';
      default:
        return 'date';
    }
  })();

  return (
    <GradientBackground>
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee, marginBottom: 20 }}>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          <Label>Title:</Label>
          <Input
            placeholder="Event Title"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Label>Description:</Label>
          <TextArea
            placeholder="Event Description (Optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />

          <Label>Location:</Label>
          <Input
            placeholder="e.g., Zoom, Conference Room A"
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />

          <Label>Category:</Label>
          <View style={{ width: '100%', borderColor: COLORS.lightCocoa, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white }}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={cat} />
              ))}
            </Picker>
          </View>

          <Label>Start Date:</Label>
          <DateDisplayButton onPress={() => openDatePicker('start_date')} disabled={loading}>
            <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
              <DateDisplayButtonText>
                {format(startTime, 'PPP')}
              </DateDisplayButtonText>
            </GradientButtonBackground>
          </DateDisplayButton>

          <Label>Start Time:</Label>
          <DateDisplayButton onPress={() => openDatePicker('start_time')} disabled={loading}>
            <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
              <DateDisplayButtonText>
                {format(startTime, 'p')}
              </DateDisplayButtonText>
            </GradientButtonBackground>
          </DateDisplayButton>

          <Label>End Date:</Label>
          <DateDisplayButton onPress={() => openDatePicker('end_date')} disabled={loading}>
            <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
              <DateDisplayButtonText>
                {format(endTime, 'PPP')}
              </DateDisplayButtonText>
            </GradientButtonBackground>
          </DateDisplayButton>

          <Label>End Time:</Label>
          <DateDisplayButton onPress={() => openDatePicker('end_time')} disabled={loading}>
            <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
              <DateDisplayButtonText>
                {format(endTime, 'p')}
              </DateDisplayButtonText>
            </GradientButtonBackground>
          </DateDisplayButton>

          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: 15, marginTop: 10 }}>
            <Label style={{ margin: 0 }}>All Day Event:</Label>
            <Switch
              onValueChange={setAllDay}
              value={allDay}
              disabled={loading}
              trackColor={{ false: COLORS.tan, true: COLORS.chocolateBrown }}
              thumbColor={allDay ? COLORS.gold : COLORS.lightCocoa}
            />
          </View>

          <Label>Attendees (comma-separated emails):</Label>
          <Input
            placeholder="e.g., user1@example.com, user2@example.com"
            value={attendees}
            onChangeText={setAttendees}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* --- Reminders Section --- */}
          <View style={{ width: '100%', marginTop: 20 }}>
            <Label>Reminders:</Label>
            {reminders.map((reminder, index) => (
              <Row key={index} style={{ justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.softCream, padding: 8, borderRadius: 8, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                  <Badge type="info" style={{ marginRight: 10, marginBottom: 5 }}>
                    <BadgeText>{format(reminder.time, 'MMM d, yyyy p')}</BadgeText>
                  </Badge>
                  <Badge type="default" style={{ marginBottom: 5 }}>
                    <BadgeText>{reminder.method.replace('_', ' ')}</BadgeText>
                  </Badge>
                </View>
                <TouchableOpacity onPress={() => handleRemoveReminder(index)} disabled={loading}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.errorRed} />
                </TouchableOpacity>
              </Row>
            ))}

            <Label>Add a New Reminder:</Label>
            <DateDisplayButton onPress={() => setShowReminderPicker(true)} disabled={loading}>
              <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
                <DateDisplayButtonText>{format(newReminderTime, 'PPP p')}</DateDisplayButtonText>
              </GradientButtonBackground>
            </DateDisplayButton>

            <View style={{ width: '100%', borderColor: COLORS.lightCocoa, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white, marginTop: 10 }}>
              <Picker
                selectedValue={newReminderMethod}
                onValueChange={setNewReminderMethod}
                style={{ color: COLORS.deepCoffee }}
                enabled={!loading}
              >
                <Picker.Item label="In-App Notification" value="app_notification" />
                <Picker.Item label="Email" value="email" />
              </Picker>
            </View>
            <GradientButton onPress={handleAddReminder} disabled={loading}>
              <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
                <ButtonText style={{ color: COLORS.deepCoffee }}>Add Reminder</ButtonText>
              </GradientButtonBackground>
            </GradientButton>
          </View>
          {/* End Reminders Section */}

          <GradientButton onPress={handleSubmit} disabled={loading} style={{ marginTop: 20 }}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? <LoadingIndicator size="small" color="#fff" /> : <ButtonText>{isEditing ? 'Update Event' : 'Create Event'}</ButtonText>}
            </GradientButtonBackground>
          </GradientButton>

          {/* iOS Date/Time Picker Modal for Event Start/End */}
          {Platform.OS === 'ios' && showDatePickerFor && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={!!showDatePickerFor}
              onRequestClose={handleCancelDateTime}
            >
              <ModalBackground onPress={handleCancelDateTime}>
                <ModalContent>
                  <DateTimePicker
                    value={pickerValue}
                    mode={pickerMode}
                    display="spinner"
                    onChange={onDateTimeChange}
                    minimumDate={new Date()}
                  />
                  <ModalButtonRow>
                    <GradientButton onPress={handleCancelDateTime} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground colors={['#ccc', '#bbb']}>
                        <ButtonText>Cancel</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                    <GradientButton onPress={handleConfirmDateTime} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground>
                        <ButtonText>Confirm</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                  </ModalButtonRow>
                </ModalContent>
              </ModalBackground>
            </Modal>
          )}

          {/* Android Date/Time Picker for Event Start/End */}
          {Platform.OS === 'android' && showDatePickerFor && (
            <DateTimePicker
              value={pickerValue}
              mode={pickerMode}
              display="default"
              onChange={onDateTimeChange}
              minimumDate={new Date()}
            />
          )}

          {/* iOS Reminder Date/Time Picker Modal */}
          {Platform.OS === 'ios' && showReminderPicker && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showReminderPicker}
              onRequestClose={() => setShowReminderPicker(false)}
            >
              <ModalBackground onPress={() => setShowReminderPicker(false)}>
                <ModalContent>
                  <DateTimePicker
                    value={newReminderTime}
                    mode="datetime"
                    display="spinner"
                    onChange={onNewReminderDateTimeChange}
                    minimumDate={new Date()}
                  />
                  <ModalButtonRow>
                    <GradientButton onPress={() => setShowReminderPicker(false)} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground colors={['#ccc', '#bbb']}>
                        <ButtonText>Cancel</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                    <GradientButton onPress={() => setShowReminderPicker(false)} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground>
                        <ButtonText>Confirm</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                  </ModalButtonRow>
                </ModalContent>
              </ModalBackground>
            </Modal>
          )}

          {/* Android Reminder Date/Time Picker */}
          {Platform.OS === 'android' && showReminderPicker && (
            <DateTimePicker
              value={newReminderTime}
              mode="datetime"
              display="default"
              onChange={onNewReminderDateTimeChange}
              minimumDate={new Date()}
            />
          )}

        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default EventFormScreen;