import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, TextInput, StyleSheet, Switch } from 'react-native';
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
  Row,
  BadgeText,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';

const GOAL_STATUSES = [
  { value: 'active', label: '🟢 Active', color: '#10B981' },
  { value: 'completed', label: '✅ Completed', color: '#3B82F6' },
  { value: 'overdue', label: '🔴 Overdue', color: '#DC2626' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6B7280' },
  { value: 'on_hold', label: '⏸️ On Hold', color: '#F59E0B' },
];

const GOAL_CATEGORIES = [
  { value: 'personal', label: '👤 Personal' },
  { value: 'professional', label: '💼 Professional' },
  { value: 'health', label: '❤️ Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'other', label: '📌 Other' },
];

const GoalFormScreen = ({ route, navigation }) => {
  const { goalId, goalToEdit } = route.params || {};
  const isEditing = !!goalId;

  const [title, setTitle] = useState(goalToEdit?.title || '');
  const [description, setDescription] = useState(goalToEdit?.description || '');
  const [targetDate, setTargetDate] = useState(goalToEdit?.targetDate ? new Date(goalToEdit.targetDate) : null);
  const [progress, setProgress] = useState(goalToEdit?.progress !== undefined ? String(goalToEdit.progress) : '0');
  const [status, setStatus] = useState(goalToEdit?.status || 'active');
  const [category, setCategory] = useState(goalToEdit?.category || 'personal');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Goal' : 'Create New Goal',
    });
  }, [isEditing, navigation]);

  const handleTargetDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTargetDatePicker(false);
    } else {
      setShowTargetDatePicker(Platform.OS === 'ios');
    }
    if (event?.type === 'set' && selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  const clearTargetDate = () => {
    setTargetDate(null);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!title || !status || !category) {
      setError('Goal title, status, and category are required.');
      return;
    }
    if (targetDate && (!isValid(targetDate) || (isBefore(targetDate, new Date()) && (!isEditing || (isEditing && goalToEdit?.targetDate && isBefore(new Date(), new Date(goalToEdit.targetDate))))))) {
        setError('Target date must be a valid future date.');
        return;
    }
    
    const parsedProgress = parseInt(progress, 10);
    if (isNaN(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
        setError('Progress must be a number between 0 and 100.');
        return;
    }

    setLoading(true);
    try {
      const goalData = {
        title,
        description: description || undefined,
        targetDate: targetDate ? targetDate.toISOString() : undefined,
        progress: parsedProgress,
        status,
        category,
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/goals/${goalId}`, goalData);
      } else {
        response = await apiClient.post('/goals', goalData);
      }

      Alert.alert('Success', `Goal ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // --- CHANGED NAVIGATION AFTER SUCCESSFUL SUBMISSION ---
      // Navigate directly to the GoalList screen to ensure it's on top of the Coach stack
      navigation.navigate('GoalList'); 
      // If you want to ensure the list is refreshed, the useFocusEffect in GoalListScreen will handle it.
      // If you prefer to pop back to the previous screen (if it was GoalList), use navigation.goBack()
      // but 'navigate' is more robust to guarantee we land on GoalList.
      // --- END CHANGED NAVIGATION ---

    } catch (e) {
      console.error("Goal form error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      const displayError = backendMessage || 'Failed to save goal. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusValue) => {
    const statusObj = GOAL_STATUSES.find(s => s.value === statusValue);
    return statusObj?.color || COLORS.deepCoffee;
  };

  const getCategoryColor = (categoryValue) => {
    const colors = {
      personal: '#8B5CF6',
      professional: '#3B82F6',
      health: '#EF4444',
      education: '#F59E0B',
      finance: '#10B981',
      other: '#6B7280',
    };
    return colors[categoryValue] || COLORS.deepCoffee;
  };

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.formTitle}>
            {isEditing ? 'Edit Goal' : 'Create New Goal'}
          </Title>

          {successMessage ? <SuccessText>{successMessage}</SuccessText> : null}
          {error ? <ErrorText>{error}</ErrorText> : null}

          {/* Name -> Title */}
          <Label>Goal Title *</Label>
          <Input
            placeholder="e.g., Learn React Native, Launch Startup"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            style={styles.inputField}
          />

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="Provide a detailed description of your goal (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            style={styles.textAreaField}
          />

          {/* Target Date */}
          <Label>Target Date</Label>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowTargetDatePicker(true)}
            disabled={loading}
          >
            <View style={styles.datePickerContent}>
              <MaterialCommunityIcons name="calendar-range" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <TextInput
                editable={false}
                placeholder="Select target date (optional)"
                value={targetDate ? format(targetDate, 'MMM dd, yyyy') : ''}
                style={styles.datePickerText}
                placeholderTextColor={COLORS.lightCocoa}
              />
            </View>
            {targetDate && (
              <TouchableOpacity onPress={clearTargetDate} style={styles.clearButton}>
                <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.errorRed} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {showTargetDatePicker && (
            <DateTimePicker
              value={targetDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTargetDateChange}
              minimumDate={new Date()} // Only allow future dates
            />
          )}

          {/* Progress and Status Row */}
          <Row style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Label>Progress (%)</Label>
              <Input
                placeholder="0-100"
                value={progress}
                onChangeText={setProgress}
                editable={!loading}
                keyboardType="numeric"
                style={[styles.inputField, { marginBottom: 0 }]}
              />
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
                  {GOAL_STATUSES.map((s) => (
                    <Picker.Item key={s.value} label={s.label} value={s.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </Row>

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
              {GOAL_CATEGORIES.map((cat) => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          {/* Submit Button */}
          <GradientButton onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            <GradientButtonBackground colors={isEditing ? GRADIENTS.primaryButton : GRADIENTS.goldAccent}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons
                    name={isEditing ? "content-save" : "target-variant"}
                    size={20}
                    color="#fff"
                    style={styles.icon}
                  />
                  <ButtonText>{isEditing ? 'Update Goal' : 'Create Goal'}</ButtonText>
                </Row>
              )}
            </GradientButtonBackground>
          </GradientButton>
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

export default GoalFormScreen;