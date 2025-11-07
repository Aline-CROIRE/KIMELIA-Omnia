import React, { useState, useEffect } from 'react';
import { Alert, View, Platform, TouchableOpacity, TextInput, StyleSheet, ScrollView, Text } from 'react-native'; // Added Text
import { Picker } from '@react-native-picker/picker';
import { format, isValid } from 'date-fns'; // Only need isValid for relatedGoal check here
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Types } from 'mongoose'; // For client-side ObjectId validation

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

const RESOURCE_TYPES = [
  { value: 'article', label: '📰 Article' },
  { value: 'video', label: '🎥 Video' },
  { value: 'course', label: '🎓 Course' },
  { value: 'book', label: '📚 Book' },
  { value: 'podcast', label: '🎙️ Podcast' },
  { value: 'tool', label: '🛠️ Tool' },
  { value: 'other', label: '📌 Other' },
];

const RESOURCE_CATEGORIES = [
  { value: 'programming', label: '💻 Programming' },
  { value: 'marketing', label: '📈 Marketing' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'design', label: '🎨 Design' },
  { value: 'self-improvement', label: '🌱 Self-Improvement' },
  { value: 'other', label: '📌 Other' },
];

const RESOURCE_SOURCES = [
  { value: 'manual', label: '✍️ Manual' },
  { value: 'AI_suggested', label: '🤖 AI Suggested' },
  { value: 'web_scrape', label: '🕸️ Web Scrape' },
  { value: 'imported', label: '📥 Imported' },
];

const LearningResourceFormScreen = ({ route, navigation }) => {
  const { resourceId, resourceToEdit } = route.params || {};
  const isEditing = !!resourceId;

  const [title, setTitle] = useState(resourceToEdit?.title || '');
  const [description, setDescription] = useState(resourceToEdit?.description || '');
  const [url, setUrl] = useState(resourceToEdit?.url || '');
  const [type, setType] = useState(resourceToEdit?.type || 'article');
  const [category, setCategory] = useState(resourceToEdit?.category || 'other');
  const [tags, setTags] = useState(resourceToEdit?.tags ? resourceToEdit.tags.join(', ') : '');
  const [relatedGoalId, setRelatedGoalId] = useState(resourceToEdit?.relatedGoal || '');
  const [source, setSource] = useState(resourceToEdit?.source || 'manual');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Resource' : 'Add New Resource',
    });
  }, [isEditing, navigation]);

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    if (!title || !url || !type) {
      setError('Title, URL, and Type are required.');
      return;
    }
    // Basic URL format validation (more comprehensive done by Joi backend)
    if (!url.match(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)) {
      setError('Please enter a valid URL.');
      return;
    }
    if (relatedGoalId && !Types.ObjectId.isValid(relatedGoalId)) { // Client-side check for ObjectId format
        setError('Invalid format for Related Goal ID.');
        return;
    }

    setLoading(true);
    try {
      const resourceData = {
        title,
        description: description || undefined,
        url,
        type,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        relatedGoal: relatedGoalId || undefined,
        source,
      };

      let response;
      if (isEditing) {
        response = await apiClient.put(`/learning-resources/${resourceId}`, resourceData);
      } else {
        response = await apiClient.post('/learning-resources', resourceData);
      }

      Alert.alert('Success', `Learning Resource ${isEditing ? 'updated' : 'added'} successfully!`);
      navigation.navigate('LearningResourceList');

    } catch (e) {
      console.error("Learning Resource form error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      const displayError = backendMessage || 'Failed to save learning resource. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.formTitle}>
            {isEditing ? <Text>Edit Learning Resource</Text> : <Text>Add New Learning Resource</Text>}
          </Title>

          {successMessage ? <SuccessText><Text>{successMessage}</Text></SuccessText> : null}
          {error ? <ErrorText><Text>{error}</Text></ErrorText> : null}

          {/* Title */}
          <Label>Title *</Label>
          <Input
            placeholder="e.g., Advanced React Hooks, Marketing Strategies"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            style={styles.inputField}
          />

          {/* URL */}
          <Label>URL *</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="https://example.com/resource"
              value={url}
              onChangeText={setUrl}
              editable={!loading}
              keyboardType="url"
              autoCapitalize="none"
              style={styles.inputNoBorder}
            />
          </View>

          {/* Description */}
          <Label>Description</Label>
          <TextArea
            placeholder="A brief summary or description (optional)"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            style={styles.textAreaField}
          />

          {/* Type */}
          <Label>Type *</Label>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={type}
              onValueChange={setType}
              style={styles.picker}
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              {RESOURCE_TYPES.map((t) => (
                <Picker.Item key={t.value} label={t.label} value={t.value} />
              ))}
            </Picker>
          </View>

          {/* Category */}
          <Label>Category</Label>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              {RESOURCE_CATEGORIES.map((c) => (
                <Picker.Item key={c.value} label={c.label} value={c.value} />
              ))}
            </Picker>
          </View>

          {/* Tags */}
          <Label>Tags</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="e.g., react, hooks, seo"
              value={tags}
              onChangeText={setTags}
              editable={!loading}
              style={styles.inputNoBorder}
            />
          </View>
          <Text style={styles.hintText}>
            Separate tags with commas (e.g., react, hooks, beginners)
          </Text>

          {/* Related Goal ID */}
          <Label>Related Goal ID (Optional)</Label>
          <View style={styles.inputWithIconWrapper}>
            <MaterialCommunityIcons name="target-variant" size={20} color={COLORS.lightCocoa} style={styles.icon} />
            <Input
              placeholder="MongoDB ObjectId of a Goal"
              value={relatedGoalId}
              onChangeText={setRelatedGoalId}
              editable={!loading}
              autoCapitalize="none"
              style={styles.inputNoBorder}
            />
          </View>
          <Text style={styles.hintText}>
            Enter the ID of a goal this resource helps you achieve.
          </Text>

          {/* Source */}
          <Label>Source</Label>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={source}
              onValueChange={setSource}
              style={styles.picker}
              enabled={!loading}
              itemStyle={styles.pickerItem}
            >
              {RESOURCE_SOURCES.map((s) => (
                <Picker.Item key={s.value} label={s.label} value={s.value} />
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
                    name={isEditing ? "content-save" : "plus-circle"} 
                    size={20} 
                    color="#fff" 
                    style={styles.icon} 
                  />
                  <ButtonText>{isEditing ? 'Update Resource' : 'Add Resource'}</ButtonText>
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
  hintText: {
    fontSize: 12,
    color: COLORS.chocolateBrown,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginTop: -10, // Adjust to position closer to the input it hints for
    marginBottom: 15,
    paddingLeft: 5,
    fontFamily: FONTS.secondary,
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

export default LearningResourceFormScreen;