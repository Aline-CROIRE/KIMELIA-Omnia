
// services/googleCalendarService.js
const { google } = require('googleapis');
const { getGoogleOAuth2Client } = require('./googleApiService'); // Import generic Google API Service
const User = require('../models/User'); // To update user tokens if needed
const Event = require('../models/Event'); // To sync events

/**
 * @function getGoogleCalendarClient
 * @description Creates an authorized Google Calendar API client for a given user.
 * @param {Object} user - The Omnia user object.
 * @returns {Promise<google.calendar.Calendar>} An authorized Google Calendar API client.
 * @throws {Error} If tokens are invalid or refresh fails.
 */
const getGoogleCalendarClient = async (user) => {
  const oauth2Client = await getGoogleOAuth2Client(user);
  return google.calendar({ version: 'v3', auth: oauth2Client });
};


/**
 * @function syncOmniaEventsToGoogle
 * @description Syncs Omnia events to the user's Google Calendar.
 * @param {string} userId - The Omnia user ID.
 * @param {Array<Object>} omniaEvents - Array of Omnia Event objects.
 * @returns {Promise<{success: boolean, message: string, syncedCount: number}>}
 */
const syncOmniaEventsToGoogle = async (userId, omniaEvents) => {
    const user = await User.findById(userId).select('+googleCalendar.accessToken +googleCalendar.refreshToken');
    if (!user || !user.googleCalendar?.refreshToken) {
        throw new Error('Google Calendar not configured for this user.');
    }

    const calendar = await getGoogleCalendarClient(user);
    const calendarId = user.googleCalendar.calendarId || 'primary';
    let syncedCount = 0;

    for (const omniaEvent of omniaEvents) {
        const googleEvent = {
            summary: omniaEvent.title,
            description: omniaEvent.description,
            location: omniaEvent.location,
            start: {
                dateTime: omniaEvent.startTime.toISOString(),
                timeZone: user.settings?.timezone || 'UTC',
            },
            end: {
                dateTime: omniaEvent.endTime.toISOString(),
                timeZone: user.settings?.timezone || 'UTC',
            },
            extendedProperties: {
                private: {
                    omniaEventId: omniaEvent._id.toString(),
                },
            },
        };

        try {
            // For simplicity, we'll always insert new events.
            // A more advanced sync would check for existing event via extendedProperties.
            const res = await calendar.events.insert({
                calendarId: calendarId,
                resource: googleEvent,
            });
            console.log(`Event "${omniaEvent.title}" synced to Google Calendar: ${res.data.htmlLink}`);
            syncedCount++;
        } catch (error) {
            console.error(`Failed to sync event "${omniaEvent.title}" to Google Calendar:`, error.message);
            if (error.response?.data) {
                console.error('Google API error details:', error.response.data);
            }
        }
    }

    return { success: true, message: `Successfully synced ${syncedCount} Omnia events to Google Calendar.`, syncedCount };
};

/**
 * @function syncGoogleEventsToOmnia
 * @description Syncs events from Google Calendar to Omnia's Event model.
 * @param {string} userId - The Omnia user ID.
 * @param {Date} [minTime] - Optional. Only sync events from Google Calendar starting after this time.
 * @returns {Promise<{success: boolean, message: string, syncedCount: number}>}
 */
const syncGoogleEventsToOmnia = async (userId, minTime = new Date()) => {
    const user = await User.findById(userId).select('+googleCalendar.accessToken +googleCalendar.refreshToken');
    if (!user || !user.googleCalendar?.refreshToken) {
        throw new Error('Google Calendar not configured for this user.');
    }

    const calendar = await getGoogleCalendarClient(user);
    const calendarId = user.googleCalendar.calendarId || 'primary';
    let syncedCount = 0;

    try {
        const res = await calendar.events.list({
            calendarId: calendarId,
            timeMin: minTime.toISOString(),
            showDeleted: false,
            singleEvents: true,
            maxResults: 100, // Limit to 100 events per sync for now
            orderBy: 'startTime',
        });

        const googleEvents = res.data.items;

        for (const googleEvent of googleEvents) {
            const existingOmniaEvent = await Event.findOne({
                user: userId,
                externalReferenceId: googleEvent.id,
                source: 'google_calendar'
            });

            if (existingOmniaEvent) {
                continue; // Skip existing for simplicity, a robust solution would update
            }

            const omniaEventData = {
                user: userId,
                title: googleEvent.summary || 'Google Calendar Event',
                description: googleEvent.description,
                location: googleEvent.location,
                startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
                endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
                allDay: !!googleEvent.start.date && !googleEvent.start.dateTime,
                category: 'meeting',
                attendees: googleEvent.attendees?.filter(a => a.email).map(a => a.email),
                source: 'google_calendar',
                externalReferenceId: googleEvent.id,
            };

            await Event.create(omniaEventData);
            syncedCount++;
            console.log(`Event "${googleEvent.summary}" synced from Google Calendar to Omnia.`);
        }

        return { success: true, message: `Successfully synced ${syncedCount} Google events to Omnia.`, syncedCount };
    } catch (error) {
        console.error('Error syncing Google events to Omnia:', error.message);
        if (error.response?.data) {
            console.error('Google API error details:', error.response.data);
        }
        throw new Error('Failed to sync Google events to Omnia: ' + error.message);
    }
};

module.exports = {
  getGoogleCalendarClient,
  syncOmniaEventsToGoogle,
  syncGoogleEventsToOmnia,
};
