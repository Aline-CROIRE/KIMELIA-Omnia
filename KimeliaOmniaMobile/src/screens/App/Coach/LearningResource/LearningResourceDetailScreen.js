import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, StyleSheet, Text, Linking, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  GradientBackground,
  ScrollContainer,
  ContentContainer,
  Title,
  LoadingIndicator,
  ErrorText,
  DetailText,
  Label,
  Badge,
  BadgeText,
  Row,
  GradientButton,
  GradientButtonBackground,
  ButtonText,
  Section,
} from '../../../../components/StyledComponents';
import apiClient from '../../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../../constants';
import { format, parseISO } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const LearningResourceDetailScreen = ({ route, navigation }) => {
  const { resourceId, resourceTitle } = route.params;
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!resourceId || typeof resourceId !== 'string' || resourceId.trim() === '') {
    console.error("LearningResourceDetailScreen received invalid or empty resourceId:", resourceId);
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>
            <Text>Error: Invalid or missing Resource ID provided. Cannot retrieve details.</Text>
          </ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  useEffect(() => {
    navigation.setOptions({ title: resourceTitle || 'Resource Details' });
  }, [navigation, resourceTitle]);

  const fetchResourceDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get(`/learning-resources/${resourceId}`);
      setResource(response.data.data);
    } catch (e) {
      console.error("Failed to fetch resource details:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load resource details.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load resource details.');
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useFocusEffect(
    useCallback(() => {
      fetchResourceDetails();
      return () => {};
    }, [fetchResourceDetails])
  );

  const handleDeleteResource = async () => {
    Alert.alert(
      "Delete Resource",
      "Are you sure you want to delete this learning resource?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/learning-resources/${resourceId}`);
              Alert.alert("Success", "Resource deleted successfully!");
              navigation.goBack();
            } catch (e) {
              console.error("Failed to delete resource:", e.response?.data || e.message);
              setError(e.response?.data?.message || 'Failed to delete resource.');
              Alert.alert('Error', e.response?.data?.message || 'Could not delete resource.');
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <GradientBackground>
        <LoadingIndicator />
      </GradientBackground>
    );
  }

  if (error) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText><Text>{error}</Text></ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  if (!resource) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText><Text>Learning resource not found.</Text></ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <ScrollContainer contentContainerStyle={styles.scrollContent}>
        <ContentContainer>
          <Title style={styles.resourceTitle}>{resource.title}</Title>

          <View style={styles.metaRow}>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="book-open-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Type:</Label>
              <Badge type="info"><BadgeText>{resource.type}</BadgeText></Badge>
            </Row>
            {resource.category && (
              <Row style={styles.metaItem}>
                <MaterialCommunityIcons name="tag-text-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
                <Label style={styles.metaLabel}>Category:</Label>
                <Badge type="default"><BadgeText>{resource.category}</BadgeText></Badge>
              </Row>
            )}
          </View>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Description</Label>
            </Row>
            <DetailText style={styles.detailContent}><Text>{resource.description || 'No description provided.'}</Text></DetailText>
          </Section>

          {resource.url && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="link-variant" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>URL</Label>
              </Row>
              <TouchableOpacity onPress={() => Linking.openURL(resource.url)}>
                <DetailText style={styles.urlLink}><Text>{resource.url}</Text></DetailText>
              </TouchableOpacity>
            </Section>
          )}

          {resource.tags && resource.tags.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Tags</Label>
              </Row>
              <Row style={styles.tagsContainer}>
                {resource.tags.map((tag, index) => (
                  <Badge key={index} type="default">
                    <BadgeText>{tag}</BadgeText>
                  </Badge>
                ))}
              </Row>
            </Section>
          )}

          {resource.relatedGoal && (
             <Section style={styles.sectionCard}>
               <Row style={styles.sectionHeader}>
                 <MaterialCommunityIcons name="target" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                 <Label style={styles.sectionLabel}>Related Goal</Label>
               </Row>
               {/* This would ideally fetch goal's title, assuming resource.relatedGoal is an ObjectId */}
               <DetailText style={styles.detailContent}><Text>Goal ID: {resource.relatedGoal}</Text></DetailText>
             </Section>
          )}

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="source-branch" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Source</Label>
            </Row>
            <DetailText style={styles.detailContent}><Text>{resource.source}</Text></DetailText>
          </Section>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Timestamps</Label>
            </Row>
            {resource.createdAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Created At:</Text> <Text>{format(parseISO(resource.createdAt), 'PPPPpppp')}</Text>
              </DetailText>
            )}
            {resource.updatedAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Last Updated:</Text> <Text>{format(parseISO(resource.updatedAt), 'PPPPpppp')}</Text>
              </DetailText>
            )}
          </Section>

          <Row style={styles.buttonGroup}>
            <GradientButton onPress={() => navigation.navigate('LearningResourceForm', { resourceId: resource._id, resourceToEdit: resource })} style={styles.editButton}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                  <ButtonText>Edit Resource</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={handleDeleteResource} style={styles.deleteButton}>
              <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                  <ButtonText>Delete Resource</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>
          </Row>

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
  resourceTitle: {
    fontSize: 26,
    marginBottom: 25,
    color: COLORS.deepCoffee,
    fontFamily: FONTS.primary,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 25,
    backgroundColor: COLORS.softCream,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 14,
    color: COLORS.chocolateBrown,
    marginBottom: 0,
    marginTop: 0,
    fontWeight: '700',
    fontFamily: FONTS.secondary,
  },
  icon: {
    marginRight: 5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightCocoa,
    paddingBottom: 8,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 16,
    color: COLORS.deepCoffee,
    fontWeight: '700',
    fontFamily: FONTS.secondary,
    marginBottom: 0,
    marginTop: 0,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.deepCoffee,
    marginTop: 8,
    fontFamily: FONTS.secondary,
  },
  urlLink: {
    color: COLORS.chocolateBrown,
    textDecorationLine: 'underline',
    fontFamily: FONTS.secondary,
    fontSize: 16,
  },
  tagsContainer: {
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  timestampLabel: {
    fontWeight: '700',
    color: COLORS.chocolateBrown,
  },
  buttonGroup: {
    marginTop: 30,
    flexDirection: 'column',
    width: '100%',
  },
  editButton: {
    marginBottom: 10,
  },
  deleteButton: {
    marginBottom: 0,
  },
  buttonContent: {
    gap: 10,
  },
});

export default LearningResourceDetailScreen;