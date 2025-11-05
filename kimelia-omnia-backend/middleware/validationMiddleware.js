const Joi = require('joi');
const { Types } = require('mongoose');

// Custom Joi extension for ObjectId validation
const JoiObjectId = Joi.extend((joi) => ({
  type: 'objectId',
  base: joi.string(), // Ensure the base is a string
  messages: {
    'objectId.invalid': '{{#label}} must be a valid MongoDB ObjectId',
  },
  validate(value, helpers) {
    console.log(`[JoiObjectId.validate] Incoming value: '${value}', Type: ${typeof value}`); // IMPORTANT DEBUG LOG
    // Joi's base string validation (from 'base: joi.string()') runs *before* this validate method.
    // If it's not a string, it will already fail before reaching here,
    // hence the "value must be a string" error.
    if (!Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error('objectId.invalid') };
    }
    return value;
  },
}));

// --- Common Schemas ---
const idSchema = JoiObjectId.objectId().hex().length(24).required();

const dateSchema = Joi.date().iso(); // ISO 8601 date format

// --- Auth Schemas ---
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('individual', 'student', 'startup', 'admin').default('individual').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('individual', 'student', 'startup').optional(),
  phoneNumber: Joi.string().pattern(/^(\+|00)[1-9]\d{1,14}$/).optional().messages({'string.pattern.base': 'Phone number must be a valid international format (e.g., +12345678900)'}),
  settings: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    timezone: Joi.string().optional(),
  }).optional().unknown(true),
  googleCalendar: Joi.object({
      calendarId: Joi.string().optional(),
  }).optional().unknown(true),
  gmail: Joi.object({
      // User can't directly set connected/lastSync/historyId, these are managed by the integration service
  }).optional().unknown(true),
  slack: Joi.object({
      teamId: Joi.string().optional(),
  }).optional().unknown(true),
});

const adminUpdateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('individual', 'student', 'startup', 'admin').optional(),
    isVerified: Joi.boolean().optional(),
    phoneNumber: Joi.string().pattern(/^(\+|00)[1-9]\d{1,14}$/).optional().messages({'string.pattern.base': 'Phone number must be a valid international format (e.g., +12345678900)'}),
    settings: Joi.object({
        theme: Joi.string().valid('light', 'dark', 'system').optional(),
        timezone: Joi.string().optional(),
    }).optional().unknown(true),
    googleCalendar: Joi.object({
        accessToken: Joi.string().optional(),
        refreshToken: Joi.string().optional(),
        calendarId: Joi.string().optional(),
        lastSync: dateSchema.optional(),
    }).optional().unknown(true),
    gmail: Joi.object({
        connected: Joi.boolean().optional(),
        lastSync: dateSchema.optional(),
        historyId: Joi.string().optional(),
    }).optional().unknown(true),
    slack: Joi.object({
        accessToken: Joi.string().optional(),
        teamId: Joi.string().optional(),
        userId: Joi.string().optional(),
        botUserId: Joi.string().optional(),
        scope: Joi.string().optional(),
        lastSync: dateSchema.optional(),
    }).optional().unknown(true),
    password: Joi.forbidden(),
    verificationToken: Joi.forbidden(),
    verificationTokenExpires: Joi.forbidden()
});

// --- Task Schemas ---
const taskReminderSchema = Joi.object({
    time: dateSchema.required(),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional()
});

const taskSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    dueDate: dateSchema.optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed', 'deferred', 'cancelled').default('pending').required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').required(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    project: JoiObjectId.objectId().optional().allow(null),
    assignedTo: JoiObjectId.objectId().optional(),
    reminders: Joi.array().items(taskReminderSchema).optional(),
});

const updateTaskSchema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    dueDate: dateSchema.optional(),
    status: Joi.string().valid('pending', 'in-progress', 'completed', 'deferred', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    project: JoiObjectId.objectId().optional().allow(null),
    assignedTo: JoiObjectId.objectId().optional(),
    reminders: Joi.array().items(taskReminderSchema).optional(),
}).min(1);

