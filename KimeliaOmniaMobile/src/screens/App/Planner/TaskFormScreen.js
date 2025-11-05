

import React, { useState, useEffect } from 'react';
import { Alert, View, TouchableOpacity, TextInput, ScrollView, Platform, StyleSheet } from 'react-native'; // Import StyleSheet
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
import { COLORS, GRADIENTS, FONTS } from '../../../constants'; // Import FONTS

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
  const [reminders, setReminders] = useState(taskToEdit?.reminders?.map(r => ({ ...r, time: new Date(r.time) })) || []);
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
    if (Platform.OS === 'android') {
      setShowDueDatePicker(false);
    } else {
      setShowDueDatePicker(Platform.OS === 'ios');
    }

    if (event?.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
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

  const handleAddReminder = () => {
    if (!newReminderDate || !isValid(newReminderDate)) {
      Alert.alert('Error', 'Please set a valid date and time for the reminder.');
      return;
    }

    setReminders([...reminders, { time: newReminderDate.toISOString(), method: newReminderMethod }]);
    setNewReminderDate(new Date());
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
      const backendMessage = e.response?.data?.message;
      const displayError = backendMessage || 'Failed to save task. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
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
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.formTitle}>
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
            style={styles.inputField}
          />

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="Add task description (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            style={styles.textAreaField}
          />

          {/* Due Date */}
          <Label>Due Date</Label>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDueDatePicker(true)}
            disabled={loading}
          >
            <View style={styles.datePickerContent}>
              <MaterialCommunityIcons name="calendar" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <TextInput
                editable={false}
                placeholder="Select due date (optional)"
                value={dueDate ? format(dueDate, 'MMM dd, yyyy') : ''}
                style={styles.datePickerText}
                placeholderTextColor={COLORS.lightCocoa}
              />
            </View>
            {dueDate && (
              <TouchableOpacity onPress={clearDueDate} style={styles.clearButton}>
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
          <Row style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Label>Priority *</Label>
              <View style={[styles.pickerWrapper, { borderColor: getPriorityColor(priority) }]}>
                <Picker 
                  selectedValue={priority} 
                  onValueChange={setPriority} 
                  style={styles.picker} 
                  enabled={!loading}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="🔵 Low" value="low" />
                  <Picker.Item label="🟢 Medium" value="medium" />
                  <Picker.Item label="🟠 High" value="high" />
                  <Picker.Item label="🔴 Urgent" value="urgent" />
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
                  <Picker.Item label="⏳ Pending" value="pending" />
                  <Picker.Item label="🔄 In Progress" value="in-progress" />
                  <Picker.Item label="✅ Completed" value="completed" />
                  <Picker.Item label="⏸️ Deferred" value="deferred" />
                  <Picker.Item label="❌ Cancelled" value="cancelled" />
                </Picker>
              </View>
            </View>
          </Row>

          {/* Tags */}
          <Label>Tags</Label>
          <Input 
            placeholder="e.g., work, urgent, meeting" 
            value={tags} 
            onChangeText={setTags} 
            editable={!loading} 
            style={styles.inputField}
          />

          {/* Project */}
          <Label>Project</Label>
          <View style={[styles.pickerWrapper, { borderColor: COLORS.lightCocoa }]}>
            <Picker 
              selectedValue={selectedProjectId} 
              onValueChange={setSelectedProjectId} 
              style={styles.picker} 
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="📁 No Project (Optional)" value="" />
              {projects.map((proj) => (
                <Picker.Item key={proj._id} label={`📂 ${proj.name}`} value={proj._id} />
              ))}
            </Picker>
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
                    name={isEditing ? "content-save" : "plus-circle"} 
                    size={20} 
                    color="#fff" 
                    style={styles.icon} 
                  />
                  <ButtonText>{isEditing ? 'Update Task' : 'Create Task'}</ButtonText>
                </Row>
              )}
            </GradientButtonBackground>
          </GradientButton>

          {/* Date/Time Pickers */}
          {showDueDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDueDateChange}
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
    marginBottom: 15, // Standard margin for Input
  },
  textAreaField: {
    marginBottom: 15, // Standard margin for TextArea
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.lightCocoa,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 15,
    padding: 14,
    backgroundColor: COLORS.white,
    height: 50,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datePickerText: {
    color: COLORS.deepCoffee,
    flex: 1,
    paddingVertical: 0,
    fontFamily: FONTS.secondary,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
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
    marginBottom: 15, // Standard margin for pickers
  },
  picker: {
    color: COLORS.deepCoffee,
    height: 55,
  },
  pickerItem: {
    height: 55, // For iOS picker item height
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
  icon: {
    marginRight: 8, // Default icon margin for consistency
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
    marginTop: 20, // Add more space before the final submit button
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default TaskFormScreen;
