import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, TextInput } from 'react-native';
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
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';

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
      setShowScheduledTimePicker(false);
    } else {
      setShowScheduledDatePicker(Platform.OS === 'ios');
    }
    
    if (event?.type === 'set' && selectedDate) {
      const newDate = scheduledSendTime ? new Date(scheduledSendTime) : new Date();
      if (currentMode === 'date') {
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
      }
      setScheduledSendTime(newDate);
      
      // Show time picker after date on Android
      if (Platform.OS === 'android' && currentMode === 'date') {
        setTimeout(() => setShowScheduledTimePicker(true), 300);
      }
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
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee, marginBottom: 20 }}>
            {isEditing ? 'Edit Message' : 'Create New Message'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          {/* Type and Status Row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Label>Type *</Label>
              <View style={{ 
                borderColor: getTypeColor(type), 
                borderWidth: 2, 
                borderRadius: 12, 
                backgroundColor: COLORS.white,
                overflow: 'hidden'
              }}>
                <Picker
                  selectedValue={type}
                  onValueChange={setType}
                  style={{ color: COLORS.deepCoffee }}
                  enabled={!loading}
                >
                  {MESSAGE_TYPES.map((msgType) => (
                    <Picker.Item key={msgType.value} label={msgType.label} value={msgType.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Label>Status *</Label>
              <View style={{ 
                borderColor: getStatusColor(status), 
                borderWidth: 2, 
                borderRadius: 12, 
                backgroundColor: COLORS.white,
                overflow: 'hidden'
              }}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={{ color: COLORS.deepCoffee }}
                  enabled={!loading}
                >
                  {MESSAGE_STATUSES.map((msgStatus) => (
                    <Picker.Item key={msgStatus.value} label={msgStatus.label} value={msgStatus.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Subject */}
          <Label>Subject</Label>
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
            <MaterialCommunityIcons name="text-subject" size={20} color={COLORS.lightCocoa} />
            <Input
              placeholder="Message subject (optional)"
              value={subject}
              onChangeText={setSubject}
              editable={!loading}
              style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
            />
          </View>

          {/* Content */}
          <Label>Content *</Label>
          <TextArea
            placeholder="Enter message content"
            value={content}
            onChangeText={setContent}
            editable={!loading}
          />

          {/* Source */}
          <Label>Source *</Label>
          <View style={{ 
            borderColor: COLORS.lightCocoa, 
            borderWidth: 1, 
            borderRadius: 12, 
            marginBottom: 15, 
            backgroundColor: COLORS.white,
            overflow: 'hidden'
          }}>
            <Picker
              selectedValue={source}
              onValueChange={setSource}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              {MESSAGE_SOURCES.map((msgSource) => (
                <Picker.Item key={msgSource.value} label={msgSource.label} value={msgSource.value} />
              ))}
            </Picker>
          </View>

          {/* External Reference ID */}
          <Label>External Reference ID</Label>
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
            <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.lightCocoa} />
            <Input
              placeholder="e.g., Gmail ID, Slack message ID"
              value={externalReferenceId}
              onChangeText={setExternalReferenceId}
              editable={!loading}
              style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
            />
          </View>

          {/* Tags */}
          <Label>Tags</Label>
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
            <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.lightCocoa} />
            <Input
              placeholder="e.g., work, urgent, client"
              value={tags}
              onChangeText={setTags}
              editable={!loading}
              style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
            />
          </View>

          {/* Scheduled Send Time */}
          <View style={{ 
            backgroundColor: COLORS.softCream, 
            padding: 15, 
            borderRadius: 12, 
            marginBottom: 15 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="clock-time-four-outline" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>Scheduled Send Time</Label>
            </View>

            {scheduledSendTime ? (
              <View>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
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
                    onPress={() => setShowScheduledDatePicker(true)}
                    disabled={loading}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <MaterialCommunityIcons name="calendar" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                      <TextInput
                        editable={false}
                        value={format(scheduledSendTime, 'MMM dd, yyyy')}
                        style={{ color: COLORS.deepCoffee }}
                      />
                    </View>
                  </TouchableOpacity>

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
                    onPress={() => setShowScheduledTimePicker(true)}
                    disabled={loading}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.deepCoffee} style={{ marginRight: 8 }} />
                      <TextInput
                        editable={false}
                        value={format(scheduledSendTime, 'h:mm a')}
                        style={{ color: COLORS.deepCoffee }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={clearScheduledSendTime}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                    backgroundColor: COLORS.white,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: COLORS.errorRed,
                  }}
                >
                  <MaterialCommunityIcons name="close-circle" size={18} color={COLORS.errorRed} style={{ marginRight: 6 }} />
                  <BadgeText style={{ color: COLORS.errorRed }}>Clear Scheduled Time</BadgeText>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: COLORS.lightCocoa,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderRadius: 10,
                  padding: 16,
                  backgroundColor: COLORS.white,
                }}
                onPress={() => setShowScheduledDatePicker(true)}
                disabled={loading}
              >
                <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.lightCocoa} style={{ marginRight: 10 }} />
                <BadgeText style={{ color: COLORS.lightCocoa }}>Set Scheduled Send Time</BadgeText>
              </TouchableOpacity>
            )}
          </View>

          {/* Related IDs Section - Optional for future */}
          <View style={{ 
            backgroundColor: COLORS.softCream, 
            padding: 15, 
            borderRadius: 12, 
            marginBottom: 20 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.deepCoffee} />
              <Label style={{ marginLeft: 8, marginBottom: 0 }}>Related Items (Optional)</Label>
            </View>

            <Label style={{ fontSize: 12, marginBottom: 5 }}>Related Task ID</Label>
            <Input
              placeholder="Enter task ID"
              value={relatedTaskId}
              onChangeText={setRelatedTaskId}
              editable={!loading}
              style={{ marginBottom: 10 }}
            />

            <Label style={{ fontSize: 12, marginBottom: 5 }}>Related Event ID</Label>
            <Input
              placeholder="Enter event ID"
              value={relatedEventId}
              onChangeText={setRelatedEventId}
              editable={!loading}
            />
          </View>

          {/* Submit Button */}
          <GradientButton onPress={handleSubmit} disabled={loading} style={{ marginBottom: 30 }}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons 
                    name={isEditing ? "content-save" : "message-plus"} 
                    size={20} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                  />
                  <ButtonText>{isEditing ? 'Update Message' : 'Create Message'}</ButtonText>
                </View>
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

export default MessageFormScreen;