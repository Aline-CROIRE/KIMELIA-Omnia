// services/gmailService.js
const { google } = require('googleapis');
const { getGoogleOAuth2Client } = require('./googleApiService');
const Message = require('../models/Message');
const User = require('../models/User'); // Required to update gmail.lastSync/historyId
const { summarizeText } = require('./aiService');

/**
 * @function getGmailClient
 * @description Creates an authorized Google Gmail API client for a given user.
 * @param {Object} user - The Omnia user object.
 * @returns {Promise<google.gmail.Gmail>} An authorized Google Gmail API client.
 * @throws {Error} If tokens are invalid or refresh fails.
 */
const getGmailClient = async (user) => {
  const oauth2Client = await getGoogleOAuth2Client(user);
  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * @function fetchAndSummarizeGmailInbox
 * @description Fetches recent emails from Gmail inbox, summarizes them using AI, and stores as Omnia Messages.
 * @param {string} userId - The Omnia user ID.
 * @param {number} [maxResults=10] - Max number of emails to fetch.
 * @returns {Promise<{success: boolean, message: string, syncedCount: number}>}
 */
const fetchAndSummarizeGmailInbox = async (userId, maxResults = 10) => {
    const user = await User.findById(userId); // Fetch user to get lastSync and update it
    if (!user || !user.gmail?.connected) {
        throw new Error('Gmail integration not connected for this user.');
    }

    const gmail = await getGmailClient(user);
    let syncedCount = 0;
    let newHistoryId = user.gmail.historyId; // For incremental sync


    try {
        const listOptions = {
            userId: 'me',
            labelIds: ['INBOX'],
            maxResults: maxResults,
        };

        if (user.gmail.lastSync) {
            // For true incremental sync, history.list is better.
            // For simplicity, we filter messages by date after last sync.
            // This is not foolproof as it might miss messages with older dates that arrived recently.
            listOptions.q = `after:${Math.floor(user.gmail.lastSync.getTime() / 1000)}`;
        }


        const listResponse = await gmail.users.messages.list(listOptions);

        const messages = listResponse.data.messages;
        if (!messages || messages.length === 0) {
            return { success: true, message: 'No new Gmail messages to summarize.', syncedCount: 0 };
        }

        // The highest historyId in the response.
        // For robust incremental sync, this would be retrieved via `gmail.users.history.list` from the old `historyId`.
        if (listResponse.data.historyId) {
             newHistoryId = listResponse.data.historyId;
        }

        for (const msg of messages) {
            const getResponse = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full', // Fetch full email content
            });

            const email = getResponse.data;

            const headers = email.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender';
            const dateHeader = headers.find(h => h.name === 'Date')?.value;
            const emailDate = dateHeader ? new Date(dateHeader) : new Date(parseInt(email.internalDate)); // Prefer Date header, fallback to internalDate


            // Extract email body (can be complex with multipart emails)
            let emailBody = '';
            const getEmailBody = (payload) => {
                if (payload.parts) {
                    for (const part of payload.parts) {
                        const body = getEmailBody(part);
                        if (body) return body;
                    }
                } else if (payload.body && payload.body.data) {
                    // Only decode if it's text/plain or text/html
                    if (payload.mimeType === 'text/plain' || payload.mimeType === 'text/html') {
                        return Buffer.from(payload.body.data, 'base64').toString('utf8');
                    }
                }
                return null;
            };
            emailBody = getEmailBody(email.payload) || '';


            if (!emailBody || emailBody.length < 100) {
                console.log(`Skipping short/empty email ${subject} from ${from} for summarization.`);
                continue;
            }

            // Summarize using AI
            const summary = await summarizeText(emailBody, `Summarize the following email from "${from}" with subject "${subject}" from the user's perspective, focusing on key information and any implied action items:`);

            // Store as Omnia Message (type: email_summary)
            await Message.create({
                user: userId,
                type: 'email_summary',
                subject: subject,
                content: summary,
                source: 'gmail',
                externalReferenceId: email.id, // Store Gmail message ID for future reference
                tags: ['gmail', 'summary', from.includes('noreply') ? 'automated' : ''],
                createdAt: emailDate,
            });
            syncedCount++;
            console.log(`Summarized Gmail: "${subject}" by ${from}`);
        }

        // Update user's lastSync and historyId
        user.gmail.lastSync = new Date();
        user.gmail.historyId = newHistoryId;
        await user.save();

        return { success: true, message: `Successfully fetched and summarized ${syncedCount} new Gmail messages.`, syncedCount };
    } catch (error) {
        console.error('Error fetching/summarizing Gmail inbox:', error.message);
        if (error.response?.data) {
            console.error('Gmail API error details:', error.response.data);
        }
        throw new Error('Failed to fetch and summarize Gmail inbox: ' + error.message);
    }
};

