const Joi = require('joi');
const { Types } = require('mongoose');

// Custom Joi extension for ObjectId validation
const JoiObjectId = Joi.extend((joi) => ({
  type: 'objectId',
  base: joi.string(), // CRITICAL: Keep base as joi.string() to prevent "Cannot call class as a function" with Joi itself
  messages: {
    'objectId.invalid': '{{#label}} must be a valid MongoDB ObjectId',
  },
  validate(value, helpers) {
    // --- IMPORTANT DEBUG LOGS ---
    console.log(`[JoiObjectId.validate Debug] Param Value: '${value}', Type: ${typeof value}`);
    // --- END IMPORTANT DEBUG LOGS ---
    if (!Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error('objectId.invalid') };
    }
    return value;
  },
}));

// --- Common Schemas ---
const paramIdSchema = Joi.object({
  id: JoiObjectId.objectId().hex().length(24).required()
});

const dateSchema = Joi.date().iso(); // ISO 8601 date format

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('individual', 'student', 'startup').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const updateUserProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('individual', 'student', 'startup').optional(),
  settings: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    timezone: Joi.string().optional(),
  }).optional(),
});

const adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('individual', 'student', 'startup', 'admin').optional(),
  isVerified: Joi.boolean().optional(),
  settings: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    timezone: Joi.string().optional(),
  }).optional(),
});


// --- Reminder Schemas (Tasks, Events, Goals) ---
const taskReminderSchema = Joi.object({
    time: dateSchema.required(),
    message: Joi.string().optional().allow(''),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional()
});

// --- Task Schemas ---
const taskSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'on_hold', 'cancelled').default('pending').optional(),
  dueDate: dateSchema.min(Joi.ref('$now')).optional().allow(null),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  reminders: Joi.array().items(taskReminderSchema).optional(),
  relatedGoal: JoiObjectId.objectId().optional().allow(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string().valid('pending', 'in-progress', 'completed', 'on_hold', 'cancelled').optional(),
  dueDate: dateSchema.min(Joi.ref('$now')).optional().allow(null),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  reminders: Joi.array().items(taskReminderSchema).optional(),
  relatedGoal: JoiObjectId.objectId().optional().allow(null),
}).min(1);

// --- Event Schemas ---
const eventSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  startTime: dateSchema.required(),
  endTime: dateSchema.required().min(Joi.ref('startTime')).messages({'date.min': 'End time must be after start time'}),
  location: Joi.string().max(300).optional().allow(''),
  category: Joi.string().valid('meeting', 'appointment', 'personal', 'work', 'other').default('other').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  attendees: Joi.array().items(Joi.string().email()).optional(),
  isAllDay: Joi.boolean().default(false).optional(),
  recurrence: Joi.string().valid('never', 'daily', 'weekly', 'monthly', 'yearly').default('never').optional(),
  relatedProject: JoiObjectId.objectId().optional().allow(null),
});

const updateEventSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  startTime: dateSchema.optional(),
  endTime: dateSchema.optional().min(Joi.ref('startTime', { adjust: (value) => value || new Date() })).messages({'date.min': 'End time must be after start time'}),
  location: Joi.string().max(300).optional().allow(''),
  category: Joi.string().valid('meeting', 'appointment', 'personal', 'work', 'other').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  attendees: Joi.array().items(Joi.string().email()).optional(),
  isAllDay: Joi.boolean().optional(),
  recurrence: Joi.string().valid('never', 'daily', 'weekly', 'monthly', 'yearly').optional(),
  relatedProject: JoiObjectId.objectId().optional().allow(null),
}).min(1);


// --- Message Schemas ---
const messageSchema = Joi.object({
  sender: JoiObjectId.objectId().required(),
  recipient: JoiObjectId.objectId().required(),
  subject: Joi.string().min(1).max(200).required(),
  body: Joi.string().min(1).optional().allow(''),
  type: Joi.string().valid('email', 'chat', 'notification').default('chat').optional(),
  status: Joi.string().valid('sent', 'draft', 'read', 'unread').default('unread').optional(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    url: Joi.string().uri().required(),
  })).optional(),
  relatedTask: JoiObjectId.objectId().optional().allow(null),
  relatedProject: JoiObjectId.objectId().optional().allow(null),
});

const updateMessageSchema = Joi.object({
  sender: JoiObjectId.objectId().optional(),
  recipient: JoiObjectId.objectId().optional(),
  subject: Joi.string().min(1).max(200).optional(),
  body: Joi.string().min(1).optional().allow(''),
  type: Joi.string().valid('email', 'chat', 'notification').optional(),
  status: Joi.string().valid('sent', 'draft', 'read', 'unread').optional(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    url: Joi.string().uri().required(),
  })).optional(),
  relatedTask: JoiObjectId.objectId().optional().allow(null),
  relatedProject: JoiObjectId.objectId().optional().allow(null),
}).min(1);

