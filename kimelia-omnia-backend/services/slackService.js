const { WebClient } = require('@slack/web-api');
const axios = require('axios'); // For making HTTP requests for OAuth
const User = require('../models/User'); // To update user tokens

// Define Slack API scopes for OAuth URL
const SLACK_SCOPES = [
  'chat:write',
  'chat:write.customize',
  'channels:read',
  'groups:read',
  'im:read',
  'mpim:read',
  'users:read',
  'users:read.email',
  'channels:history',
  'groups:history',
  'im:history',
  'mpim:history',
  // Add more scopes as needed, e.g., 'commands', 'users.profile:read'
];

/**
 * @function getSlackAuthURL
 * @description Generates the URL for initiating Slack OAuth2 authorization flow.
 * @returns {string} The authorization URL.
 */
const getSlackAuthURL = (userId) => { // userId is passed as state for CSRF protection
  const authUrl = `https://slack.com/oauth/v2/authorize?` +
    `client_id=${process.env.SLACK_CLIENT_ID}&` +
    `scope=${SLACK_SCOPES.join(',')}&` +
    `redirect_uri=${process.env.SLACK_REDIRECT_URI}&` +
    `state=${userId}`; // Pass Omnia userId as state

  return authUrl;
};

/**
 * @function handleSlackCallback
 * @description Handles the OAuth2 callback from Slack, exchanges code for tokens, and stores them.
 * @param {string} code - The authorization code from Slack.
 * @param {string} userId - The ID of the authenticated user in Omnia (from state).
 * @returns {Promise<{success: boolean, message: string}>}
 */
const handleSlackCallback = async (code, userId) => {
  try {
    const tokenResponse = await axios.post('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: code,
        redirect_uri: process.env.SLACK_REDIRECT_URI,
      },
    });

    const data = tokenResponse.data;

    if (!data.ok) {
      throw new Error(`Slack OAuth Error: ${data.error}`);
    }

    // Store tokens and team info in user's profile
    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'Omnia user not found.' };
    }

    user.slack = {
      accessToken: data.access_token, // This is the bot token (xoxb-)
      teamId: data.team.id,
      userId: data.authed_user.id, // The user who authorized the app
      botUserId: data.bot_user_id,
      scope: data.scope,
      lastSync: new Date(),
    };
    await user.save();

    return { success: true, message: 'Slack workspace connected successfully!' };
  } catch (error) {
    console.error('Error handling Slack callback:', error.message);
    throw new Error('Failed to connect Slack: ' + error.message);
  }
};

/**
 * @function getSlackWebClient
 * @description Gets an initialized Slack WebClient for a given user.
 * @param {Object} user - The Omnia user object, containing slack.accessToken.
 * @returns {WebClient} An authorized Slack WebClient.
 * @throws {Error} If Slack integration is not configured for the user.
 */
const getSlackWebClient = (user) => {
  if (!user.slack || !user.slack.accessToken) {
    throw new Error('Slack integration not configured for this user.');
  }
  return new WebClient(user.slack.accessToken);
};

/**
 * @function sendMessageToSlack
 * @description Sends a message to a specified Slack channel or user.
 * @param {string} userId - The Omnia user ID.
 * @param {string} channelId - The Slack channel ID (e.g., C12345, D12345 for DM) or channel name.
 * @param {string} text - The message text.
 * @param {Object} [options={}] - Additional Slack API options (e.g., as_user, blocks).
 * @returns {Promise<Object>} Slack API response.
 */
const sendMessageToSlack = async (userId, channelId, text, options = {}) => {
  const user = await User.findById(userId).select('+slack.accessToken');
  if (!user || !user.slack?.accessToken) {
    throw new Error('Slack integration not active for this user.');
  }

  const client = getSlackWebClient(user);
  try {
    const res = await client.chat.postMessage({
      channel: channelId,
      text: text,
      ...options,
    });
    console.log(`Message sent to Slack channel ${channelId}`);
    return res;
  } catch (error) {
    console.error(`Error sending message to Slack channel ${channelId}:`, error.message);
    throw new Error(`Failed to send message to Slack: ${error.message}`);
  }
};

/**
 * @function getSlackChannels
 * @description Fetches public and private channels the bot is in, or all channels.
 * @param {string} userId - The Omnia user ID.
 * @param {boolean} [all=false] - If true, fetches all channels (bot needs appropriate scopes).
 * @returns {Promise<Array<Object>>} List of Slack channels.
 */
const getSlackChannels = async (userId, all = false) => {
    const user = await User.findById(userId).select('+slack.accessToken');
    if (!user || !user.slack?.accessToken) {
        throw new Error('Slack integration not active for this user.');
    }
    const client = getSlackWebClient(user);
    try {
        const response = await client.conversations.list({
            types: 'public_channel,private_channel,im,mpim',
            exclude_archived: true,
            limit: 100,
        });
        if (!response.ok) {
            throw new Error(response.error);
        }
        return response.channels;
    } catch (error) {
        console.error('Error fetching Slack channels:', error.message);
        throw new Error(`Failed to fetch Slack channels: ${error.message}`);
    }
};

/**
 * @function summarizeSlackChannel
 * @description Fetches recent messages from a Slack channel and uses AI to summarize them.
 * @param {string} userId - The Omnia user ID.
 * @param {string} channelId - The Slack channel ID.
 * @param {number} [count=50] - Number of messages to fetch for summarization.
 * @returns {Promise<string>} AI-generated summary of channel messages.
 * @throws {Error} If Slack integration is not configured or AI summarization fails.
 */
const summarizeSlackChannel = async (userId, channelId, count = 50) => {
  const user = await User.findById(userId).select('+slack.accessToken');
  if (!user || !user.slack?.accessToken) {
    throw new Error('Slack integration not active for this user.');
  }

  const client = getSlackWebClient(user);
  try {
    const history = await client.conversations.history({
      channel: channelId,
      limit: count,
    });

    if (!history.ok) {
      throw new Error(`Slack history error: ${history.error}`);
    }

    const messages = history.messages
      .filter(msg => msg.type === 'message' && msg.text) // Filter out non-message events
      .map(msg => msg.text)
      .join('\n');

    if (!messages) {
      return 'No recent messages to summarize in this channel.';
    }

    // Use our existing AI service for summarization
    const { summarizeText } = require('./aiService'); // Dynamically require to avoid circular dep.
    const summary = await summarizeText(messages, `Summarize the following Slack channel discussion from ${user.name}'s perspective, identifying key topics, decisions, and action items:`);

    return summary;
  } catch (error) {
    console.error(`Error summarizing Slack channel ${channelId}:`, error.message);
    throw new Error(`Failed to summarize Slack channel: ${error.message}`);
  }
};


/**
 * @function disconnectSlack
 * @description Disconnects Slack by clearing tokens.
 * @param {string} userId - The Omnia user ID.
 */
const disconnectSlack = async (userId) => {
    const user = await User.findById(userId);
    if (!user || !user.slack?.accessToken) {
        throw new Error('Slack integration not configured for this user.');
    }

    // Slack doesn't have a simple token revoke endpoint for bot tokens in this context
    // So clearing from DB is sufficient for user-side disconnection.
    user.slack = undefined;
    await user.save();
    return { success: true, message: 'Slack disconnected successfully.' };
};


module.exports = {
  getSlackAuthURL,
  handleSlackCallback,
  sendMessageToSlack,
  getSlackChannels,
  summarizeSlackChannel,
  disconnectSlack,
};