const Joi = require('joi');
const { Types } = require('mongoose');

// Custom Joi extension for ObjectId validation
const JoiObjectId = Joi.extend((joi) => ({
  type: 'objectId',
  base: joi.string(),
  messages: {
    'objectId.invalid': '{{#label}} must be a valid MongoDB ObjectId',
  },
  validate(value, helpers) {
    if (!Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error('objectId.invalid') };
    }
    return value;
  },
}));

// --- Common Schemas ---
const idSchema = JoiObjectId.objectId().required();

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
  role: Joi.string().valid('individual', 'student', 'startup').optional(), // Admin role can't be set by user
  phoneNumber: Joi.string().pattern(/^(\+|00)[1-9]\d{1,14}$/).optional().messages({'string.pattern.base': 'Phone number must be a valid international format (e.g., +12345678900)'}),
  settings: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    timezone: Joi.string().optional(),
  }).optional().unknown(true), // Allow unknown fields in settings for flexibility
});

const adminUpdateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    role: Joi.string().valid('individual', 'student', 'startup', 'admin').optional(), // Admin can set any role
    isVerified: Joi.boolean().optional(),
    phoneNumber: Joi.string().pattern(/^(\+|00)[1-9]\d{1,14}$/).optional().messages({'string.pattern.base': 'Phone number must be a valid international format (e.g., +12345678900)'}),
    settings: Joi.object({
        theme: Joi.string().valid('light', 'dark', 'system').optional(),
        timezone: Joi.string().optional(),
    }).optional().unknown(true),
    password: Joi.forbidden(),
    verificationToken: Joi.forbidden(),
    verificationTokenExpires: Joi.forbidden()
});

// --- Task Schemas ---
const taskReminderSchema = Joi.object({ // New sub-schema for task reminders
    time: dateSchema.required(),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional() // isSent can be sent by client to reset if needed
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
    reminders: Joi.array().items(taskReminderSchema).optional(), // Use new sub-schema
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
    reminders: Joi.array().items(taskReminderSchema).optional(), // Use new sub-schema
}).min(1);

// --- Event Schemas ---
const eventReminderSchema = Joi.object({ // New sub-schema for event reminders
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
    reminders: Joi.array().items(eventReminderSchema).optional(), // Use new sub-schema
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
    reminders: Joi.array().items(eventReminderSchema).optional(), // Use new sub-schema
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
const goalReminderSchema = Joi.object({ // New sub-schema for goal reminders
    time: dateSchema.required(),
    message: Joi.string().required(),
    method: Joi.string().valid('email', 'app_notification', 'sms').default('app_notification').optional(),
    isSent: Joi.boolean().default(false).optional()
});

const goalSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('professional', 'personal', 'education', 'health', 'finance', 'other').default('personal').optional(),
    targetDate: dateSchema.required().min(new Date()),
    progress: Joi.number().min(0).max(100).default(0).optional(),
    status: Joi.string().valid('active', 'completed', 'overdue', 'cancelled', 'on_hold').default('active').optional(),
    relatedTasks: Joi.array().items(JoiObjectId.objectId()).optional(),
    reminders: Joi.array().items(goalReminderSchema).optional(), // Use new sub-schema
});

const updateGoalSchema = Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().valid('professional', 'personal', 'education', 'health', 'finance', 'other').optional(),
    targetDate: dateSchema.min(new Date()).optional(),
    progress: Joi.number().min(0).max(100).optional(),
    status: Joi.string().valid('active', 'completed', 'overdue', 'cancelled', 'on_hold').optional(),
    relatedTasks: Joi.array().items(JoiObjectId.objectId()).optional(),
    reminders: Joi.array().items(goalReminderSchema).optional(), // Use new sub-schema
}).min(1);

// --- Learning Resource Schemas (Omnia Coach) ---
const learningResourceSchema = Joi.object({
    title: Joi.string().min(5).max(300).required(),
    description: Joi.string().max(1000).optional(),
    url: Joi.string().uri().required(),
    type: Joi.string().valid('article', 'video', 'course', 'book', 'podcast', 'tool', 'other').required(),
    category: Joi.string().valid('programming', 'marketing', 'finance', 'design', 'self-improvement', 'other').default('other').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    relatedGoal: JoiObjectId.objectId().optional(),
    source: Joi.string().valid('manual', 'AI_suggested', 'web_scrape', 'imported').default('manual').optional(),
});