// --- Event Schemas ---
const eventReminderSchema = Joi.object({
    time: dateSchema.required(),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional()
});

const eventSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(1000).optional(),
    location: Joi.string().max(200).optional(),
    startTime: dateSchema.required(),
    endTime: dateSchema.required().greater(Joi.ref('startTime')),
    allDay: Joi.boolean().default(false).optional(),
    category: Joi.string().valid('meeting', 'appointment', 'personal', 'study', 'workout', 'other').default('meeting').optional(),
    attendees: Joi.array().items(Joi.string().email()).optional(),
    reminders: Joi.array().items(eventReminderSchema).optional(),
});

const updateEventSchema = Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    location: Joi.string().max(200).optional(),
    startTime: dateSchema.optional(),
    endTime: dateSchema.optional().greater(Joi.ref('startTime')),
    allDay: Joi.boolean().optional(),
    category: Joi.string().valid('meeting', 'appointment', 'personal', 'study', 'workout', 'other').optional(),
    attendees: Joi.array().items(Joi.string().email()).optional(),
    reminders: Joi.array().items(eventReminderSchema).optional(),
}).min(1);

// --- Message Schemas (Omnia Communicator) ---
const messageSchema = Joi.object({
    type: Joi.string().valid('email_summary', 'draft', 'note', 'reminder', 'communication_log').required(),
    subject: Joi.string().min(3).max(500).optional(),
    content: Joi.string().min(10).max(5000).required(),
    source: Joi.string().valid('manual', 'AI_generated', 'gmail', 'slack', 'other').default('manual').optional(),
    externalReferenceId: Joi.string().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    status: Joi.string().valid('read', 'unread', 'archived', 'deleted', 'pending_send', 'sent').default('unread').optional(),
    scheduledSendTime: dateSchema.optional(),
    relatedTask: JoiObjectId.objectId().optional(),
    relatedEvent: JoiObjectId.objectId().optional(),
});

const updateMessageSchema = Joi.object({
    type: Joi.string().valid('email_summary', 'draft', 'note', 'reminder', 'communication_log').optional(),
    subject: Joi.string().min(3).max(500).optional(),
    content: Joi.string().min(10).max(5000).optional(),
    source: Joi.string().valid('manual', 'AI_generated', 'gmail', 'slack', 'other').optional(),
    externalReferenceId: Joi.string().optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    status: Joi.string().valid('read', 'unread', 'archived', 'deleted', 'pending_send', 'sent').optional(),
    scheduledSendTime: dateSchema.optional(),
    relatedTask: JoiObjectId.objectId().optional(),
    relatedEvent: JoiObjectId.objectId().optional(),
}).min(1);

const summarizeContentSchema = Joi.object({
    text: Joi.string().min(50).max(10000).required(),
    promptPrefix: Joi.string().optional(),
});

const generateDraftSchema = Joi.object({
    instruction: Joi.string().min(20).max(2000).required(),
    context: Joi.string().optional(),
    tone: Joi.string().valid('professional', 'friendly', 'urgent', 'formal', 'casual').default('professional').optional(),
    format: Joi.string().valid('email', 'slack_message', 'formal_letter', 'memo').default('email').optional(),
});

// --- Goal Schemas (Omnia Coach) ---
const goalReminderSchema = Joi.object({
    time: dateSchema.required(),
    message: Joi.string().required(),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional()
});

const goalSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('professional', 'personal', 'education', 'health', 'finance', 'other').default('personal').optional(),
    targetDate: dateSchema.required().min(Joi.ref('$now')).messages({'date.min': '{{#label}} cannot be in the past for new goals.'}), // Updated for new goals
    progress: Joi.number().min(0).max(100).default(0).optional(),
    status: Joi.string().valid('active', 'completed', 'overdue', 'cancelled', 'on_hold').default('active').optional(),
    relatedTasks: Joi.array().items(JoiObjectId.objectId()).optional(),
    reminders: Joi.array().items(goalReminderSchema).optional(),
});

