import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, Switch, TextInput } from 'react-native';
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
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../../constants';

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
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartTime(selectedDate);
      // Auto-adjust end time if it's before start time
      if (isBefore(endTime, selectedDate)) {
        setEndTime(new Date(selectedDate.getTime() + 3600000));
      }
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTime(selectedTime);
      // Auto-adjust end time if it's before start time
      if (isBefore(endTime, selectedTime)) {
        setEndTime(new Date(selectedTime.getTime() + 3600000));
      }
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEndTime(selectedTime);
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
      
      // Show time picker after date on Android
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
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee, marginBottom: 20 }}>
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
          />

          {/* Category */}
          <Label>Category *</Label>
          <View style={{ 
            borderColor: getCategoryColor(category), 
            borderWidth: 2, 
            borderRadius: 12, 
            marginBottom: 15, 
            backgroundColor: COLORS.white,
            overflow: 'hidden'
          }}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          {/* Start Date & Time */}
          <View style={{ 
            backgroundColor: COLORS.softCream, 
            padding: 15, 
            borderRadius: 12, 
            marginBottom: 15 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="calendar-start" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>Start Time *</Label>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: COLORS.lightCocoa,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: COLORS.white,
                }}
                onPress={() => setShowStartDatePicker(true)}
                disabled={loading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                  <TextInput
                    editable={false}
                    value={format(startTime, 'MMM dd, yyyy')}
                    style={{ color: COLORS.deepCoffee }}
                  />
                </View>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderColor: COLORS.lightCocoa,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: COLORS.white,
                  }}
                  onPress={() => setShowStartTimePicker(true)}
                  disabled={loading}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                    <TextInput
                      editable={false}
                      value={format(startTime, 'h:mm a')}
                      style={{ color: COLORS.deepCoffee }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* End Date & Time */}
          <View style={{ 
            backgroundColor: COLORS.softCream, 
            padding: 15, 
            borderRadius: 12, 
            marginBottom: 15 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="calendar-end" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>End Time *</Label>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: COLORS.lightCocoa,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: COLORS.white,
                }}
                onPress={() => setShowEndDatePicker(true)}
                disabled={loading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                  <TextInput
                    editable={false}
                    value={format(endTime, 'MMM dd, yyyy')}
                    style={{ color: COLORS.deepCoffee }}
                  />
                </View>
              </TouchableOpacity>

              {!allDay && (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderColor: COLORS.lightCocoa,
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 12,
                    backgroundColor: COLORS.white,
                  }}
                  onPress={() => setShowEndTimePicker(true)}
                  disabled={loading}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                    <TextInput
                      editable={false}
                      value={format(endTime, 'h:mm a')}
                      style={{ color: COLORS.deepCoffee }}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* All Day Toggle */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            backgroundColor: COLORS.softCream,
            padding: 15,
            borderRadius: 12,
            marginBottom: 15
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="clock-time-eight" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>All Day Event</Label>
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
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            borderColor: COLORS.lightCocoa,
            borderWidth: 1,
            borderRadius: 12,
            marginBottom: 15,
            backgroundColor: COLORS.white,
            paddingHorizontal: 12
          }}>
            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.lightCocoa} />
            <Input
              placeholder="Add location (optional)"
              value={location}
              onChangeText={setLocation}
              editable={!loading}
              style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
            />
          </View>

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="Add event description (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />

          {/* Attendees */}
          <Label>Attendees</Label>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            borderColor: COLORS.lightCocoa,
            borderWidth: 1,
            borderRadius: 12,
            marginBottom: 15,
            backgroundColor: COLORS.white,
            paddingHorizontal: 12
          }}>
            <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.lightCocoa} />
            <Input
              placeholder="email1@example.com, email2@example.com"
              value={attendees}
              onChangeText={setAttendees}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
            />
          </View>

          {/* Reminders Section */}
          <View style={{ 
            width: '100%', 
            marginTop: 10,
            padding: 15, 
            backgroundColor: COLORS.softCream, 
            borderRadius: 12,
            marginBottom: 20 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="bell-ring" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>Reminders</Label>
            </View>
            
            {reminders.length > 0 ? (
              reminders.map((reminder, index) => (
                <View
                  key={index}
                  style={{
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
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.deepCoffee} />
                      <BadgeText style={{ marginLeft: 6, fontWeight: 'bold' }}>
                        {format(reminder.time, 'MMM d, yyyy')}
                      </BadgeText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <BadgeText style={{ color: COLORS.lightCocoa }}>
                        {format(reminder.time, 'h:mm a')} • {reminder.method.replace('_', ' ')}
                      </BadgeText>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleRemoveReminder(index)} 
                    disabled={loading}
                    style={{ padding: 4 }}
                  >
                    <MaterialCommunityIcons name="delete" size={22} color={COLORS.errorRed} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <BadgeText style={{ color: COLORS.lightCocoa, textAlign: 'center', padding: 10 }}>
                No reminders set
              </BadgeText>
            )}

            <Label style={{ marginTop: 15, marginBottom: 8 }}>Add New Reminder</Label>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: COLORS.lightCocoa,
                borderWidth: 1,
                borderRadius: 10,
                marginBottom: 10,
                padding: 12,
                backgroundColor: COLORS.white,
              }}
              onPress={() => setShowReminderDatePicker(true)}
              disabled={loading}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.deepCoffee} style={{ marginRight: 10 }} />
                <View>
                  <BadgeText style={{ fontWeight: 'bold' }}>
                    {format(newReminderDate, 'MMM dd, yyyy')}
                  </BadgeText>
                  <BadgeText style={{ color: COLORS.lightCocoa }}>
                    {format(newReminderDate, 'h:mm a')}
                  </BadgeText>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.lightCocoa} />
            </TouchableOpacity>

            <View style={{ 
              borderColor: COLORS.lightCocoa, 
              borderWidth: 1, 
              borderRadius: 10, 
              marginBottom: 12, 
              backgroundColor: COLORS.white,
              overflow: 'hidden'
            }}>
              <Picker 
                selectedValue={newReminderMethod} 
                onValueChange={setNewReminderMethod} 
                style={{ color: COLORS.deepCoffee }} 
                enabled={!loading}
              >
                <Picker.Item label="🔔 In-App Notification" value="app_notification" />
                <Picker.Item label="📧 Email" value="email" />
              </Picker>
            </View>

            <GradientButton onPress={handleAddReminder} disabled={loading}>
              <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="plus-circle" size={18} color={COLORS.deepCoffee} style={{ marginRight: 6 }} />
                  <ButtonText style={{ color: COLORS.deepCoffee }}>Add Reminder</ButtonText>
                </View>
              </GradientButtonBackground>
            </GradientButton>
          </View>

          {/* Submit Button */}
          <GradientButton onPress={handleSubmit} disabled={loading} style={{ marginBottom: 30 }}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "calendar-plus"} 
                    size={20} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                  />
                  <ButtonText>{isEditing ? 'Update Event' : 'Create Event'}</ButtonText>
                </View>
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

export default EventFormScreen;