const summarizeContentSchema = Joi.object({
  content: Joi.string().min(1).required(),
  length: Joi.string().valid('short', 'medium', 'long').default('medium').optional(),
  format: Joi.string().valid('paragraph', 'bullet_points').default('paragraph').optional(),
});

const generateDraftSchema = Joi.object({
  prompt: Joi.string().min(1).required(),
  context: Joi.string().optional().allow(''),
  length: Joi.string().valid('short', 'medium', 'long').default('medium').optional(),
  tone: Joi.string().valid('formal', 'informal', 'neutral', 'friendly', 'urgent').default('neutral').optional(),
});


// --- Goal Schemas ---
const goalReminderSchema = Joi.object({
  time: dateSchema.required(),
  message: Joi.string().optional().allow(''),
  method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
  isSent: Joi.boolean().default(false).optional()
});

const goalSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  category: Joi.string().valid('personal', 'professional', 'health', 'finance', 'education', 'other').default('other').optional(),
  startDate: dateSchema.required(),
  endDate: dateSchema.required().min(Joi.ref('startDate')).messages({'date.min': 'End date must be after start date'}),
  status: Joi.string().valid('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled').default('not_started').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  reminders: Joi.array().items(goalReminderSchema).optional(),
  progress: Joi.number().min(0).max(100).default(0).optional(),
  linkedResources: Joi.array().items(JoiObjectId.objectId()).optional(),
});

const updateGoalSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  category: Joi.string().valid('personal', 'professional', 'health', 'finance', 'education', 'other').optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional().min(Joi.ref('startDate', { adjust: (value) => value || new Date() })).messages({'date.min': 'End date must be after start date'}),
  status: Joi.string().valid('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  reminders: Joi.array().items(goalReminderSchema).optional(),
  progress: Joi.number().min(0).max(100).optional(),
  linkedResources: Joi.array().items(JoiObjectId.objectId()).optional(),
}).min(1);


// --- Learning Resource Schemas ---
const learningResourceSchema = Joi.object({
  title: Joi.string().min(5).max(300).required(),
  description: Joi.string().max(1000).optional().allow(''),
  url: Joi.string().uri().required(),
  type: Joi.string().valid('article', 'video', 'course', 'book', 'podcast', 'tool', 'other').required(),
  category: Joi.string().valid('programming', 'marketing', 'finance', 'design', 'self-improvement', 'other').default('other').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  relatedGoal: JoiObjectId.objectId().optional().allow(null),
  source: Joi.string().valid('manual', 'AI_suggested', 'web_scrape', 'imported').default('manual').optional(),
});

const updateLearningResourceSchema = Joi.object({
  title: Joi.string().min(5).max(300).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  url: Joi.string().uri().optional(),
  type: Joi.string().valid('article', 'video', 'course', 'book', 'podcast', 'tool', 'other').optional(),
  category: Joi.string().valid('programming', 'marketing', 'finance', 'design', 'self-improvement', 'other').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  relatedGoal: JoiObjectId.objectId().optional().allow(null),
  source: Joi.string().valid('manual', 'AI_suggested', 'web_scrape', 'imported').optional(),
}).min(1);


// --- Project Schemas ---
const projectSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  startDate: dateSchema.optional().allow(null),
  endDate: dateSchema.optional().min(Joi.ref('startDate', { adjust: (value) => value || new Date() })).messages({'date.min': 'End date must be after start date'}).allow(null),
  status: Joi.string().valid('planning', 'in-progress', 'completed', 'on_hold', 'cancelled').default('planning').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').optional(),
  members: Joi.array().items(JoiObjectId.objectId()).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    uploadedAt: dateSchema.optional().default(Joi.ref('$now')),
  })).optional(),
});

const updateProjectSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  startDate: dateSchema.optional().allow(null),
  endDate: dateSchema.optional().min(Joi.ref('startDate', { adjust: (value) => value || new Date() })).messages({'date.min': 'End date must be after start date'}).allow(null),
  status: Joi.string().valid('planning', 'in-progress', 'completed', 'on_hold', 'cancelled').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  // Members and files typically managed via separate routes
  files: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    uploadedAt: dateSchema.optional(),
  })).optional(),
}).min(1);

const addRemoveMemberSchema = Joi.object({
  memberId: JoiObjectId.objectId().required(),
});


// --- Expense Schemas ---
const expenseSchema = Joi.object({
  description: Joi.string().max(200).optional().allow(''),
  amount: Joi.number().min(0.01).required(),
  category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other').required(),
  date: dateSchema.required(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'other').default('other').optional(),
  receiptUrl: Joi.string().uri().optional().allow(''),
});

const updateExpenseSchema = Joi.object({
  description: Joi.string().max(200).optional().allow(''),
  amount: Joi.number().min(0.01).optional(),
  category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other').optional(),
  date: dateSchema.optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'other').optional(),
  receiptUrl: Joi.string().uri().optional().allow(''),
}).min(1);


