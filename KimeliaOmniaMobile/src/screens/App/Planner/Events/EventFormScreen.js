
import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, Switch, TextInput, StyleSheet } from 'react-native'; // Import StyleSheet
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
  BadgeText,
  Row,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants'; // Import FONTS

const EVENT_CATEGORIES = [
  { value: 'meeting', label: '💼 Meeting' },
  { value: 'appointment', label: '📅 Appointment' },
  { value: 'personal', label: '👤 Personal' },
  { value: 'work', label: '🏢 Work' },
  { value: 'study', label: '📚 Study' },
  { value: 'reminder', label: '⏰ Reminder' },
  { value: 'other', label: '📌 Other' }
];

const EventFormScreen = ({ route, navigation }) => {
  const { eventId, eventToEdit } = route.params || {};
  const isEditing = !!eventId;

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [startTime, setStartTime] = useState(eventToEdit?.startTime ? new Date(eventToEdit.startTime) : new Date());
  const [endTime, setEndTime] = useState(eventToEdit?.endTime ? new Date(eventToEdit.endTime) : new Date(Date.now() + 3600000));
  const [allDay, setAllDay] = useState(eventToEdit?.allDay || false);
  const [category, setCategory] = useState(eventToEdit?.category || 'meeting');
  const [attendees, setAttendees] = useState(eventToEdit?.attendees ? eventToEdit.attendees.join(', ') : '');

  const [reminders, setReminders] = useState(
    eventToEdit?.reminders?.map(r => ({ ...r, time: new Date(r.time) })) || []
  );
  const [newReminderDate, setNewReminderDate] = useState(new Date());
  const [newReminderMethod, setNewReminderMethod] = useState('app_notification');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Event' : 'Create New Event',
    });
  }, [isEditing, navigation]);

  // Date/Time change handlers
  const handleStartDateChange = (event, selectedDate) => {
    const currentMode = showStartDatePicker ? 'date' : 'time';

    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
      if (currentMode === 'date' && selectedDate && !allDay) {
        setShowStartTimePicker(true);
      }
    } else {
      setShowStartDatePicker(currentMode === 'date');
    }

    if (event?.type === 'set' && selectedDate) {
      const newDate = new Date(startTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartTime(newDate);
      if (isBefore(endTime, newDate)) {
        setEndTime(new Date(newDate.getTime() + 3600000));
      }
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    } else {
      setShowStartTimePicker(Platform.OS === 'ios');
    }
    if (event?.type === 'set' && selectedTime) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      setStartTime(newTime);
      if (isBefore(endTime, newTime)) {
        setEndTime(new Date(newTime.getTime() + 3600000));
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentMode = showEndDatePicker ? 'date' : 'time';

    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
      if (currentMode === 'date' && selectedDate && !allDay) {
        setShowEndTimePicker(true);
      }
    } else {
      setShowEndDatePicker(currentMode === 'date');
    }

    if (event?.type === 'set' && selectedDate) {
      const newDate = new Date(endTime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEndTime(newDate);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    } else {
      setShowEndTimePicker(Platform.OS === 'ios');
    }
    if (event?.type === 'set' && selectedTime) {
      const newTime = new Date(endTime);
      newTime.setHours(selectedTime.getHours());
      newTime.setMinutes(selectedTime.getMinutes());
      setEndTime(newTime);
    }
  };

  const handleReminderDateChange = (event, selectedDate) => {
    const currentMode = showReminderDatePicker ? 'date' : 'time';
    
    if (Platform.OS === 'android') {
      setShowReminderDatePicker(false);
      setShowReminderTimePicker(false);
    } else {
      setShowReminderDatePicker(Platform.OS === 'ios');
    }
    
    if (event?.type === 'set' && selectedDate) {
      const newDate = new Date(newReminderDate);
      if (currentMode === 'date') {
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
      }
      setNewReminderDate(newDate);
      
      if (Platform.OS === 'android' && currentMode === 'date') {
        setTimeout(() => setShowReminderTimePicker(true), 300);
      }
    }
  };

  const handleReminderTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowReminderTimePicker(false);
    } else {
      setShowReminderTimePicker(Platform.OS === 'ios');
    }
    
    if (event?.type === 'set' && selectedTime) {
      const newDate = new Date(newReminderDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setNewReminderDate(newDate);
    }
  };

  // Reminder management
  const handleAddReminder = () => {
    if (!newReminderDate || !isValid(newReminderDate)) {
      Alert.alert('Error', 'Please set a valid time for the reminder.');
      return;
    }
    setReminders([...reminders, { time: newReminderDate, method: newReminderMethod }]);
    setNewReminderDate(new Date());
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
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
      const displayError = backendMessage || 'Failed to save event. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (categoryValue) => {
    const colors = {
      meeting: '#3B82F6',
      appointment: '#10B981',
      personal: '#8B5CF6',
      work: '#F59E0B',
      study: '#EC4899',
      reminder: '#EF4444',
      other: '#6B7280'
    };
    return colors[categoryValue] || COLORS.deepCoffee;
  };

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.formTitle}>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          {/* Title */}
          <Label>Title *</Label>
          <Input
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            style={styles.inputField}
          />

          {/* Category */}
          <Label>Category *</Label>
          <View style={[styles.pickerWrapper, { borderColor: getCategoryColor(category) }]}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          {/* Start Date & Time */}
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeHeader}>
              <MaterialCommunityIcons name="calendar-start" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.dateTimeLabel}>Start Time *</Label>
            </View>
            
            <Row style={styles.dateTimePickerRow}>
              <TouchableOpacity
                style={styles.dateTimePickerButton}
                onPress={() => setShowStartDatePicker(true)}
                disabled={loading}
              >
                <View style={styles.dateTimePickerContent}>
                  <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                  <TextInput
                    editable={false}
                    value={format(startTime, 'MMM dd, yyyy')}
                    style={styles.dateTimeText}
                  />
                </View>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={styles.dateTimePickerButton}
                  onPress={() => setShowStartTimePicker(true)}
                  disabled={loading}
                >
                  <View style={styles.dateTimePickerContent}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                    <TextInput
                      editable={false}
                      value={format(startTime, 'h:mm a')}
                      style={styles.dateTimeText}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </Row>
          </View>

          {/* End Date & Time */}
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeHeader}>
              <MaterialCommunityIcons name="calendar-end" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.dateTimeLabel}>End Time *</Label>
            </View>
            
            <Row style={styles.dateTimePickerRow}>
              <TouchableOpacity
                style={styles.dateTimePickerButton}
                onPress={() => setShowEndDatePicker(true)}
                disabled={loading}
              >
                <View style={styles.dateTimePickerContent}>
                  <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                  <TextInput
                    editable={false}
                    value={format(endTime, 'MMM dd, yyyy')}
                    style={styles.dateTimeText}
                  />
                </View>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={styles.dateTimePickerButton}
                  onPress={() => setShowEndTimePicker(true)}
                  disabled={loading}
                >
                  <View style={styles.dateTimePickerContent}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                    <TextInput
                      editable={false}
                      value={format(endTime, 'h:mm a')}
                      style={styles.dateTimeText}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </Row>
          </View>

          {/* All Day Toggle */}
          <View style={styles.allDayToggleContainer}>
            <View style={styles.allDayToggleHeader}>
              <MaterialCommunityIcons name="clock-time-eight" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.allDayToggleLabel}>All Day Event</Label>
            </View>
            <Switch
              onValueChange={setAllDay}
              value={allDay}
              disabled={loading}
              trackColor={{ false: COLORS.tan, true: COLORS.chocolateBrown }}
              thumbColor={allDay ? COLORS.gold : COLORS.lightCocoa}
            />
          </View>

          {/* Location */}
          <Label>Location</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="Add location (optional)"
              value={location}
              onChangeText={setLocation}
              editable={!loading}
              style={styles.inputNoBorder}
            />
          </View>

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="Add event description (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            style={styles.textAreaField}
          />

          {/* Attendees */}
          <Label>Attendees</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="email1@example.com, email2@example.com"
              value={attendees}
              onChangeText={setAttendees}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputNoBorder}
            />
          </View>

          {/* Reminders Section */}
          <View style={styles.remindersSection}>
            <Row style={styles.remindersHeader}>
              <MaterialCommunityIcons name="bell-ring" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.remindersSectionLabel}>Reminders</Label>
            </Row>
            
            {reminders.length > 0 ? (
              reminders.map((reminder, index) => (
                <View
                  key={index}
                  style={styles.reminderItem}
                >
                  <View style={styles.reminderContent}>
                    <Row style={styles.reminderTextRow}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.deepCoffee} style={styles.icon} />
                      <BadgeText style={styles.reminderDateText}>
                        {format(new Date(reminder.time), 'MMM d, yyyy')}
                      </BadgeText>
                    </Row>
                    <BadgeText style={styles.reminderTimeMethodText}>
                      {format(new Date(reminder.time), 'h:mm a')} • {reminder.method.replace('_', ' ')}
                    </BadgeText>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleRemoveReminder(index)} 
                    disabled={loading}
                    style={styles.removeReminderButton}
                  >
                    <MaterialCommunityIcons name="delete" size={22} color={COLORS.errorRed} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <BadgeText style={styles.noRemindersText}>
                No reminders set
              </BadgeText>
            )}

            <Label style={styles.addReminderLabel}>Add New Reminder</Label>
            
            <TouchableOpacity
              style={styles.newReminderDatePickerButton}
              onPress={() => setShowReminderDatePicker(true)}
              disabled={loading}
            >
              <View style={styles.newReminderDatePickerContent}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <View>
                  <BadgeText style={styles.reminderDateText}>
                    {format(newReminderDate, 'MMM dd, yyyy')}
                  </BadgeText>
                  <BadgeText style={styles.reminderTimeMethodText}>
                    {format(newReminderDate, 'h:mm a')}
                  </BadgeText>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.lightCocoa} />
            </TouchableOpacity>

            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={newReminderMethod} 
                onValueChange={setNewReminderMethod} 
                style={styles.picker} 
                enabled={!loading}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="🔔 In-App Notification" value="app_notification" />
                <Picker.Item label="📧 Email" value="email" />
              </Picker>
            </View>

            <GradientButton onPress={handleAddReminder} disabled={loading} style={styles.addReminderButton}>
              <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="plus-circle" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                  <ButtonText style={styles.addReminderButtonText}>Add Reminder</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>
          </View>

          {/* Submit Button */}
          <GradientButton onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "calendar-plus"} 
                    size={20} 
                    color="#fff" 
                    style={styles.icon} 
                  />
                  <ButtonText>{isEditing ? 'Update Event' : 'Create Event'}</ButtonText>
                </Row>
              )}
            </GradientButtonBackground>
          </GradientButton>

          {/* Date/Time Pickers */}
          {showStartDatePicker && (
            <DateTimePicker
              value={startTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}

          {showStartTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartTimeChange}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startTime}
            />
          )}

          {showEndTimePicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndTimeChange}
            />
          )}

          {showReminderDatePicker && (
            <DateTimePicker
              value={newReminderDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleReminderDateChange}
              minimumDate={new Date()}
            />
          )}

          {showReminderTimePicker && (
            <DateTimePicker
              value={newReminderDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleReminderTimeChange}
            />
          )}
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
  formTitle: {
    fontSize: 26,
    marginBottom: 25,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
  },
  inputField: {
    marginBottom: 15,
  },
  textAreaField: {
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    height: 55,
    justifyContent: 'center',
    marginBottom: 15,
  },
  picker: {
    color: COLORS.deepCoffee,
    height: 55,
  },
  pickerItem: {
    height: 55,
  },
  dateTimeSection: {
    backgroundColor: COLORS.softCream,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  dateTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeLabel: {
    marginLeft: 8,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 16,
    color: COLORS.deepCoffee,
  },
  dateTimePickerRow: {
    justifyContent: 'space-between',
    gap: 10,
  },
  dateTimePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.lightCocoa,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.white,
    height: 50,
  },
  dateTimePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeText: {
    color: COLORS.deepCoffee,
    flex: 1,
    paddingVertical: 0,
    fontFamily: FONTS.secondary,
    fontSize: 14,
  },
  allDayToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.softCream,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  allDayToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allDayToggleLabel: {
    marginLeft: 8,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 16,
    color: COLORS.deepCoffee,
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.lightCocoa,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 50,
  },
  inputNoBorder: {
    flex: 1,
    marginBottom: 0,
    borderWidth: 0,
    height: '100%',
    paddingVertical: 0,
  },
  icon: {
    marginRight: 8,
  },
  remindersSection: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.softCream,
    borderRadius: 12,
    marginBottom: 20,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  remindersSectionLabel: {
    marginLeft: 8,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 16,
    color: COLORS.deepCoffee,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  reminderDateText: {
    fontWeight: 'bold',
    fontFamily: FONTS.secondary,
    color: COLORS.deepCoffee,
  },
  reminderTimeMethodText: {
    color: COLORS.lightCocoa,
    fontFamily: FONTS.secondary,
    fontSize: 12,
  },
  removeReminderButton: {
    padding: 4,
  },
  noRemindersText: {
    color: COLORS.lightCocoa,
    textAlign: 'center',
    padding: 10,
    fontFamily: FONTS.secondary,
  },
  addReminderLabel: {
    marginTop: 15,
    marginBottom: 8,
    fontSize: 14,
    color: COLORS.chocolateBrown,
  },
  newReminderDatePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.lightCocoa,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 12,
    backgroundColor: COLORS.white,
    height: 50,
  },
  newReminderDatePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReminderButton: {
    marginTop: 5,
  },
  addReminderButtonText: {
    color: COLORS.deepCoffee,
    fontSize: 16,
  },
  submitButton: {
    marginBottom: 30,
    marginTop: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default EventFormScreen;