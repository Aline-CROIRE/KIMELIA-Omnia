import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, Alert, View } from 'react-native';
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
  SubTitle, // Added for empty state
  DetailText, // Added for empty state
} from '../../../components/StyledComponents';
import apiClient from '../../../api/apiClient';
import { COLORS, GRADIENTS } from '../../../constants';
import { format } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Added for icons

const MessageListScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchMessages = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.get('/messages');
      setMessages(response.data.data); // Adjust based on your API response structure
    } catch (e) {
      console.error("Failed to fetch messages:", e.response?.data || e.message);
      setError(e.response?.data?.message || 'Failed to load messages.');
      Alert.alert('Error', e.response?.data?.message || 'Could not load messages.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
      return () => {};
    }, [fetchMessages])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMessages();
  }, [fetchMessages]);

  const handleMessagePress = (item) => {
    if (!item._id || typeof item._id !== 'string' || item._id.trim() === '') {
      Alert.alert(
        "Invalid Message ID",
        "This message has an invalid ID or it's missing. Cannot open details."
      );
      console.error("Attempted to navigate with invalid message ID:", item._id);
      return;
    }
    navigation.navigate('MessageDetail', { messageId: item._id, messageSubject: item.subject || item.type });
  };

  const renderMessageItem = ({ item }) => (
    <Card onPress={() => handleMessagePress(item)}>
      <CardTitle>{item.subject || `[${item.type}]`}</CardTitle>
      {item.content && <CardDescription numberOfLines={2}>{item.content}</CardDescription>}
      <Row>
        <Badge type="info">
          <BadgeText>{item.type.replace('_', ' ')}</BadgeText>
        </Badge>
        {item.status && (
          <Badge type="default">
            <BadgeText>{item.status}</BadgeText>
          </Badge>
        )}
        {item.createdAt && (
          <Badge type="default">
            <BadgeText>{format(new Date(item.createdAt), 'MMM d, p')}</BadgeText>
          </Badge>
        )}
      </Row>
    </Card>
  );

  return (
    <GradientBackground>
      <ContentContainer style={{ paddingHorizontal: 0 }}>
        <Title style={{ color: COLORS.deepCoffee }}>My Messages</Title>

        {/* Optional: Add buttons for other Communicator functions like AI Assistant */}
        <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 20 }}>
          <GradientButton onPress={() => navigation.navigate('CommunicatorHome')} style={{ marginBottom: 10 }}>
            <GradientButtonBackground colors={['#9b764b', '#b38d6d']}>
              <ButtonText>Communicator Home</ButtonText>
            </GradientButtonBackground>
          </GradientButton>
        </View>


        {error ? <ErrorText>{error}</ErrorText> : null}
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageItem}
          contentContainerStyle={{ paddingHorizontal: 20, width: '100%' }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
              <MaterialCommunityIcons name="message-text-outline" size={60} color={COLORS.lightCocoa} style={{ marginBottom: 15 }} />
              <SubTitle style={{ color: COLORS.deepCoffee, marginBottom: 10 }}>No Messages Found</SubTitle>
              <DetailText style={{ textAlign: 'center', color: COLORS.chocolateBrown, paddingHorizontal: 20 }}>
                Your inbox is empty! Tap the '+' button below to create your first message.
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
      <FloatingActionButton onPress={() => navigation.navigate('MessageForm')}>
        <FabText>+</FabText>
      </FloatingActionButton>
    </GradientBackground>
  );
};

export default MessageListScreen;