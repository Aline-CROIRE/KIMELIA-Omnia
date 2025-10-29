const express = require('express');
const {
  // Google General Auth (for Calendar & Gmail)
  initiateGoogleAuth,
  googleAuthCallback,
  disconnectAllGoogleIntegrations,
  // Google Calendar Specific
  syncEventsToGoogle,
  syncEventsFromGoogle,
  // Gmail Specific
  summarizeGmailInbox,
  sendGmailDraftedEmail,
  // Slack
  initiateSlackAuth,
  slackAuthCallback,
  getSlackChannelsForUser,
  sendSlackMessage,
  summarizeSlackChannelDiscussion,
  disconnectSlackIntegration,
  // Notion removed
  // Microsoft Teams removed
} = require('../controllers/integrationController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateSlackMessage,
    validateSummarizeSlackChannel,
    // Notion validation schemas removed
    // Microsoft Teams validation schemas removed
    validateSummarizeGmailInbox,
    validateSendGmailDraft,
} = require('../middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Integrations (Google Services)
 *     description: Generic API for integrating KIMELIA Omnia with Google Calendar and Gmail.
 *   - name: Integrations (Google Calendar)
 *     description: Specific API endpoints for Google Calendar functionalities.
 *   - name: Integrations (Gmail)
 *     description: Specific API endpoints for Gmail functionalities (read, summarize, send).
 *   - name: Integrations (Slack)
 *     description: API for integrating KIMELIA Omnia with Slack for messaging and channel summaries.
 */

// --- Google General OAuth Routes (for Calendar & Gmail) ---

/**
 * @swagger
 * /integrations/google/auth:
 *   get:
 *     summary: Initiate Google OAuth2 authorization for Calendar and Gmail.
 *     description: Directs the user to Google's consent screen to authorize KIMELIA Omnia to access their Google Calendar and Gmail. The backend will then handle the callback.
 *     tags: [Integrations (Google Services)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the Google authorization URL to which the frontend should redirect.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Redirect to Google for authorization." }
 *                 authUrl: { type: string, example: "https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar%20https://www.googleapis.com/auth/gmail.modify&access_type=offline&prompt=consent&state=60d0fe4f5b5f7e001c0d3a7b&redirect_uri=http://localhost:5000/api/v1/integrations/google/callback&client_id=YOUR_CLIENT_ID&response_type=code" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/google/auth', protect, initiateGoogleAuth);

/**
 * @swagger
 * /integrations/google/callback:
 *   get:
 *     summary: Google OAuth2 callback handler (Internal, for Calendar & Gmail).
 *     description: This endpoint is for Google to redirect to after user authorization. It should not be called directly by the frontend. It exchanges the authorization code for tokens and redirects to the frontend with success/error status.
 *     tags: [Integrations (Google Services)]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The authorization code from Google.
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: true
 *         description: The Omnia user ID passed during initiation.
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         required: false
 *         description: Error message from Google if authorization failed.
 *     responses:
 *       302:
 *         description: Redirects to frontend `FRONTEND_POST_AUTH_REDIRECT_URL` with `status=success` or `status=error`.
 *       500:
 *         description: Should not be reached if redirect works, but included for completeness.
 */
router.get('/google/callback', googleAuthCallback); // Public endpoint for Google redirect

/**
 * @swagger
 * /integrations/google/disconnect-all:
 *   post:
 *     summary: Disconnect ALL Google Integrations (Calendar & Gmail).
 *     description: Revokes Google access and clears all associated tokens from the user's profile for Calendar and Gmail.
 *     tags: [Integrations (Google Services)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All Google integrations disconnected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "All Google services disconnected successfully." }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/google/disconnect-all', protect, disconnectAllGoogleIntegrations);


// --- Google Calendar Specific Routes ---

/**
 * @swagger
 * /integrations/google-calendar/sync-to-google:
 *   post:
 *     summary: Sync Omnia events to Google Calendar.
 *     description: Pushes the user's current Omnia events (future and non-cancelled) to their linked Google Calendar. Requires prior Google authorization.
 *     tags: [Integrations (Google Calendar)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events synced successfully to Google Calendar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Successfully synced 3 Omnia events to Google Calendar." }
 *                 syncedCount: { type: number, example: 3 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/google-calendar/sync-to-google', protect, syncEventsToGoogle);

/**
 * @swagger
 * /integrations/google-calendar/sync-to-omnia:
 *   post:
 *     summary: Sync Google Calendar events to Omnia.
 *     description: Pulls events from the user's linked Google Calendar into their Omnia Event manager. Requires prior Google authorization.
 *     tags: [Integrations (Google Calendar)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events synced successfully from Google Calendar to Omnia.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Successfully synced 5 Google events to Omnia." }
 *                 syncedCount: { type: number, example: 5 }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/google-calendar/sync-to-omnia', protect, syncEventsFromGoogle);


// --- Gmail Specific Routes ---

/**
 * @swagger
 * /integrations/gmail/summarize-inbox:
 *   post:
 *     summary: Fetch and AI-summarize recent Gmail inbox messages.
 *     description: Fetches a specified number of recent emails from the user's Gmail inbox, uses AI to summarize their content, and stores these summaries as Omnia Messages. Requires prior Google authorization.
 *     tags: [Integrations (Gmail)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxResults:
 *                 type: number
 *                 description: Maximum number of recent emails to fetch and summarize (default 10).
 *                 minimum: 1
 *                 maximum: 50
 *                 example: 5
 *     responses:
 *       200:
 *         description: Gmail messages fetched and summarized successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Successfully fetched and summarized 3 new Gmail messages." }
 *                 syncedCount: { type: number, example: 3 }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/gmail/summarize-inbox', protect, validateSummarizeGmailInbox, summarizeGmailInbox);

/**
 * @swagger
 * /integrations/gmail/send-draft:
 *   post:
 *     summary: Send a drafted email via Gmail.
 *     description: Sends an email through the user's connected Gmail account. Requires prior Google authorization.
 *     tags: [Integrations (Gmail)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, subject, bodyText]
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address(es) (comma-separated for multiple).
 *                 example: "recipient@example.com,cc@example.com"
 *               subject:
 *                 type: string
 *                 description: Subject of the email.
 *                 example: "Follow-up from our meeting"
 *               bodyText:
 *                 type: string
 *                 description: Plain text content of the email.
 *                 example: "Hi, just following up on our discussion from yesterday regarding..."
 *               replyToMessageId:
 *                 type: string
 *                 description: Optional. Gmail message ID to reply to (for threading).
 *                 example: "172abcd1234efgh"
 *     responses:
 *       200:
 *         description: Email sent successfully via Gmail.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Email sent successfully via Gmail." }
 *                 gmailMessageId: { type: string, example: "172abcd1234efgh" }
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/gmail/send-draft', protect, validateSendGmailDraft, sendGmailDraftedEmail);


// --- Slack Specific Routes ---
router.get('/slack/auth', protect, initiateSlackAuth);
router.get('/slack/callback', slackAuthCallback);
router.get('/slack/channels', protect, getSlackChannelsForUser);
router.post('/slack/send-message', protect, validateSlackMessage, sendSlackMessage);
router.post('/slack/summarize-channel', protect, validateSummarizeSlackChannel, summarizeSlackChannelDiscussion);
router.post('/slack/disconnect', protect, disconnectSlackIntegration);

module.exports = router;