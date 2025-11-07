// Load environment variables immediately at the top
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middleware/errorHandler');

// Security middleware imports
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// Services imports
const { startReminderScheduler } = require('./services/schedulerService');
// The GOOGLE_API_SCOPES is no longer directly injected into Swagger description,
// but the variable is still used internally by googleApiService.js
const { GOOGLE_API_SCOPES } = require('./services/googleApiService');


const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
const connectDB = async () => {
  try {
    const dbUri = process.env.NODE_ENV === 'test' ? global.__MONGO_URI__ : process.env.MONGO_URI;
    if (!dbUri) {
        console.error('ERROR: MONGO_URI is not defined in .env or __MONGO_URI__ not set for tests. Exiting.');
        process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log(`MongoDB Connected successfully! (Environment: ${process.env.NODE_ENV})`);

    if (process.env.NODE_ENV !== 'test') {
        startReminderScheduler();
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// --- Global Security Middleware ---
app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourproductionfrontend.com', 'https://anotherproductiondomain.com']
    : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(xss());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);


// --- Swagger API Documentation Setup ---
if (process.env.NODE_ENV !== 'test') {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'KIMELIA Omnia API Documentation',
                version: '1.0.0',
                // CORRECTED DESCRIPTION HERE - Removed specific integration notes
                description: `Comprehensive API documentation for KIMELIA Omnia, your AI-driven productivity platform. This API empowers individuals, students, startups, and businesses to organize, manage, and optimize all aspects of life and work.`,
                contact: {
                    name: 'KIMELIA Soft Support',
                    url: 'http://kimeliasoft.com/support',
                    email: 'support@kimeliasoft.com'
                },
            },
            servers: [
                {
                    url: `http://localhost:${PORT}/api/v1`,
                    description: 'Development Server',
                },
            ],
            tags: [
                { name: 'Authentication', description: 'User authentication, registration, email verification, and profile management' },
                { name: 'Admin', description: 'Administrative operations for managing users and system settings (Admin role required).' },
                { name: 'Tasks (Omnia Planner)', description: 'API for managing user tasks, part of the Omnia Planner module.' },
                { name: 'Events (Omnia Planner)', description: 'API for managing user calendar events, part of the Omnia Planner module.' },
                { name: 'Smart Communication (Omnia Communicator)', description: 'API for managing AI-summarized emails, drafts, communication notes, and AI content generation.' },
                { name: 'Goals (Omnia Coach)', description: 'API for tracking and managing personal and professional goals, part of the Omnia Coach module.' },
                { name: 'Learning Resources (Omnia Coach)', description: 'API for managing user\'s learning materials and fetching motivational tips.' },
                { name: 'Projects (Omnia Workspace)', description: 'API for managing team projects and members, part of the Omnia Workspace module.' },
                { name: 'Expenses (Omnia Finance)', description: 'API for managing user\'s financial expenses.' },
                { name: 'Budgets (Omnia Finance)', description: 'API for managing user\'s financial budgets.' },
                { name: 'Insights (Omnia Insights)', description: 'API for generating analytics reports and AI-driven recommendations.' },
                { name: 'Wellness (Omnia Wellness)', description: 'API for tracking user\'s wellness activities and fetching AI-driven wellness suggestions.' },
                { name: 'Integrations (Google Services)', description: 'Generic API for integrating KIMELIA Omnia with Google Calendar and Gmail.' },
                { name: 'Integrations (Google Calendar)', description: 'Specific API endpoints for Google Calendar functionalities.' },
                { name: 'Integrations (Gmail)', description: 'Specific API endpoints for Gmail functionalities (read, summarize, send).' },
                { name: 'Integrations (Slack)', description: 'API for integrating KIMELIA Omnia with Slack for messaging and channel summaries.' },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Enter your JWT Bearer token in the format "Bearer TOKEN".'
                    }
                },
                schemas: {
                    AuthResponse: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '60d0fe4f5b5f7e001c0d3a7b' },
                            name: { type: 'string', example: 'Jane Doe' },
                            email: { type: 'string', example: 'jane.doe@example.com' },
                            role: { type: 'string', example: 'individual' },
                            isVerified: { type: 'boolean', example: true },
                            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDBmZTRmNWI1ZjdlMDAxYzBkM2E3YiIsImlhdCI6MTYyNDExNDQ1MSwiZXhwIjoxNjI0MTE4MDUxfQ.xxxxxxxxxxxxxxxxxxxxxxxx' }
                        }
                    },
                    ErrorResponse: {
                        type: 'object',
                        properties: {
                            message: { type: 'string', example: 'Resource not found' },
                            statusCode: { type: 'number', example: 404 },
                            stack: { type: 'string', nullable: true, description: 'Stack trace (only in development)' }
                        }
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        },
        apis: [
            './routes/*.js',
            './models/*.js',
            './middleware/errorHandler.js',
            './middleware/validationMiddleware.js',
            './services/*.js'
        ],
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true
    }));
}

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('<h1>KIMELIA Omnia API is running!</h1><p>Visit <a href="/api-docs">/api-docs</a> for API documentation.</p>');
});

// --- Route Imports (All API routes will be prefixed with /api/v1) ---
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/tasks', require('./routes/taskRoutes'));
app.use('/api/v1/events', require('./routes/eventRoutes'));
app.use('/api/v1/messages', require('./routes/messageRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));
app.use('/api/v1/goals', require('./routes/goalRoutes'));

// --- CORRECTED LINES BELOW: Mount each at its specific sub-path ---
app.use('/api/v1/learning-resources', require('./routes/learningResourceRoutes')); // CORRECTED
app.use('/api/v1/projects', require('./routes/projectRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/budgets', require('./routes/budgetRoutes'));
app.use('/api/v1/insights', require('./routes/insightRoutes'));     // CORRECTED
app.use('/api/v1/wellness-records', require('./routes/wellnessRoutes')); // Assuming wellness routes start with /wellness-records or /wellness
app.use('/api/v1/integrations', require('./routes/integrationRoutes'));


// --- Centralized Error Handling Middleware (MUST be placed LAST) ---
app.use(errorHandler);

// --- Start Server ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
