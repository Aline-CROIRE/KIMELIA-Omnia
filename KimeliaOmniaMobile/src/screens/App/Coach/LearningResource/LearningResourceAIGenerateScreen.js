import React, { useState, useEffect } from 'react';
import { Alert, View, StyleSheet, Text, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  Card,
  CardTitle,
  CardDescription,
  Badge,
  BadgeText,
  SubTitle,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Types } from 'mongoose'; // For client-side ObjectId validation


const RESOURCE_TYPES_HINT = [
  { value: 'any', label: 'Any Type' },
  { value: 'articles', label: 'Articles' },
  { value: 'videos', label: 'Videos' },
  { value: 'courses', label: 'Courses' },
  { value: 'books', label: 'Books' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'tools', label: 'Tools' },
];

const RESOURCE_DIFFICULTY = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const LearningResourceAIGenerateScreen = ({ navigation }) => {
  const [topic, setTopic] = useState('');
  const [typeHint, setTypeHint] = useState('any');
  const [difficulty, setDifficulty] = useState('beginner');
  const [relatedGoalId, setRelatedGoalId] = useState('');

  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGenerateResources = async () => {
    setError('');
    setSuccessMessage('');
    setAiSuggestions([]);

    if (!topic || topic.length < 10) {
      setError('Please provide a specific topic or goal (at least 10 characters).');
      return;
    }
    if (relatedGoalId && !Types.ObjectId.isValid(relatedGoalId)) {
        setError('Invalid format for Related Goal ID.');
        return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/learning-resources/ai-generate', {
        topic,
        typeHint,
        difficulty,
        relatedGoal: relatedGoalId || undefined,
      });

      if (response.data.data && response.data.data.length > 0) {
        setAiSuggestions(response.data.data);
        setSuccessMessage('AI generated some resources for you! Review them below.');
      } else {
        setSuccessMessage('AI could not generate resources for this topic. Try a different prompt.');
      }

    } catch (e) {
      console.error("AI Generate Resources error:", e.response?.data || e.message);
      const backendMessage = e.response?.data?.message;
      const displayError = backendMessage || 'Failed to generate AI resources. Please try again.';
      setError(displayError);
      Alert.alert('Error', displayError);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResource = async (resource) => {
    setLoading(true); // Can show a small loader for each save or a global one
    try {
        await apiClient.post('/learning-resources', {
            title: resource.title,
            description: resource.description,
            url: resource.url,
            type: resource.type,
            category: resource.category,
            source: resource.source,
            relatedGoal: relatedGoalId || undefined,
            // Tags can be added here if AI suggests them, or allow manual addition post-save
        });
        Alert.alert('Success', `"${resource.title}" saved to your resources!`);
        // Remove from suggestions list or mark as saved
        setAiSuggestions(prev => prev.filter(item => item.url !== resource.url));
        if (aiSuggestions.length === 1) { // If it was the last one
            setSuccessMessage('All suggested resources saved or discarded.');
            setTopic(''); // Clear input for new generation
            setRelatedGoalId('');
        }
        navigation.navigate('LearningResourceList', { refresh: true }); // Optionally refresh the list
    } catch (e) {
        console.error("Failed to save AI generated resource:", e.response?.data || e.message);
        Alert.alert('Error', e.response?.data?.message || 'Could not save resource. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const renderSuggestionItem = ({ item, index }) => (
    <Card style={styles.suggestionCard}>
      <CardTitle style={styles.suggestionTitle}>{item.title}</CardTitle>
      <CardDescription style={styles.suggestionDescription}><Text>{item.description}</Text></CardDescription>
      <Row style={styles.suggestionBadges}>
        <Badge type="info"><BadgeText>{item.type}</BadgeText></Badge>
        {item.category && <Badge type="default"><BadgeText>{item.category}</BadgeText></Badge>}
        <Badge type="default"><BadgeText>AI Suggested</BadgeText></Badge>
      </Row>
      {item.url && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={styles.suggestionUrlContainer}>
          <MaterialCommunityIcons name="link" size={16} color={COLORS.chocolateBrown} style={styles.linkIcon} />
          <Text style={styles.suggestionUrl} numberOfLines={1}>{item.url}</Text>
        </TouchableOpacity>
      )}
      <Row style={styles.suggestionActions}>
        <GradientButton
          onPress={() => handleSaveResource(item)}
          style={styles.saveButton}
          disabled={loading}
        >
          <GradientButtonBackground colors={GRADIENTS.primaryButton}>
            <ButtonText style={styles.saveButtonText}>Save</ButtonText>
          </GradientButtonBackground>
        </GradientButton>
        <GradientButton
          onPress={() => setAiSuggestions(prev => prev.filter((_, i) => i !== index))}
          style={styles.discardButton}
          disabled={loading}
        >
          <GradientButtonBackground colors={['#A0522D', '#8B4513']}>
            <ButtonText style={styles.discardButtonText}>Discard</ButtonText>
          </GradientButtonBackground>
        </GradientButton>
      </Row>
    </Card>
  );

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.mainTitle}>AI Generate Learning Resources</Title>
          <SubTitle style={styles.tagline}>
            <Text>Tell Omnia AI what you want to learn, and get instant resource suggestions!</Text>
          </SubTitle>

          {successMessage ? <SuccessText><Text>{successMessage}</Text></SuccessText> : null}
          {error ? <ErrorText><Text>{error}</Text></ErrorText> : null}

          <Label>Topic or Goal *</Label>
          <TextArea
            placeholder="e.g., Learn Advanced JavaScript, Understand Stock Market Investing, Improve Public Speaking Skills"
            value={topic}
            onChangeText={setTopic}
            editable={!loading}
            style={styles.textAreaField}
          />

          <Row style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Label>Resource Type Hint</Label>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={typeHint}
                  onValueChange={setTypeHint}
                  style={styles.picker}
                  enabled={!loading}
                  itemStyle={styles.pickerItem}
                >
                  {RESOURCE_TYPES_HINT.map((t) => (
                    <Picker.Item key={t.value} label={t.label} value={t.value} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.pickerContainer}>
              <Label>Difficulty</Label>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={difficulty}
                  onValueChange={setDifficulty}
                  style={styles.picker}
                  enabled={!loading}
                  itemStyle={styles.pickerItem}
                >
                  {RESOURCE_DIFFICULTY.map((d) => (
                    <Picker.Item key={d.value} label={d.label} value={d.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </Row>

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
            Enter the ID of a goal these resources help you achieve.
          </Text>

          <GradientButton onPress={handleGenerateResources} disabled={loading} style={styles.generateButton}>
            <GradientButtonBackground colors={GRADIENTS.primaryButton}>
              {loading ? (
                <LoadingIndicator size="small" color="#fff" />
              ) : (
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="robot" size={20} color={COLORS.white} />
                  <ButtonText>Generate Resources</ButtonText>
                </Row>
              )}
            </GradientButtonBackground>
          </GradientButton>

          {aiSuggestions.length > 0 && (
            <View style={styles.suggestionsListContainer}>
              <SubTitle style={styles.suggestionsHeader}><Text>AI Suggestions:</Text></SubTitle>
              <FlatList
                data={aiSuggestions}
                keyExtractor={(item, index) => item.url + index} // Use URL + index as key (urls might not be unique if AI suggests generic ones)
                renderItem={renderSuggestionItem}
                scrollEnabled={false} // Nested scroll container handles scrolling
              />
            </View>
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
  mainTitle: {
    fontSize: 26,
    marginBottom: 10,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.chocolateBrown,
    fontFamily: FONTS.secondary,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 20,
  },
  textAreaField: {
    marginBottom: 15,
    minHeight: 100, // Make text area larger
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
    borderColor: COLORS.lightCocoa,
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
    marginTop: -10,
    marginBottom: 15,
    paddingLeft: 5,
    fontFamily: FONTS.secondary,
  },
  generateButton: {
    marginBottom: 30,
    marginTop: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionsListContainer: {
    marginTop: 20,
    width: '100%',
  },
  suggestionsHeader: {
    fontSize: 20,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  suggestionCard: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    backgroundColor: COLORS.white,
  },
  suggestionTitle: {
    fontSize: 18,
    fontFamily: FONTS.primary,
    color: COLORS.deepCoffee,
    marginBottom: 5,
  },
  suggestionDescription: {
    fontSize: 14,
    fontFamily: FONTS.secondary,
    color: COLORS.chocolateBrown,
    marginBottom: 10,
  },
  suggestionBadges: {
    marginTop: 5,
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionUrlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  suggestionUrl: {
    color: COLORS.chocolateBrown,
    textDecorationLine: 'underline',
    fontFamily: FONTS.secondary,
    fontSize: 14,
    flexShrink: 1,
  },
  suggestionActions: {
    marginTop: 15,
    justifyContent: 'space-between',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    fontSize: 14,
  },
  discardButton: {
    flex: 1,
    marginLeft: 5,
  },
  discardButtonText: {
    fontSize: 14,
  }
});

export default LearningResourceAIGenerateScreen;
