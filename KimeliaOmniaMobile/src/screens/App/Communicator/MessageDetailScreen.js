
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
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
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS, FONTS } from '../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MessageDetailScreen = ({ route, navigation }) => {
  const { messageId, messageSubject } = route.params;
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!messageId || typeof messageId !== 'string' || messageId.trim() === '') {
    console.error("MessageDetailScreen received invalid or empty messageId:", messageId);
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>
            Error: Invalid or missing Message ID provided. Cannot retrieve details.
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
    navigation.setOptions({ title: messageSubject || 'Message Details' });
  }, [navigation, messageSubject]);

  const fetchMessageDetails = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get(`/messages/${messageId}`);
      setMessage(response.data.data);
    } catch (e) {
      console.error("Failed to fetch message details:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load message details.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load message details.');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useFocusEffect(
    useCallback(() => {
      fetchMessageDetails();
      return () => {};
    }, [fetchMessageDetails])
  );

  const handleDeleteMessage = async () => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/messages/${messageId}`);
              Alert.alert("Success", "Message deleted successfully!");
              navigation.goBack();
            } catch (e) {
              console.error("Failed to delete message:", e.response?.data || e.message);
              setError(e.response?.data?.message || 'Failed to delete message.');
              Alert.alert('Error', e.response?.data?.message || 'Could not delete message.');
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
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
          <ErrorText>{error}</ErrorText>
          <GradientButton onPress={() => navigation.goBack()}>
            <GradientButtonBackground>
              <ButtonText>Go Back</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </ContentContainer>
      </GradientBackground>
    );
  }

  if (!message) {
    return (
      <GradientBackground>
        <ContentContainer>
          <ErrorText>Message not found.</ErrorText>
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
          <Title style={styles.messageTitle}>{message.subject || `[${message.type}]`}</Title>

          <View style={styles.metaRow}>
            <Row style={styles.metaItem}>
              <MaterialCommunityIcons name="message-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
              <Label style={styles.metaLabel}>Type:</Label>
              <Badge type="info"><BadgeText>{message.type.replace('_', ' ')}</BadgeText></Badge>
            </Row>
            {message.status && (
              <Row style={styles.metaItem}>
                <MaterialCommunityIcons name="check-circle-outline" size={18} color={COLORS.chocolateBrown} style={styles.icon} />
                <Label style={styles.metaLabel}>Status:</Label>
                <Badge type="default"><BadgeText>{message.status}</BadgeText></Badge>
              </Row>
            )}
          </View>

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Content</Label>
            </Row>
            <DetailText style={styles.detailContent}>{message.content || 'No content provided.'}</DetailText>
          </Section>

          {message.source && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="source-branch" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Source</Label>
              </Row>
              <DetailText style={styles.detailContent}>{message.source}</DetailText>
            </Section>
          )}

          {message.tags && message.tags.length > 0 && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="tag-multiple" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Tags</Label>
              </Row>
              <Row style={styles.tagsContainer}>
                {message.tags.map((tag, index) => (
                  <Badge key={index} type="default">
                    <BadgeText>{tag}</BadgeText>
                  </Badge>
                ))}
              </Row>
            </Section>
          )}

          {message.scheduledSendTime && (
            <Section style={styles.sectionCard}>
              <Row style={styles.sectionHeader}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.deepCoffee} style={styles.icon} />
                <Label style={styles.sectionLabel}>Scheduled Send Time</Label>
              </Row>
              <DetailText style={styles.detailContent}>{format(new Date(message.scheduledSendTime), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          <Section style={styles.sectionCard}>
            <Row style={styles.sectionHeader}>
              <MaterialCommunityIcons name="history" size={20} color={COLORS.deepCoffee} style={styles.icon} />
              <Label style={styles.sectionLabel}>Timestamps</Label>
            </Row>
            {message.createdAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Created At:</Text> {format(new Date(message.createdAt), 'PPPPpppp')}
              </DetailText>
            )}
            {message.updatedAt && (
              <DetailText style={styles.detailContent}>
                <Text style={styles.timestampLabel}>Last Updated:</Text> {format(new Date(message.updatedAt), 'PPPPpppp')}
              </DetailText>
            )}
          </Section>

          <Row style={styles.buttonGroup}>
            <GradientButton onPress={() => navigation.navigate('MessageForm', { messageId: message._id, messageToEdit: message })} style={styles.editButton}>
              <GradientButtonBackground colors={GRADIENTS.primaryButton}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="pencil" size={20} color={COLORS.white} />
                  <ButtonText>Edit Message</ButtonText>
                </Row>
              </GradientButtonBackground>
            </GradientButton>

            <GradientButton onPress={handleDeleteMessage} style={styles.deleteButton}>
              <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
                <Row style={styles.buttonContent}>
                  <MaterialCommunityIcons name="delete" size={20} color={COLORS.white} />
                  <ButtonText>Delete Message</ButtonText>
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
  messageTitle: {
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

export default MessageDetailScreen;
