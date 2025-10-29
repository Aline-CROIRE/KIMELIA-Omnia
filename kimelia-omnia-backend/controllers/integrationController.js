const asyncHandler = require('../utils/asyncHandler');
// Google API Imports (Generic)
const {
    getGoogleAuthURL,
    handleGoogleOAuthCallback,
    disconnectGoogleIntegration,
} = require('../services/googleApiService');
// Google Calendar Imports (Specific)
const {
  syncOmniaEventsToGoogle,
  syncGoogleEventsToOmnia,
} = require('../services/googleCalendarService');
// Gmail Imports (Specific)
const {
    fetchAndSummarizeGmailInbox,
    sendGmailDraft,
    disconnectGmail,
} = require('../services/gmailService');
// Slack Imports
const {
    getSlackAuthURL,
    handleSlackCallback,
    sendMessageToSlack,
    getSlackChannels,
    summarizeSlackChannel,
    disconnectSlack,
} = require('../services/slackService');
// Notion Imports (REMOVED)
// Microsoft Teams Imports (REMOVED)


const Event = require('../models/Event');
const User = require('../models/User');
const Message = require('../models/Message');

// --- Google (Generic) & Calendar Specific Controllers ---

// @desc    Initiate Google Calendar/Gmail OAuth2 authorization (uses generic Google flow)
// @route   GET /api/v1/integrations/google/auth
// @access  Private (but initiated by frontend)
const initiateGoogleAuth = asyncHandler(async (req, res) => {
  const authUrl = getGoogleAuthURL(); // From generic Google API service
  const userId = req.user._id.toString();
  const redirectAuthUrl = `${authUrl}&state=${userId}`;

  res.status(200).json({ success: true, message: 'Redirect to Google for authorization.', authUrl: redirectAuthUrl });
});

// @desc    Google OAuth2 callback handler (generic for Calendar/Gmail)
// @route   GET /api/v1/integrations/google/callback
// @access  Public (Google redirects here)
const googleAuthCallback = asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;
  const frontendRedirectBase = process.env.FRONTEND_POST_AUTH_REDIRECT_URL || 'http://localhost:3000/integrations';

  if (error) {
    console.error('Google OAuth Callback Error:', error);
    return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Google authorization failed.')}`);
  }
  if (!code) {
    return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Authorization code missing.')}`);
  }

  const userId = state;
  if (!userId) {
      console.error('Google OAuth Callback Error: Missing user ID in state.');
      return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Security error: User ID missing from state.')}`);
  }

  try {
    const result = await handleGoogleOAuthCallback(code, userId); // Use generic handler
    if (result.success) {
        res.redirect(`${frontendRedirectBase}?status=success&message=${encodeURIComponent('Google services connected!')}`);
    } else {
        res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent(result.message)}`);
    }
  } catch (err) {
    console.error('Error during Google OAuth callback processing:', err.message);
    res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Failed to connect Google services: ' + err.message)}`);
  }
});

// @desc    Sync Omnia events to Google Calendar
// @route   POST /api/v1/integrations/google-calendar/sync-to-google
// @access  Private
const syncEventsToGoogleController = asyncHandler(async (req, res) => {
    const omniaEvents = await Event.find({ user: req.user._id, endTime: { $gte: new Date() }, status: { $ne: 'cancelled' } });
    const result = await syncOmniaEventsToGoogle(req.user._id, omniaEvents);
    res.status(200).json({ success: true, message: result.message, syncedCount: result.syncedCount });
});

// @desc    Sync Google Calendar events to Omnia
// @route   POST /api/v1/integrations/google-calendar/sync-to-omnia
// @access  Private
const syncEventsFromGoogleController = asyncHandler(async (req, res) => {
    const minTime = req.user.googleCalendar?.lastSync || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const result = await syncGoogleEventsToOmnia(req.user._id, minTime);
    res.status(200).json({ success: true, message: result.message, syncedCount: result.syncedCount });
});


// --- Gmail Specific Controllers ---

// @desc    Fetch and summarize recent Gmail inbox messages
// @route   POST /api/v1/integrations/gmail/summarize-inbox
// @access  Private
const summarizeGmailInboxController = asyncHandler(async (req, res) => {
    const { maxResults } = req.body;
    const result = await fetchAndSummarizeGmailInbox(req.user._id, maxResults);
    res.status(200).json({ success: true, message: result.message, syncedCount: result.syncedCount });
});

