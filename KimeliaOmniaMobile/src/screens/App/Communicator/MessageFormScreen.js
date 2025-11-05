
import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, TextInput, StyleSheet } from 'react-native'; // Import StyleSheet
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
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../constants'; // Import FONTS

const MESSAGE_TYPES = [
  { value: 'email_summary', label: '📧 Email Summary', icon: 'email-outline' },
  { value: 'draft', label: '📝 Draft', icon: 'file-document-edit-outline' },
  { value: 'note', label: '📋 Note', icon: 'note-text' },
  { value: 'reminder', label: '⏰ Reminder', icon: 'bell-ring' },
  { value: 'communication_log', label: '💬 Communication Log', icon: 'message-text' }
];

const MESSAGE_SOURCES = [
  { value: 'manual', label: '✍️ Manual' },
  { value: 'AI_generated', label: '🤖 AI Generated' },
  { value: 'gmail', label: '📧 Gmail' },
  { value: 'slack', label: '💬 Slack' },
  { value: 'other', label: '📌 Other' }
];

const MESSAGE_STATUSES = [
  { value: 'unread', label: '📩 Unread', color: '#F59E0B' },
  { value: 'read', label: '✅ Read', color: '#10B981' },
  { value: 'archived', label: '📦 Archived', color: '#6B7280' },
  { value: 'deleted', label: '🗑️ Deleted', color: '#DC2626' },
  { value: 'pending_send', label: '⏳ Pending Send', color: '#3B82F6' },
  { value: 'sent', label: '✈️ Sent', color: '#8B5CF6' }
];

