import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, View, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientBackground,
  ContentContainer,
  Title,
  LoadingIndicator,
  ErrorText,
  Card,
  CardTitle,
  CardDescription,
  Badge,
  BadgeText,
  Row,
  FloatingActionButton,
  FabText,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  SubTitle,
  DetailText,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';
import { format, parseISO } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LearningResourceListScreen = ({ navigation }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchResources = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get('/learning-resources');
      setResources(response.data.data);
    } catch (e) {
      console.error("Failed to fetch learning resources:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load learning resources.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load learning resources.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchResources();
      return () => {};
    }, [fetchResources])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResources();
  }, [fetchResources]);

  const handleResourcePress = (item) => {
    const resourceIdString = String(item._id);
    if (!resourceIdString || resourceIdString.trim() === '') {
      Alert.alert(
        "Invalid Resource ID",
        "This resource has an invalid ID or it's missing. Cannot open details."
      );
      console.error("Attempted to navigate with invalid resource ID:", item._id);
      return;
    }
    navigation.navigate('LearningResourceDetail', { resourceId: resourceIdString, resourceTitle: item.title });
  };

  const renderResourceItem = ({ item }) => (
    <Card onPress={() => handleResourcePress(item)} style={styles.resourceCard}>
      <CardTitle style={styles.resourceCardTitle}>{item.title}</CardTitle>
      {item.description && <CardDescription numberOfLines={2}><Text>{item.description}</Text></CardDescription>}
      <Row style={styles.badgesContainer}>
        <Badge type="info">
          <BadgeText>{item.type}</BadgeText>
        </Badge>
        {item.category && (
          <Badge type="default">
            <BadgeText>{item.category}</BadgeText>
          </Badge>
        )}
        {item.tags && item.tags.length > 0 && (
            <Badge type="default">
                <BadgeText>{item.tags[0]}</BadgeText>
            </Badge>
        )}
      </Row>
      {item.url && (
        <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={styles.urlLinkContainer}>
            <MaterialCommunityIcons name="link" size={16} color={COLORS.chocolateBrown} style={styles.linkIcon} />
            <Text style={styles.urlLink} numberOfLines={1}>{item.url}</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <GradientBackground>
      <ContentContainer style={styles.contentContainer}>
        <Title style={styles.mainTitle}>My Learning Resources</Title>

        <View style={styles.coachHomeButtonContainer}>
          <GradientButton onPress={() => navigation.navigate('CoachHome')} style={styles.coachHomeButton}>
            <GradientButtonBackground colors={['#9b764b', '#b38d6d']}>
              <ButtonText>Coach Home</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </View>
        
        {/* --- NEW: AI Generate Resources Button --- */}
        <View style={styles.aiGenerateButtonContainer}>
          <GradientButton onPress={() => navigation.navigate('LearningResourceAIGenerate')} style={styles.aiGenerateButton}>
            <GradientButtonBackground colors={GRADIENTS.goldAccent}>
              <Row style={styles.aiGenerateButtonContent}>
                <MaterialCommunityIcons name="robot-outline" size={20} color={COLORS.white} />
                <ButtonText style={styles.aiGenerateButtonText}>AI Generate Resources</ButtonText>
              </Row>
            </GradientButtonBackground>
          </GradientButton>
        </View>
        {/* --- END NEW --- */}

        {error ? <ErrorText><Text>{error}</Text></ErrorText> : null}
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          renderItem={renderResourceItem}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="book-open-variant" size={60} color={COLORS.lightCocoa} style={styles.emptyStateIcon} />
              <SubTitle style={styles.emptyStateTitle}>No Learning Resources Found</SubTitle>
              <DetailText style={styles.emptyStateDescription}>
                <Text>Start your learning journey! Tap the '+' button below to add your first resource, or try AI generation!</Text>
              </DetailText>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.chocolateBrown}
              colors={[COLORS.chocolateBrown]}
            />
          }
        />
      </ContentContainer>
      <FloatingActionButton onPress={() => navigation.navigate('LearningResourceForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 0,
  },
  mainTitle: {
    fontSize: 28,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  coachHomeButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  coachHomeButton: {
    borderRadius: 12,
  },
  // --- NEW STYLES FOR AI BUTTON ---
  aiGenerateButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiGenerateButton: {
    borderRadius: 12,
  },
  aiGenerateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  aiGenerateButtonText: {
    fontSize: 16,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // --- END NEW STYLES ---
  flatListContent: {
    paddingHorizontal: 20,
    width: '100%',
  },
  resourceCard: {
    borderRadius: 15,
    padding: 18,
  },
  resourceCardTitle: {
    fontSize: 19,
    fontFamily: FONTS.primary,
    color: COLORS.deepCoffee,
  },
  badgesContainer: {
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  urlLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  linkIcon: {
    marginRight: 5,
  },
  urlLink: {
    color: COLORS.chocolateBrown,
    textDecorationLine: 'underline',
    fontFamily: FONTS.secondary,
    fontSize: 14,
    flexShrink: 1, // Allow text to shrink
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    marginBottom: 15,
  },
  emptyStateTitle: {
    color: COLORS.deepCoffee,
    marginBottom: 10,
    fontSize: 20,
    fontFamily: FONTS.primary,
  },
  emptyStateDescription: {
    textAlign: 'center',
    color: COLORS.chocolateBrown,
    paddingHorizontal: 10,
    fontFamily: FONTS.secondary,
  },
});

export default LearningResourceListScreen;