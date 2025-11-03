import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Platform, Modal, TouchableOpacity } from 'react-native';
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
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';

const TaskFormScreen = ({ route, navigation }) => {
  const { taskId, taskToEdit } = route.params || {};
  const isEditing = !!taskId;

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate ? new Date(taskToEdit.dueDate) : null);
  const [status, setStatus] = useState(taskToEdit?.status || 'pending');
  const [priority, setPriority] = useState(taskToEdit?.priority || 'medium');
  const [tags, setTags] = useState(taskToEdit?.tags ? taskToEdit.tags.join(', ') : '');
  const [selectedProjectId, setSelectedProjectId] = useState(taskToEdit?.project?._id || '');
  const [projects, setProjects] = useState([]);

  const [reminders, setReminders] = useState(
    taskToEdit?.reminders?.map(r => ({ ...r, time: new Date(r.time) })) || []
  );
  const [newReminderTime, setNewReminderTime] = useState(new Date());
  const [newReminderMethod, setNewReminderMethod] = useState('app_notification');
  const [showReminderPicker, setShowReminderPicker] = useState(false); // For adding new reminder

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false); // For task dueDate

  // Fetch projects for selection
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects'); // Assuming a /projects endpoint exists
        setProjects(response.data.data);
      } catch (e) {
        console.error("Failed to fetch projects for selection:", e.response?.data || e.message);
      }
    };
    fetchProjects();
  }, []);

  // Update header title based on whether we are editing or creating
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Task' : 'Create New Task',
    });
  }, [isEditing, navigation]);

  // --- CRITICAL FIX: DatePicker for Task DueDate ---
  const onDateChange = (event, selectedDate) => {
    console.log("[TaskForm] DueDate Picker - event:", event, "selectedDate:", selectedDate);

    if (Platform.OS === 'android') {
      // In both 'set' or 'dismissed', close the picker AFTER the event is processed
      setTimeout(() => setShowDatePicker(false), 0);
    } else { // iOS handling for live updates in picker without immediate modal close
      if (selectedDate) {
        setDueDate(selectedDate);
      }
    }

    // Only update the state if the user actually "set" a date (relevant for iOS and Android 'set' type)
    if (event && event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleConfirmDate = () => { // For iOS modal
    setShowDatePicker(false);
  };

  const handleCancelDate = () => { // For iOS modal
    setShowDatePicker(false);
  };

  // --- CRITICAL FIX: Reminder Logic DatePicker ---
  const handleAddReminder = () => {
    if (!newReminderTime || !isValid(newReminderTime)) {
      Alert.alert('Error', 'Please set a valid time for the reminder.');
      return;
    }
    setReminders([...reminders, { time: newReminderTime, method: newReminderMethod }]);
    setNewReminderTime(new Date()); // Reset for next reminder
    setShowReminderPicker(false); // Ensure reminder picker is closed after adding
  };

  const handleRemoveReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const onNewReminderDateTimeChange = (event, selectedValue) => {
    console.log("[TaskForm] Reminder Picker - event:", event, "selectedValue:", selectedValue);

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

  // --- Form Submission ---
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
          time: r.time.toISOString(),
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
      let displayError = 'Failed to save task. Please try again.';

      if (backendMessage) {
        if (backendMessage.includes("Validation Error: \"project\" must be a valid MongoDB ObjectId")) {
          displayError = "Invalid Project ID. Please select a project or leave it empty.";
        } else if (backendMessage.includes("Validation Error: \"dueDate\" must be a valid ISO 8601 date")) {
          displayError = "Invalid Due Date format. Please select a valid date.";
        } else {
          displayError = backendMessage;
        }
      }
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };


  return (
    <GradientBackground>
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee, marginBottom: 20 }}>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          <Label>Title:</Label>
          <Input
            placeholder="Task Title"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />

          <Label>Description:</Label>
          <TextArea
            placeholder="Task Description (Optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
          />

          <Label>Due Date:</Label>
          <DateDisplayButton onPress={() => setShowDatePicker(true)} disabled={loading}>
            <GradientButtonBackground colors={GRADIENTS.secondaryButton}>
              <DateDisplayButtonText>
                {dueDate ? format(dueDate, 'PPP') : 'Select Due Date (Optional)'}
              </DateDisplayButtonText>
            </GradientButtonBackground>
          </DateDisplayButton>

          {/* iOS DueDate DatePicker within a Modal */}
          {Platform.OS === 'ios' && showDatePicker && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showDatePicker}
              onRequestClose={handleCancelDate}
            >
              <ModalBackground onPress={handleCancelDate}>
                <ModalContent>
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    minimumDate={new Date()}
                  />
                  <ModalButtonRow>
                    <GradientButton onPress={handleCancelDate} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground colors={['#ccc', '#bbb']}>
                        <ButtonText>Cancel</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                    <GradientButton onPress={handleConfirmDate} style={{ width: '48%', marginBottom: 0 }}>
                      <GradientButtonBackground>
                        <ButtonText>Confirm</ButtonText>
                      </GradientButtonBackground>
                    </GradientButton>
                  </ModalButtonRow>
                </ModalContent>
              </ModalBackground>
            </Modal>
          )}

          {/* Android DueDate DatePicker */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Label>Status:</Label>
          <View style={{ width: '100%', borderColor: COLORS.lightCocoa, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white }}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="In-Progress" value="in-progress" />
              <Picker.Item label="Completed" value="completed" />
              <Picker.Item label="Deferred" value="deferred" />
              <Picker.Item label="Cancelled" value="cancelled" />
            </Picker>
          </View>

          <Label>Priority:</Label>
          <View style={{ width: '100%', borderColor: COLORS.lightCocoa, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white }}>
            <Picker
              selectedValue={priority}
              onValueChange={(itemValue) => setPriority(itemValue)}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
              <Picker.Item label="Urgent" value="urgent" />
            </Picker>
          </View>

          <Label>Tags (comma-separated):</Label>
          <Input
            placeholder="e.g., work, urgent, meeting"
            value={tags}
            onChangeText={setTags}
            editable={!loading}
          />

          <Label>Project:</Label>
          <View style={{ width: '100%', borderColor: COLORS.lightCocoa, borderWidth: 1, borderRadius: 8, marginBottom: 15, backgroundColor: COLORS.white }}>
            <Picker
              selectedValue={selectedProjectId}
              onValueChange={(itemValue) => setSelectedProjectId(itemValue)}
              style={{ color: COLORS.deepCoffee }}
              enabled={!loading}
            >
              <Picker.Item label="No Project (Optional)" value="" />
              {projects.map((proj) => (
                <Picker.Item key={proj._id} label={proj.name} value={proj._id} />
              ))}
            </Picker>
          </View>

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
              {loading ? <LoadingIndicator size="small" color="#fff" /> : <ButtonText>{isEditing ? 'Update Task' : 'Create Task'}</ButtonText>}
            </GradientButtonBackground>
          </GradientButton>

          {/* iOS Reminder Date/Time Picker Modal */}
          {Platform.OS === 'ios' && showReminderPicker && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={showReminderPicker}
              onRequestClose={handleCancelDate} // Can reuse cancel for general date picker
            >
              <ModalBackground onPress={handleCancelDate}>
                <ModalContent>
                  <DateTimePicker
                    value={newReminderTime}
                    mode="datetime"
                    display="spinner"
                    onChange={onNewReminderDateTimeChange}
                    minimumDate={new Date()}
                  />
                  <ModalButtonRow>
                    <GradientButton onPress={handleCancelDate} style={{ width: '48%', marginBottom: 0 }}>
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

export default TaskFormScreen;