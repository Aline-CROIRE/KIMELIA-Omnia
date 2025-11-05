import React, { useState, useEffect } from 'react';
import { Alert, View, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { format, isValid, parseISO } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  Row,
  Badge,
  BadgeText,
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';

const TaskFormScreen = ({ route, navigation }) => {
  const { taskId, taskToEdit } = route.params || {};
  const isEditing = !!taskId;

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? new Date(taskToEdit.dueDate) : null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [status, setStatus] = useState(taskToEdit?.status || 'pending');
  const [priority, setPriority] = useState(taskToEdit?.priority || 'medium');
  const [tags, setTags] = useState(taskToEdit?.tags ? taskToEdit.tags.join(', ') : '');
  const [selectedProjectId, setSelectedProjectId] = useState(taskToEdit?.project?._id || '');
  const [projects, setProjects] = useState([]);
  const [reminders, setReminders] = useState(taskToEdit?.reminders || []);
  const [newReminderDate, setNewReminderDate] = useState(new Date());
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [newReminderMethod, setNewReminderMethod] = useState('app_notification');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects');
        setProjects(response.data.data);
      } catch (e) {
        console.error("Failed to fetch projects:", e.response?.data || e.message);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Task' : 'Create New Task',
    });
  }, [isEditing, navigation]);

  const handleDueDateChange = (event, selectedDate) => {
    setShowDueDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleReminderDateChange = (event, selectedDate) => {
    setShowReminderDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setNewReminderDate(selectedDate);
      // Automatically show time picker after date is selected (Android)
      if (Platform.OS === 'android') {
        setShowReminderTimePicker(true);
      }
    }
  };

  const handleReminderTimeChange = (event, selectedTime) => {
    setShowReminderTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setNewReminderDate(selectedTime);
    }
  };

  const handleAddReminder = () => {
    if (!newReminderDate) {
      Alert.alert('Error', 'Please select a date and time for the reminder.');
      return;
    }

    setReminders([...reminders, { time: newReminderDate.toISOString(), method: newReminderMethod }]);
    setNewReminderDate(new Date()); // Reset to current date/time
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const clearDueDate = () => {
    setDueDate(null);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!title || !status || !priority) {
      setError('Title, status, and priority are required.');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description: description || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        status,
        priority,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        project: selectedProjectId || undefined,
        reminders: reminders.map(r => ({
          time: r.time,
          method: r.method,
        })),
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/tasks/${taskId}`, taskData);
      } else {
        response = await apiClient.post('/tasks', taskData);
      }

      Alert.alert('Success', `Task ${isEditing ? 'updated' : 'created'} successfully!`);
      navigation.goBack();
    } catch (e) {
      console.error("Task form error:", e.response?.data || e.message);
      setError('Failed to save task. Please try again.');
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
      default: return COLORS.deepCoffee;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in-progress': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'deferred': return '#6B7280';
      case 'cancelled': return '#DC2626';
      default: return COLORS.deepCoffee;
    }
  };

  return (
    <GradientBackground>
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee, marginBottom: 20 }}>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </Title>

          {successMessage && <SuccessText>{successMessage}</SuccessText>}
          {error && <ErrorText>{error}</ErrorText>}

          {/* Title */}
          <Label>Title *</Label>
          <Input 
            placeholder="Enter task title" 
            value={title} 
            onChangeText={setTitle} 
            editable={!loading} 
          />

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="Add task description (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />

          {/* Due Date */}
          <Label>Due Date</Label>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderColor: COLORS.lightCocoa,
              borderWidth: 1,
              borderRadius: 12,
              marginBottom: 15,
              padding: 14,
              backgroundColor: COLORS.white,
            }}
            onPress={() => setShowDueDatePicker(true)}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.deepCoffee} style={{ marginRight: 10 }} />
              <TextInput
                editable={false}
                placeholder="Select due date (optional)"
                value={dueDate ? format(dueDate, 'MMM dd, yyyy') : ''}
                style={{ color: COLORS.deepCoffee, flex: 1 }}
                placeholderTextColor={COLORS.lightCocoa}
              />
            </View>
            {dueDate && (
              <TouchableOpacity onPress={clearDueDate} style={{ padding: 4 }}>
                <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.errorRed} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDueDateChange}
            />
          )}

          {/* Priority and Status Row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
            <View style={{ flex: 1 }}>
              <Label>Priority *</Label>
              <View style={{ 
                borderColor: getPriorityColor(priority), 
                borderWidth: 2, 
                borderRadius: 12, 
                backgroundColor: COLORS.white,
                overflow: 'hidden'
              }}>
                <Picker 
                  selectedValue={priority} 
                  onValueChange={setPriority} 
                  style={{ color: COLORS.deepCoffee }} 
                  enabled={!loading}
                >
                  <Picker.Item label="🔵 Low" value="low" />
                  <Picker.Item label="🟢 Medium" value="medium" />
                  <Picker.Item label="🟠 High" value="high" />
                  <Picker.Item label="🔴 Urgent" value="urgent" />
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
                  <Picker.Item label="⏳ Pending" value="pending" />
                  <Picker.Item label="🔄 In Progress" value="in-progress" />
                  <Picker.Item label="✅ Completed" value="completed" />
                  <Picker.Item label="⏸️ Deferred" value="deferred" />
                  <Picker.Item label="❌ Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Tags */}
          <Label>Tags</Label>
          <Input 
            placeholder="e.g., work, urgent, meeting" 
            value={tags} 
            onChangeText={setTags} 
            editable={!loading} 
          />

          {/* Project */}
          <Label>Project</Label>
          <View style={{ 
            width: '100%', 
            borderColor: COLORS.lightCocoa, 
            borderWidth: 1, 
            borderRadius: 12, 
            marginBottom: 15, 
            backgroundColor: COLORS.white,
            overflow: 'hidden'
          }}>
            <Picker 
              selectedValue={selectedProjectId} 
              onValueChange={setSelectedProjectId} 
              style={{ color: COLORS.deepCoffee }} 
              enabled={!loading}
            >
              <Picker.Item label="📁 No Project (Optional)" value="" />
              {projects.map((proj) => (
                <Picker.Item key={proj._id} label={`📂 ${proj.name}`} value={proj._id} />
              ))}
            </Picker>
          </View>

          {/* Reminders Section */}
          <View style={{ 
            width: '100%', 
            marginTop: 20, 
            padding: 15, 
            backgroundColor: COLORS.softCream, 
            borderRadius: 12,
            marginBottom: 20 
          }}>
            <Label style={{ marginBottom: 10 }}>
              <MaterialCommunityIcons name="bell-ring" size={18} color={COLORS.deepCoffee} /> Reminders
            </Label>
            
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
                        {format(new Date(reminder.time), 'MMM d, yyyy')}
                      </BadgeText>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <BadgeText style={{ color: COLORS.lightCocoa }}>
                        {format(new Date(reminder.time), 'h:mm a')} • {reminder.method.replace('_', ' ')}
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
            
            {/* Reminder Date/Time Selector */}
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

            {showReminderDatePicker && (
              <DateTimePicker
                value={newReminderDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleReminderDateChange}
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

            {Platform.OS === 'ios' && (
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
                onPress={() => setShowReminderTimePicker(true)}
                disabled={loading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.deepCoffee} style={{ marginRight: 10 }} />
                  <BadgeText>{format(newReminderDate, 'h:mm a')}</BadgeText>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.lightCocoa} />
              </TouchableOpacity>
            )}

            {/* Reminder Method */}
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
                    name={isEditing ? "content-save" : "plus-circle"} 
                    size={20} 
                    color="#fff" 
                    style={{ marginRight: 8 }} 
                  />
                  <ButtonText>{isEditing ? 'Update Task' : 'Create Task'}</ButtonText>
                </View>
              )}
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default TaskFormScreen;