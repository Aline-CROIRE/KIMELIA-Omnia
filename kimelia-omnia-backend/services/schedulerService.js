const cron = require('node-cron');
const { Types } = require('mongoose'); // For ObjectId conversion
const Task = require('../models/Task');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { sendEmailNotification, sendSmsNotification } = require('./notificationService'); // Import notification service

const REMINDER_BUFFER_MINUTES = parseInt(process.env.REMINDER_BUFFER_MINUTES || '10', 10); // How many minutes before due to send reminder

let reminderScheduler; // To hold the cron job instance

/**
 * @function constructReminderMessage
 * @description Constructs a general reminder message.
 * @param {string} type - Type of item (Task, Event, Goal).
 * @param {Object} item - The item object (Task, Event, Goal).
 * @param {Object} reminder - The specific reminder object.
 * @returns {string} The formatted reminder message.
 */
const constructReminderMessage = (type, item, reminder) => {
  let message = `KIMELIA Omnia Reminder: Your ${type} "${item.title}" is `;
  let timeStr;

  if (item.dueDate) { // For Tasks
    timeStr = new Date(item.dueDate).toLocaleString();
    message += `due on ${timeStr}.`;
  } else if (item.startTime) { // For Events
    timeStr = new Date(item.startTime).toLocaleString();
    message += `starting at ${timeStr}.`;
  } else if (item.targetDate) { // For Goals
    timeStr = new Date(item.targetDate).toLocaleString();
    message += `targeting ${timeStr}.`;
  }

  // Add custom reminder message if available (from Goal model mostly)
  if (reminder.message) {
      message += ` Note: "${reminder.message}"`;
  }

  return message;
};


/**
 * @function checkAndSendReminders
 * @description Checks all relevant models for upcoming unsent reminders and dispatches them.
 * This function will be run periodically by node-cron.
 */
const checkAndSendReminders = async () => {
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + REMINDER_BUFFER_MINUTES * 60 * 1000); // Reminders due within buffer

  console.log(`[Scheduler] Checking for reminders due before: ${reminderCutoff.toLocaleString()}`);

  const collectionsToCheck = [
    { model: Task, timeField: 'dueDate' },
    { model: Event, timeField: 'startTime' },
    { model: Goal, timeField: 'reminders.time' }, // Goal reminders are in a sub-array
  ];

  for (const { model, timeField } of collectionsToCheck) {
    const query = {
      user: { $exists: true }, // Ensure user field exists
      [`${timeField}`]: { $lte: reminderCutoff, $gte: now }, // Due within buffer, not in the past
      'reminders.isSent': false // Only process unsent reminders
    };

    // For Tasks and Events, timeField is directly on the document
    // For Goals, timeField is 'reminders.time', so we need to match elements in array
    if (model === Goal) {
        query[`${timeField}`] = { $lte: reminderCutoff, $gte: now }; // Match specific reminder sub-document
    } else {
        query[timeField] = { $lte: reminderCutoff, $gte: now }; // Match direct time field
    }

    const itemsWithReminders = await model.find(query).populate('user', 'email phoneNumber name');

    for (const item of itemsWithReminders) {
      // Find the specific reminders that are due and unsent
      const unsentReminders = item.reminders.filter(
        (r) => r.time <= reminderCutoff && !r.isSent
      );

      for (const reminder of unsentReminders) {
        const reminderText = constructReminderMessage(model.modelName, item, reminder);

        if (reminder.method === 'email' && item.user.email) {
          await sendEmailNotification(
            item.user.email,
            `Reminder: ${item.title}`,
            `<p>${reminderText}</p><p>You set this reminder for your ${model.modelName.toLowerCase()}.</p>`
          );
        } else if (reminder.method === 'sms' && item.user.phoneNumber) {
          await sendSmsNotification(
            item.user.phoneNumber,
            reminderText
          );
        } else if (reminder.method === 'app_notification') {
          // Future: Implement WebSocket/Push Notification here
          console.log(`[App Notification - Future]: Sending app notification for ${item.title} to user ${item.user.name}`);
        } else {
            console.warn(`[Scheduler] Skipping reminder for ${item.title}: Invalid method (${reminder.method}) or missing contact info for user ${item.user.email}.`);
        }

        // Mark the specific reminder as sent in the database
        // Need to find and update the specific sub-document
        const reminderIndex = item.reminders.findIndex(r => r._id.toString() === reminder._id.toString());
        if (reminderIndex !== -1) {
            item.reminders[reminderIndex].isSent = true;
            await item.save(); // Save the parent document to update the sub-document
            console.log(`[Scheduler] Marked reminder for ${item.title} (ID: ${reminder._id}) as sent.`);
        }
      }
    }
  }
};

/**
 * @function startReminderScheduler
 * @description Starts the cron job to check for reminders every minute.
 */
const startReminderScheduler = () => {
  if (reminderScheduler) {
    console.log('Reminder scheduler is already running.');
    return;
  }

  // Schedule to run every minute
  reminderScheduler = cron.schedule('* * * * *', () => {
    console.log('[Scheduler] Running reminder check...');
    checkAndSendReminders().catch(err => console.error('[Scheduler] Error during reminder check:', err));
  });

  console.log('Reminder scheduler started. Checking every minute.');
};

/**
 * @function stopReminderScheduler
 * @description Stops the cron job for reminders.
 */
const stopReminderScheduler = () => {
  if (reminderScheduler) {
    reminderScheduler.stop();
    reminderScheduler = null;
    console.log('Reminder scheduler stopped.');
  }
};

module.exports = {
  startReminderScheduler,
  stopReminderScheduler,
};