/**
 * @function sendGmailDraft
 * @description Sends a drafted email via Gmail.
 * @param {string} userId - The Omnia user ID.
 * @param {string} to - Recipient email address(es) (comma-separated).
 * @param {string} subject - Email subject.
 * @param {string} bodyText - Plain text body of the email.
 * @param {string} [replyToMessageId] - Optional Gmail message ID to reply to.
 * @returns {Promise<{success: boolean, message: string, gmailMessageId: string}>}
 */
const sendGmailDraft = async (userId, to, subject, bodyText, replyToMessageId = null) => {
    const user = await User.findById(userId);
    if (!user || !user.gmail?.connected) {
        throw new Error('Gmail integration not connected for this user.');
    }

    const gmail = await getGmailClient(user);

    try {
        // Construct the raw email message
        const emailLines = [
            `From: ${user.email}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/plain; charset="UTF-8"`,
            `Content-Transfer-Encoding: base64`,
            '',
            bodyText,
        ];

        // If replying, fetch original message to get threadId
        let threadId;
        if (replyToMessageId) {
            try {
                const originalMessage = await gmail.users.messages.get({
                    userId: 'me',
                    id: replyToMessageId,
                    format: 'metadata',
                    headers: ['In-Reply-To', 'References'],
                });
                threadId = originalMessage.data.threadId;

                // Add In-Reply-To and References headers for proper threading
                const inReplyToHeader = originalMessage.data.payload.headers.find(h => h.name === 'Message-ID')?.value;
                if (inReplyToHeader) emailLines.splice(3, 0, `In-Reply-To: ${inReplyToHeader}`); // Insert before Subject

                const referencesHeader = originalMessage.data.payload.headers.find(h => h.name === 'References')?.value;
                if (referencesHeader) emailLines.splice(3, 0, `References: ${referencesHeader} ${inReplyToHeader}`); // Insert before In-Reply-To
                else if (inReplyToHeader) emailLines.splice(3, 0, `References: ${inReplyToHeader}`);
            } catch (replyError) {
                console.warn(`Could not fetch original message for reply-to threading: ${replyError.message}`);
                // Proceed without threading if original message details cannot be fetched
            }
        }


        const rawEmail = emailLines.join('\n');

        const encodedEmail = Buffer.from(rawEmail)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, ''); // URL-safe base64 encoding


        const messagePayload = {
            raw: encodedEmail,
            threadId: threadId, // Add threadId if it's a reply
        };


        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: messagePayload,
        });

        console.log(`Email sent from ${user.email} to ${to}: "${subject}"`);
        return { success: true, message: 'Email sent successfully via Gmail.', gmailMessageId: res.data.id };
    } catch (error) {
        console.error('Error sending email via Gmail:', error.message);
        if (error.response?.data) {
            console.error('Gmail API error details:', error.response.data);
        }
        throw new Error('Failed to send email via Gmail: ' + error.message);
    }
};

/**
 * @function disconnectGmail
 * @description Disconnects Gmail integration by clearing flags and history.
 * @param {string} userId - The Omnia user ID.
 */
const disconnectGmail = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found.');
    }

    user.gmail = undefined; // Clear the entire object
    await user.save();
    return { success: true, message: 'Gmail integration disconnected successfully.' };
};

module.exports = {
  getGmailClient,
  fetchAndSummarizeGmailInbox,
  sendGmailDraft,
  disconnectGmail,
};