const MessageFormScreen = ({ route, navigation }) => {
  const { messageId, messageToEdit } = route.params || {};
  const isEditing = !!messageId;

  const [type, setType] = useState(messageToEdit?.type || 'note');
  const [subject, setSubject] = useState(messageToEdit?.subject || '');
  const [content, setContent] = useState(messageToEdit?.content || '');
  const [source, setSource] = useState(messageToEdit?.source || 'manual');
  const [externalReferenceId, setExternalReferenceId] = useState(messageToEdit?.externalReferenceId || '');
  const [tags, setTags] = useState(messageToEdit?.tags ? messageToEdit.tags.join(', ') : '');
  const [status, setStatus] = useState(messageToEdit?.status || 'unread');
  const [scheduledSendTime, setScheduledSendTime] = useState(messageToEdit?.scheduledSendTime ? new Date(messageToEdit.scheduledSendTime) : null);
  const [relatedTaskId, setRelatedTaskId] = useState(messageToEdit?.relatedTask || '');
  const [relatedEventId, setRelatedEventId] = useState(messageToEdit?.relatedEvent || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showScheduledDatePicker, setShowScheduledDatePicker] = useState(false);
  const [showScheduledTimePicker, setShowScheduledTimePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Message' : 'Create New Message',
    });
  }, [isEditing, navigation]);

  const handleScheduledDateChange = (event, selectedDate) => {
    const currentMode = showScheduledDatePicker ? 'date' : 'time';
    
    if (Platform.OS === 'android') {
      setShowScheduledDatePicker(false);
      if (currentMode === 'date' && selectedDate) {
        setShowScheduledTimePicker(true);
      }
    } else {
      setShowScheduledDatePicker(currentMode === 'date');
    }
    
    if (event?.type === 'set' && selectedDate) {
      const newDate = scheduledSendTime ? new Date(scheduledSendTime) : new Date();
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setScheduledSendTime(newDate);
    }
  };

  const handleScheduledTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowScheduledTimePicker(false);
    } else {
      setShowScheduledTimePicker(Platform.OS === 'ios');
    }
    
    if (event?.type === 'set' && selectedTime) {
      const newDate = scheduledSendTime ? new Date(scheduledSendTime) : new Date();
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setScheduledSendTime(newDate);
    }
  };

  const clearScheduledSendTime = () => {
    setScheduledSendTime(null);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!type || !content) {
      setError('Message type and content are required.');
      return;
    }
    if (scheduledSendTime && (!isValid(scheduledSendTime) || isBefore(scheduledSendTime, new Date()))) {
      setError('Scheduled send time must be a valid future date/time.');
      return;
    }

    setLoading(true);
    try {
      const messageData = {
        type,
        subject: subject || undefined,
        content,
        source,
        externalReferenceId: externalReferenceId || undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        status,
        scheduledSendTime: scheduledSendTime ? scheduledSendTime.toISOString() : undefined,
        relatedTask: relatedTaskId || undefined,
        relatedEvent: relatedEventId || undefined,
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/messages/${messageId}`, messageData);
      } else {
        response = await apiClient.post('/messages', messageData);
      }

      Alert.alert('Success', `Message ${isEditing ? 'updated' : 'created'} successfully!`);
      navigation.goBack();
    } catch (e) {
      console.error("Message form error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      const displayError = backendMessage || 'Failed to save message. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (typeValue) => {
    const colors = {
      email_summary: '#3B82F6',
      draft: '#8B5CF6',
      note: '#10B981',
      reminder: '#F59E0B',
      communication_log: '#EC4899'
    };
    return colors[typeValue] || COLORS.deepCoffee;
  };

  const getStatusColor = (statusValue) => {
    const statusObj = MESSAGE_STATUSES.find(s => s.value === statusValue);
    return statusObj?.color || COLORS.deepCoffee;
  };

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.formTitle}>
            {isEditing ? 'Edit Message' : 'Create New Message'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          {/* Type and Status Row */}
          <Row style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Label>Type *</Label>
              <View style={[styles.pickerWrapper, { borderColor: getTypeColor(type) }]}>
                <Picker
                  selectedValue={type}
                  onValueChange={setType}
                  style={styles.picker}
                  enabled={!loading}
                  itemStyle={styles.pickerItem}
                >
                  {MESSAGE_TYPES.map((msgType) => (
                    <Picker.Item key={msgType.value} label={msgType.label} value={msgType.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Label>Status *</Label>
              <View style={[styles.pickerWrapper, { borderColor: getStatusColor(status) }]}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}
                  enabled={!loading}
                  itemStyle={styles.pickerItem}
                >
                  {MESSAGE_STATUSES.map((msgStatus) => (
                    <Picker.Item key={msgStatus.value} label={msgStatus.label} value={msgStatus.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </Row>

          {/* Subject */}
          <Label>Subject</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="text-subject" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="Message subject (optional)"
              value={subject}
              onChangeText={setSubject}
              editable={!loading}
              style={styles.inputNoBorder}
            />
          </View>

          {/* Content */}
          <Label>Content *</Label>
          <TextArea
            placeholder="Enter message content"
            value={content}
            onChangeText={setContent}
            editable={!loading}
            style={styles.textAreaField}
          />

          {/* Source */}
          <Label>Source *</Label>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={source}
              onValueChange={setSource}
              style={styles.picker}
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              {MESSAGE_SOURCES.map((msgSource) => (
                <Picker.Item key={msgSource.value} label={msgSource.label} value={msgSource.value} />
              ))}
            </Picker>
          </View>

          {/* External Reference ID */}
          <Label>External Reference ID</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="e.g., Gmail ID, Slack message ID"
              value={externalReferenceId}
              onChangeText={setExternalReferenceId}
              editable={!loading}
              style={styles.inputNoBorder}
            />
          </View>

          {/* Tags */}
          <Label>Tags</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="e.g., work, urgent, client"
              value={tags}
              onChangeText={setTags}
              editable={!loading}
              style={styles.inputNoBorder}
            />
          </View>

          {/* Scheduled Send Time */}
          <View style={styles.scheduledTimeSection}>
            <View style={styles.scheduledTimeHeader}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.scheduledTimeLabel}>Scheduled Send Time</Label>
            </View>

            {scheduledSendTime ? (
              <View>
                <Row style={styles.scheduledTimePickerRow}>
                  <TouchableOpacity
                    style={styles.scheduledTimePickerButton}
                    onPress={() => setShowScheduledDatePicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.scheduledTimePickerContent}>
                      <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                      <TextInput
                        editable={false}
                        value={format(scheduledSendTime, 'MMM dd, yyyy')}
                        style={styles.scheduledTimeText}
                      />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.scheduledTimePickerButton}
                    onPress={() => setShowScheduledTimePicker(true)}
                    disabled={loading}
                  >
                    <View style={styles.scheduledTimePickerContent}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={styles.icon} />
                      <TextInput
                        editable={false}
                        value={format(scheduledSendTime, 'h:mm a')}
                        style={styles.scheduledTimeText}
                      />
                    </View>
                  </TouchableOpacity>
                </Row>

                <TouchableOpacity 
                  onPress={clearScheduledSendTime}
                  style={styles.clearScheduledTimeButton}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.errorRed} style={styles.icon} />
                  <BadgeText style={styles.clearScheduledTimeText}>Clear Scheduled Time</BadgeText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.setScheduledTimeButton}
                onPress={() => setShowScheduledDatePicker(true)}
                disabled={loading}
              >
                <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.lightCocoa} style={styles.icon} />
                <BadgeText style={styles.setScheduledTimeText}>Set Scheduled Send Time</BadgeText>
              </TouchableOpacity>
            )}
          </View>

          {/* Related IDs Section - Optional for future */}
          <View style={styles.relatedItemsSection}>
            <View style={styles.relatedItemsHeader}>
              <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.relatedItemsLabel}>Related Items (Optional)</Label>
            </View>

            <Label style={styles.smallLabel}>Related Task ID</Label>
            <Input
              placeholder="Enter task ID"
              value={relatedTaskId}
              onChangeText={setRelatedTaskId}
              editable={!loading}
              style={styles.inputField}
            />

            <Label style={styles.smallLabel}>Related Event ID</Label>
            <Input
              placeholder="Enter event ID"
              value={relatedEventId}
              onChangeText={setRelatedEventId}
              editable={!loading}
              style={styles.inputField}
            />
          </View>

          {/* Submit Button */}
          <GradientButton onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "message-plus"} 
                    size={20} 
                    color="#fff" 
                    style={styles.icon} 
                  />
                  <ButtonText>{isEditing ? 'Update Message' : 'Create Message'}</ButtonText>
                </Row>
              )}
            </GradientButtonBackground>
          </GradientButton>

          {/* Date/Time Pickers */}
          {showScheduledDatePicker && (
            <DateTimePicker
              value={scheduledSendTime || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleScheduledDateChange}
              minimumDate={new Date()}
            />
          )}

          {showScheduledTimePicker && (
            <DateTimePicker
              value={scheduledSendTime || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleScheduledTimeChange}
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
  pickerRow: {
    marginBottom: 15,
    justifyContent: 'space-between',
    gap: 10,
  },
  pickerContainer: {
    flex: 1,
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
  scheduledTimeSection: {
    backgroundColor: COLORS.softCream,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  scheduledTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduledTimeLabel: {
    marginLeft: 8,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 16,
    color: COLORS.deepCoffee,
  },
  scheduledTimePickerRow: {
    marginBottom: 10,
    justifyContent: 'space-between',
    gap: 10,
  },
  scheduledTimePickerButton: {
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
  scheduledTimePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scheduledTimeText: {
    color: COLORS.deepCoffee,
    flex: 1,
    paddingVertical: 0,
    fontFamily: FONTS.secondary,
    fontSize: 14,
  },
  clearScheduledTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.errorRed,
    height: 50,
  },
  clearScheduledTimeText: {
    color: COLORS.errorRed,
    fontFamily: FONTS.secondary,
  },
  setScheduledTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.lightCocoa,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 16,
    backgroundColor: COLORS.white,
    height: 60,
  },
  setScheduledTimeText: {
    color: COLORS.lightCocoa,
    fontFamily: FONTS.secondary,
    fontSize: 14,
  },
  relatedItemsSection: {
    backgroundColor: COLORS.softCream,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  relatedItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedItemsLabel: {
    marginLeft: 8,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 16,
    color: COLORS.deepCoffee,
  },
  smallLabel: {
    fontSize: 12,
    marginBottom: 5,
    marginTop: 10,
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

export default MessageFormScreen;