// @desc    Send a drafted email via Gmail
// @route   POST /api/v1/integrations/gmail/send-draft
// @access  Private
const sendGmailDraftedEmailController = asyncHandler(async (req, res) => {
    const { to, subject, bodyText, replyToMessageId } = req.body;
    if (!to || !subject || !bodyText) {
        res.status(400);
        throw new Error('Please provide recipient(s), subject, and body text for the email.');
    }
    const result = await sendGmailDraft(req.user._id, to, subject, bodyText, replyToMessageId);
    res.status(200).json({ success: true, message: result.message, gmailMessageId: result.gmailMessageId });
});


// @desc    Disconnect ALL Google Integrations (Calendar & Gmail)
// @route   POST /api/v1/integrations/google/disconnect-all
// @access  Private
const disconnectAllGoogleIntegrations = asyncHandler(async (req, res) => {
    const result = await disconnectGoogleIntegration(req.user._id);
    res.status(200).json({ success: true, message: result.message });
});


// --- Slack Specific Controllers (existing) ---

// @desc    Initiate Slack OAuth2 authorization
// @route   GET /api/v1/integrations/slack/auth
// @access  Private (but initiated by frontend)
const initiateSlackAuth = asyncHandler(async (req, res) => {
    const userId = req.user._id.toString();
    const authUrl = getSlackAuthURL(userId);
    res.status(200).json({ success: true, message: 'Redirect to Slack for authorization.', authUrl: authUrl });
});

// @desc    Slack OAuth2 callback handler
// @route   GET /api/v1/integrations/slack/callback
// @access  Public (Slack redirects here)
const slackAuthCallback = asyncHandler(async (req, res) => {
    const { code, state, error } = req.query;
    const frontendRedirectBase = process.env.FRONTEND_POST_AUTH_REDIRECT_URL || 'http://localhost:3000/integrations';
    if (error) { console.error('Slack OAuth Callback Error:', error); return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Slack authorization failed.')}`); }
    if (!code) { return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Authorization code missing.')}`); }
    const userId = state;
    if (!userId) { console.error('Slack OAuth Callback Error: Missing user ID in state.'); return res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Security error: User ID missing from state.')}`); }
    try {
      const result = await handleSlackCallback(code, userId);
      if (result.success) { res.redirect(`${frontendRedirectBase}?status=success&message=${encodeURIComponent('Slack connected successfully!')}`); }
      else { res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent(result.message)}`); }
    } catch (err) { console.error('Error during Slack callback processing:', err.message); res.redirect(`${frontendRedirectBase}?status=error&message=${encodeURIComponent('Failed to connect Slack: ' + err.message)}`); }
});

const getSlackChannelsForUser = asyncHandler(async (req, res) => {
    const channels = await getSlackChannels(req.user._id);
    res.status(200).json({ success: true, count: channels.length, data: channels });
});

const sendSlackMessage = asyncHandler(async (req, res) => {
    const { channelId, text, options } = req.body;
    if (!channelId || !text) { res.status(400); throw new Error('Please provide both a channelId and message text.'); }
    const result = await sendMessageToSlack(req.user._id, channelId, text, options);
    res.status(200).json({ success: true, message: 'Message sent to Slack successfully!', data: result });
});

const summarizeSlackChannelDiscussion = asyncHandler(async (req, res) => {
    const { channelId, count } = req.body;
    if (!channelId) { res.status(400); throw new Error('Please provide a channelId to summarize.'); }
    const summary = await summarizeSlackChannel(req.user._id, channelId, count);
    res.status(200).json({ success: true, message: 'Slack channel discussion summarized by AI.', data: { summary } });
});

const disconnectSlackIntegration = asyncHandler(async (req, res) => {
    const result = await disconnectSlack(req.user._id);
    res.status(200).json({ success: true, message: result.message });
});


// Notion Controllers removed
// Microsoft Teams Controllers removed


module.exports = {
  // Google General Auth (for Calendar & Gmail)
  initiateGoogleAuth,
  googleAuthCallback,
  disconnectAllGoogleIntegrations,
  // Google Calendar Specific
  syncEventsToGoogle: syncEventsToGoogleController,
  syncEventsFromGoogle: syncEventsFromGoogleController,
  // Gmail Specific
  summarizeGmailInbox: summarizeGmailInboxController,
  sendGmailDraftedEmail: sendGmailDraftedEmailController,
  // Slack
  initiateSlackAuth,
  slackAuthCallback,
  getSlackChannelsForUser,
  sendSlackMessage,
  summarizeSlackChannelDiscussion,
  disconnectSlackIntegration,
};