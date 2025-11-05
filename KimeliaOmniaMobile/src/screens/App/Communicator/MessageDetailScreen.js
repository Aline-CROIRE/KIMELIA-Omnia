import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View } from 'react-native';
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
import { COLORS, GRADIENTS } from '../../../constants';
import { format } from 'date-fns';

const MessageDetailScreen = ({ route, navigation }) => {
  const { messageId, messageSubject } = route.params;
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Frontend validation remains loosened to send whatever ID is passed
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
      console.log('Fetching message with ID:', messageId, ' (type:', typeof messageId, ')');
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
              console.log('Deleting message with ID:', messageId, ' (type:', typeof messageId, ')');
              await apiClient.delete(`/messages/${messageId}`);
              Alert.alert("Success", "Message deleted successfully!");
              navigation.goBack(); // Go back to the message list
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
      <ScrollContainer>
        <ContentContainer>
          <Title style={{ color: COLORS.deepCoffee }}>{message.subject || `[${message.type}]`}</Title>

          <Section>
            <Label>Content:</Label>
            <DetailText>{message.content || 'No content provided.'}</DetailText>
          </Section>

          <Section>
            <Label>Type:</Label>
            <Row>
              <Badge type="info"><BadgeText>{message.type.replace('_', ' ')}</BadgeText></Badge>
            </Row>
          </Section>

          {message.source && (
            <Section>
              <Label>Source:</Label>
              <DetailText>{message.source}</DetailText>
            </Section>
          )}

          {message.status && (
            <Section>
              <Label>Status:</Label>
              <Row>
                <Badge type="default"><BadgeText>{message.status}</BadgeText></Badge>
              </Row>
            </Section>
          )}

          {message.tags && message.tags.length > 0 && (
            <Section>
              <Label>Tags:</Label>
              <Row>
                {message.tags.map((tag, index) => (
                  <Badge key={index} type="default">
                    <BadgeText>{tag}</BadgeText>
                  </Badge>
                ))}
              </Row>
            </Section>
          )}

          {message.scheduledSendTime && (
            <Section>
              <Label>Scheduled Send Time:</Label>
              <DetailText>{format(new Date(message.scheduledSendTime), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          {message.createdAt && (
            <Section>
              <Label>Created At:</Label>
              <DetailText>{format(new Date(message.createdAt), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          {message.updatedAt && (
            <Section>
              <Label>Last Updated:</Label>
              <DetailText>{format(new Date(message.updatedAt), 'PPPPpppp')}</DetailText>
            </Section>
          )}

          <GradientButton onPress={() => navigation.navigate('MessageForm', { messageId: message._id, messageToEdit: message })} style={{ marginTop: 20 }}>
            <GradientButtonBackground>
              <ButtonText>Edit Message</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

          <GradientButton onPress={handleDeleteMessage}>
            <GradientButtonBackground colors={[COLORS.errorRed, '#cc0000']}>
              <ButtonText>Delete Message</ButtonText>
            </GradientButtonBackground>
          </GradientButton>

        </ContentContainer>
      </ScrollContainer>
    </GradientBackground>
  );
};

export default MessageDetailScreen;