const updateGoalSchema = Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('professional', 'personal', 'education', 'health', 'finance', 'other').optional(),
    // Allow past dates for update if it was already past, but new dates must be future
    targetDate: dateSchema.optional().custom((value, helpers) => {
        // If the date is being updated and it's in the past, it's only valid if the original goal's targetDate was also in the past.
        // This requires access to the original goal data which Joi doesn't typically provide easily for 'update' schemas.
        // Better to handle this specific logic in the controller, and let Joi just validate format/type here.
        // For now, removing .min(new Date()) to avoid false positives.
        return value;
    }),
    progress: Joi.number().min(0).max(100).optional(),
    status: Joi.string().valid('active', 'completed', 'overdue', 'cancelled', 'on_hold').optional(),
    relatedTasks: Joi.array().items(JoiObjectId.objectId()).optional(),
    reminders: Joi.array().items(goalReminderSchema).optional(),
}).min(1);

// ... rest of your schemas ...


/**
 * @function validate
 * @description Factory function to create a validation middleware.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @param {string} property - The property of the request object to validate ('body', 'params', 'query').
 * @returns {Function} Express middleware.
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  console.log(`[Validation Middleware] Validating property '${property}'.`);
  if (property === 'params') {
    console.log(`[Validation Middleware] req.params.id: '${req.params.id}', type: ${typeof req.params.id}`);
  }

  // Pass context for schemas that need it (e.g., targetDate.min(Joi.ref('$now')))
  const context = { $now: new Date() };

  const { error, value } = schema.validate(req[property], {
    abortEarly: false, // Return all errors found
    allowUnknown: false, // Disallow unknown properties (strict validation)
    context: context, // Pass context to validation
  });

  if (error) {
    res.status(400);
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    throw new Error(`Validation Error: ${errorMessage}`);
  }

  req[property] = value;
  next();
};

module.exports = {
  // Common validation
  validateId: validate(idSchema, 'params'),

  // Auth validation
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateVerifyEmail: validate(verifyEmailSchema),
  validateUpdateUserProfile: validate(updateUserProfileSchema),
  validateAdminUpdateUser: validate(adminUpdateUserSchema),

  // Task validation
  validateCreateTask: validate(taskSchema),
  validateUpdateTask: validate(updateTaskSchema),

  // Event validation
  validateCreateEvent: validate(eventSchema),
  validateUpdateEvent: validate(updateEventSchema),

  // Message validation
  validateCreateMessage: validate(messageSchema),
  validateUpdateMessage: validate(updateMessageSchema),
  validateSummarizeContent: validate(summarizeContentSchema),
  validateGenerateDraft: validate(generateDraftSchema),

  // Goal validation
  validateCreateGoal: validate(goalSchema),
  validateUpdateGoal: validate(updateGoalSchema),

  // Learning Resource validation
  validateCreateLearningResource: validate(learningResourceSchema),
  validateUpdateLearningResource: validate(updateLearningResourceSchema),

  // Project validation
  validateCreateProject: validate(projectSchema),
  validateUpdateProject: validate(updateProjectSchema),
  validateAddRemoveMember: validate(addRemoveMemberSchema),

  // Expense validation
  validateCreateExpense: validate(expenseSchema),
  validateUpdateExpense: validate(updateExpenseSchema),

  // Budget validation
  validateCreateBudget: validate(budgetSchema),
  validateUpdateBudget: validate(updateBudgetSchema),

  // Wellness validation
  validateCreateWellnessRecord: validate(wellnessRecordSchema),
  validateUpdateWellnessRecord: validate(updateWellnessRecordSchema),
  validateWellnessSuggestion: validate(wellnessSuggestionSchema),

  // Integrations validation
  validateSlackMessage: validate(slackMessageSchema),
  validateSummarizeSlackChannel: validate(summarizeSlackChannelSchema),
  validateSummarizeGmailInbox: validate(summarizeGmailInboxSchema),
  validateSendGmailDraft: validate(sendGmailDraftSchema),
};