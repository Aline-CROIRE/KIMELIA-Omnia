const cron = require('node-cron');
const Task = require('../models/Task');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
const User = require('../models/User'); // Required for user data
const { sendEmailNotification, sendSmsNotification } = require('./notificationService'); // Import notification service

const REMINDER_BUFFER_MINUTES = parseInt(process.env.REMINDER_BUFFER_MINUTES || '10', 10); // How many minutes before due to send reminder

let reminderSchedulerJob; // To hold the node-cron job instance

/**
 * @function constructReminderMessage
 * @description Constructs a general reminder message for a notification.
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
 * @description Checks all relevant models for upcoming unsent reminders and dispatches them directly.
 * This function is run periodically by node-cron.
 */
const checkAndSendReminders = async () => {
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + REMINDER_BUFFER_MINUTES * 60 * 1000); // Reminders due within buffer

  console.log(`[Scheduler] Checking for reminders due before: ${reminderCutoff.toLocaleString()}`);

  const collectionsToCheck = [
    { model: Task, typeName: 'Task', reminderPath: 'reminders', itemDueDateField: 'dueDate', itemStartTimeField: null, itemTargetDateField: null },
    { model: Event, typeName: 'Event', reminderPath: 'reminders', itemDueDateField: null, itemStartTimeField: 'startTime', itemTargetDateField: null },
    { model: Goal, typeName: 'Goal', reminderPath: 'reminders', itemDueDateField: null, itemStartTimeField: null, itemTargetDateField: 'targetDate' },
  ];

  for (const { model, typeName, reminderPath, itemDueDateField, itemStartTimeField, itemTargetDateField } of collectionsToCheck) {
    // Find items that have reminders due soon and haven's been sent yet
    const query = {
      [`${reminderPath}.time`]: { $lte: reminderCutoff, $gte: now }, // Reminder time within the window
      [`${reminderPath}.isSent`]: false, // Ensure reminder is not yet sent
    };

    const items = await model.find(query).populate('user', 'email phoneNumber name'); // Populate user for contact info

    for (const item of items) {
      // Filter the specific reminders within this item that are due and unsent
      const unsentReminders = item.reminders.filter(
        (r) => r.time <= reminderCutoff && !r.isSent
      );

      for (const reminder of unsentReminders) {
        const reminderText = constructReminderMessage(typeName, item, reminder);

        try {
            if (reminder.method === 'email' && item.user.email) {
                await sendEmailNotification(
                    item.user.email,
                    `KIMELIA Omnia Reminder: ${item.title}`,
                    `<p>${reminderText}</p><p>You set this reminder for your ${typeName.toLowerCase()}.</p>`
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
                console.warn(`[Scheduler] Skipping reminder for ${item.title} (ID: ${reminder._id}): Invalid method (${reminder.method}) or missing contact info for user ${item.user.email}.`);
            }

            // Mark the specific reminder as sent in the database
            const reminderIndex = item.reminders.findIndex(r => r._id.toString() === reminder._id.toString());
            if (reminderIndex !== -1) {
                item.reminders[reminderIndex].isSent = true;
                await item.save(); // Save the parent document to update the sub-document
                console.log(`[Scheduler] Marked reminder for ${item.title} (ID: ${reminder._id}) as sent.`);
            }
        } catch (error) {
            console.error(`[Scheduler] Error sending reminder for ${item.title} (ID: ${reminder._id}):`, error);
        }
      }
    }
  }
};

/**
 * @function startReminderScheduler
 * @description Starts the cron job to check and send reminders every minute.
 */
const startReminderScheduler = () => {
  if (reminderSchedulerJob) {
    console.log('Reminder scheduler is already running.');
    return;
  }

  // Schedule to run every minute
  reminderSchedulerJob = cron.schedule('* * * * *', () => {
    console.log('[Scheduler] Running reminder check...');
    checkAndSendReminders().catch(err => console.error('[Scheduler] Error during reminder check:', err));
  });

  console.log('Reminder scheduler started. Checking and sending reminders every minute.');
};

/**
 * @function stopReminderScheduler
 * @description Stops the cron job for reminders.
 */
const stopReminderScheduler = () => {
  if (reminderSchedulerJob) {
    reminderSchedulerJob.stop();
    reminderSchedulerJob = null;
    console.log('Reminder scheduler stopped.');
  }
};

module.exports = {
  startReminderScheduler,
  stopReminderScheduler,
};