const updateLearningResourceSchema = Joi.object({
    title: Joi.string().min(5).max(300).optional(),
    description: Joi.string().max(1000).optional(),
    url: Joi.string().uri().optional(),
    type: Joi.string().valid('article', 'video', 'course', 'book', 'podcast', 'tool', 'other').optional(),
    category: Joi.string().valid('programming', 'marketing', 'finance', 'design', 'self-improvement', 'other').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    relatedGoal: JoiObjectId.objectId().optional(),
    source: Joi.string().valid('manual', 'AI_suggested', 'web_scrape', 'imported').optional(),
}).min(1);

// --- Project Schemas (Omnia Workspace) ---
const projectSchema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().max(1000).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional().greater(Joi.ref('startDate')),
    status: Joi.string().valid('planning', 'in-progress', 'completed', 'on-hold', 'cancelled').default('planning').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
});

const updateProjectSchema = Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional().greater(Joi.ref('startDate')),
    status: Joi.string().valid('planning', 'in-progress', 'completed', 'on-hold', 'cancelled').optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
}).min(1);

const addRemoveMemberSchema = Joi.object({
    memberId: JoiObjectId.objectId().required(),
});

// --- Expense Schemas (Omnia Finance) ---
const expenseSchema = Joi.object({
    description: Joi.string().min(3).max(200).optional(),
    amount: Joi.number().min(0.01).required(),
    category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other').required(),
    date: dateSchema.required(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'other').default('other').optional(),
    receiptUrl: Joi.string().uri().optional(),
});

const updateExpenseSchema = Joi.object({
    description: Joi.string().min(3).max(200).optional(),
    amount: Joi.number().min(0.01).optional(),
    category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other').optional(),
    date: dateSchema.optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'mobile_money', 'other').optional(),
    receiptUrl: Joi.string().uri().optional(),
}).min(1);

// --- Budget Schemas (Omnia Finance) ---
const budgetSchema = Joi.object({
    category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other', 'all').required(),
    limitAmount: Joi.number().min(0).required(),
    startDate: dateSchema.required(),
    endDate: dateSchema.required().greater(Joi.ref('startDate')),
    periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').default('custom').optional(),
    alertThreshold: Joi.number().min(0).max(100).default(80).optional(),
});

const updateBudgetSchema = Joi.object({
    category: Joi.string().valid('food', 'transport', 'housing', 'utilities', 'entertainment', 'shopping', 'education', 'health', 'work', 'bills', 'savings', 'other', 'all').optional(),
    limitAmount: Joi.number().min(0).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional().greater(Joi.ref('startDate')),
    periodType: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly', 'custom').optional(),
    alertThreshold: Joi.number().min(0).max(100).optional(),
}).min(1);

// --- Wellness Schemas (Omnia Wellness) ---
const wellnessRecordSchema = Joi.object({
    type: Joi.string().valid('break', 'meal', 'exercise', 'mindfulness', 'sleep', 'water_intake', 'custom').required(),
    date: dateSchema.required(),
    durationMinutes: Joi.number().min(1).optional(),
    details: Joi.string().max(500).optional(),
    intensity: Joi.string().valid('low', 'medium', 'high').optional(),
    moodBefore: Joi.string().valid('stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious').optional(),
    moodAfter: Joi.string().valid('stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious').optional(),
    caloriesConsumed: Joi.number().min(0).optional(),
    waterAmountMl: Joi.number().min(0).optional(),
});

const updateWellnessRecordSchema = Joi.object({
    type: Joi.string().valid('break', 'meal', 'exercise', 'mindfulness', 'sleep', 'water_intake', 'custom').optional(),
    date: dateSchema.optional(),
    durationMinutes: Joi.number().min(1).optional(),
    details: Joi.string().max(500).optional(),
    intensity: Joi.string().valid('low', 'medium', 'high').optional(),
    moodBefore: Joi.string().valid('stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious').optional(),
    moodAfter: Joi.string().valid('stressed', 'neutral', 'happy', 'tired', 'motivated', 'anxious').optional(),
    caloriesConsumed: Joi.number().min(0).optional(),
    waterAmountMl: Joi.number().min(0).optional(),
}).min(1);

const wellnessSuggestionSchema = Joi.object({
    suggestionType: Joi.string().valid('general', 'break', 'meal', 'exercise', 'mindfulness', 'hydration', 'sleep_aid').default('general').optional(),
    customContext: Joi.string().optional(),
});


/**
 * @function validate
 * @description Factory function to create a validation middleware.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 * @param {string} property - The property of the request object to validate ('body', 'params', 'query').
 * @returns {Function} Express middleware.
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false, // Return all errors found
    allowUnknown: false, // Disallow unknown properties
  });

  if (error) {
    res.status(400);
    // Aggregate all error messages
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
};