// --- Budget Schemas ---
const budgetSchema = Joi.object({
  category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other', 'all').required(),
  limitAmount: Joi.number().min(0).required(),
  startDate: dateSchema.required(),
  endDate: dateSchema.required().min(Joi.ref('startDate')).messages({'date.min': 'End date must be after start date'}),
  periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').default('custom').optional(),
  alertThreshold: Joi.number().min(0).max(100).default(80).optional(),
});

const updateBudgetSchema = Joi.object({
  category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other', 'all').optional(),
  limitAmount: Joi.number().min(0).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional().min(Joi.ref('startDate', { adjust: (value) => value || new Date() })).messages({'date.min': 'End date must be after start date'}),
  periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').optional(),
  alertThreshold: Joi.number().min(0).max(100).optional(),
}).min(1);


// --- Wellness Schemas ---
const wellnessRecordSchema = Joi.object({
  type: Joi.string().valid('mood', 'sleep', 'exercise', 'diet', 'meditation', 'other').required(),
  value: Joi.string().min(1).max(500).required(), // e.g., "Good", "7 hours", "30 min run"
  notes: Joi.string().max(1000).optional().allow(''),
  date: dateSchema.default(Joi.ref('$now')).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
});

const updateWellnessRecordSchema = Joi.object({
  type: Joi.string().valid('mood', 'sleep', 'exercise', 'diet', 'meditation', 'other').optional(),
  value: Joi.string().min(1).max(500).optional(),
  notes: Joi.string().max(1000).optional().allow(''),
  date: dateSchema.optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
}).min(1);

const wellnessSuggestionSchema = Joi.object({
  prompt: Joi.string().min(1).required(),
  context: Joi.string().optional().allow(''),
  type: Joi.string().valid('exercise', 'diet', 'mindfulness', 'productivity', 'other').default('other').optional(),
});


// --- Integrations Schemas ---
const slackMessageSchema = Joi.object({
  channel: Joi.string().required(),
  message: Joi.string().required(),
});

const summarizeSlackChannelSchema = Joi.object({
  channel: Joi.string().required(),
  numMessages: Joi.number().integer().min(1).max(100).default(20).optional(),
  timeframe: Joi.string().optional().allow(''), // e.g., "last 24 hours"
});

const summarizeGmailInboxSchema = Joi.object({
  numEmails: Joi.number().integer().min(1).max(50).default(10).optional(),
  timeframe: Joi.string().optional().allow(''), // e.g., "last week"
  sender: Joi.string().email().optional().allow(''),
});

const sendGmailDraftSchema = Joi.object({
  recipientEmail: Joi.string().email().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  threadId: Joi.string().optional().allow(''), // For replying to a specific thread
});


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
    console.log(`[Validation Middleware] req.params:`, req.params); // Log all params
  }
  if (property === 'query') {
    console.log(`[Validation Middleware] req.query:`, req.query); // Log all queries
  }


  const context = { $now: new Date() };

  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    allowUnknown: false,
    context: context,
  });

  if (error) {
    res.status(400);
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    throw new Error(`Validation Error: ${errorMessage}`);
  }

  req[property] = value;
  next();
};

// --- EXPORTS ---
module.exports = {
  // Validate a generic ID in params - use this specifically for routes needing ID validation
  validateIdParam: validate(paramIdSchema, 'params'),

  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateVerifyEmail: validate(verifyEmailSchema),
  validateUpdateUserProfile: validate(updateUserProfileSchema),
  validateAdminUpdateUser: validate(adminUpdateUserSchema),

  validateCreateTask: validate(taskSchema),
  validateUpdateTask: validate(updateTaskSchema),

  validateCreateEvent: validate(eventSchema),
  validateUpdateEvent: validate(updateEventSchema),

  validateCreateMessage: validate(messageSchema),
  validateUpdateMessage: validate(updateMessageSchema),
  validateSummarizeContent: validate(summarizeContentSchema),
  validateGenerateDraft: validate(generateDraftSchema),

  validateCreateGoal: validate(goalSchema),
  validateUpdateGoal: validate(updateGoalSchema),

  validateCreateLearningResource: validate(learningResourceSchema),
  validateUpdateLearningResource: validate(updateLearningResourceSchema),

  validateCreateProject: validate(projectSchema),
  validateUpdateProject: validate(updateProjectSchema),
  validateAddRemoveMember: validate(addRemoveMemberSchema),

  validateCreateExpense: validate(expenseSchema),
  validateUpdateExpense: validate(updateExpenseSchema),

  validateCreateBudget: validate(budgetSchema),
  validateUpdateBudget: validate(updateBudgetSchema),

  validateCreateWellnessRecord: validate(wellnessRecordSchema),
  validateUpdateWellnessRecord: validate(updateWellnessRecordSchema),
  validateWellnessSuggestion: validate(wellnessSuggestionSchema),

  validateSlackMessage: validate(slackMessageSchema),
  validateSummarizeSlackChannel: validate(summarizeSlackChannelSchema),
  validateSummarizeGmailInbox: validate(summarizeGmailInboxSchema),
  validateSendGmailDraft: validate(sendGmailDraftSchema),
};
