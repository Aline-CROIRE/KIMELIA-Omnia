
// services/googleApiService.js
const { google } = require('googleapis');
const User = require('../models/User');

const OAuth2 = google.auth.OAuth2;

// Initialize OAuth2 client
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Define Google API scopes (combining Calendar and Gmail)
const GOOGLE_API_SCOPES = [
  'https://www.googleapis.com/auth/calendar',      // Full calendar access
  'https://www.googleapis.com/auth/gmail.modify',  // Read, compose, send, and delete Gmail messages
  // Add other Google scopes here if needed (e.g., Drive, Contacts)
];

/**
 * @function getGoogleAuthURL
 * @description Generates the URL for initiating Google OAuth2 authorization flow.
 * @returns {string} The authorization URL.
 */
const getGoogleAuthURL = () => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    scope: GOOGLE_API_SCOPES, // Use combined scopes
    prompt: 'consent', // Always ask for consent, especially for refresh token
  });
  return url;
};

/**
 * @function handleGoogleOAuthCallback
 * @description Handles the OAuth2 callback from Google, exchanges code for tokens, and stores them.
 * This is a generic handler for any Google integration.
 * @param {string} code - The authorization code from Google.
 * @param {string} userId - The ID of the authenticated user in Omnia.
 * @returns {Promise<{success: boolean, message: string}>}
 */
const handleGoogleOAuthCallback = async (code, userId) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: 'Omnia user not found.' };
    }

    // Store generic Google tokens. Calendar/Gmail specific flags/syncs will be handled later.
    // For now, we'll store them under `googleCalendar` for simplicity, assuming primary Google integration point.
    // In a more complex app, a top-level `user.google` object might be better.
    user.googleCalendar = { // Re-using this object for generic Google tokens
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || user.googleCalendar?.refreshToken, // Use existing refresh token if not provided (only on first auth)
      lastSync: new Date(),
      calendarId: user.googleCalendar?.calendarId || 'primary', // Keep existing calendarId or default
    };
    user.gmail = { // Mark Gmail as connected
        connected: true,
        lastSync: new Date(),
        historyId: user.gmail?.historyId, // Keep existing historyId
    };
    await user.save();

    return { success: true, message: 'Google services (Calendar, Gmail) connected successfully!' };
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error.message);
    throw new Error('Failed to connect Google services: ' + error.message);
  }
};

/**
 * @function getGoogleOAuth2Client
 * @description Creates an authorized Google OAuth2 client for a given user.
 * Automatically refreshes access token if expired.
 * @param {Object} user - The Omnia user object, containing googleCalendar tokens.
 * @returns {Promise<google.auth.OAuth2>} An authorized Google OAuth2 client.
 * @throws {Error} If tokens are invalid or refresh fails.
 */
const getGoogleOAuth2Client = async (user) => {
  if (!user.googleCalendar || !user.googleCalendar.refreshToken) {
    throw new Error('Google services not connected or refresh token missing.');
  }

  oauth2Client.setCredentials({
    access_token: user.googleCalendar.accessToken,
    refresh_token: user.googleCalendar.refreshToken,
  });

  // Automatically refresh token if expired and update in DB
  oauth2Client.on('tokens', async (tokens) => {
    // Note: On subsequent refreshes, tokens.refresh_token might not be present.
    // Only update if a new one is explicitly provided.
    const updateFields = {
        'googleCalendar.accessToken': tokens.access_token,
        'googleCalendar.lastSync': new Date(),
    };
    if (tokens.refresh_token) {
        updateFields['googleCalendar.refreshToken'] = tokens.refresh_token;
    }
    await User.findByIdAndUpdate(user._id, updateFields);
    console.log(`Access token refreshed for user ${user.email} for Google services.`);
  });

  return oauth2Client;
};

/**
 * @function disconnectGoogleIntegration
 * @description Disconnects all Google integrations by clearing tokens and potentially revoking access.
 * @param {string} userId - The Omnia user ID.
 */
const disconnectGoogleIntegration = async (userId) => {
    const user = await User.findById(userId).select('+googleCalendar.refreshToken');
    if (!user) {
        throw new Error('User not found.');
    }

    try {
        if (user.googleCalendar?.refreshToken) {
            await oauth2Client.revokeToken(user.googleCalendar.refreshToken);
            console.log(`Google Refresh token revoked for user ${user.email}`);
        }
    } catch (error) {
        console.warn(`Could not revoke Google Refresh token for user ${user.email}:`, error.message);
    }

    user.googleCalendar = undefined; // Clear calendar integration data
    user.gmail = undefined;          // Clear gmail integration data
    await user.save();
    return { success: true, message: 'All Google services disconnected successfully.' };
};


module.exports = {
  getGoogleAuthURL,
  handleGoogleOAuthCallback,
  getGoogleOAuth2Client,
  disconnectGoogleIntegration,
  GOOGLE_API_SCOPES,
};
