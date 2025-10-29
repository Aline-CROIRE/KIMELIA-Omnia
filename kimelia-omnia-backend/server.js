require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middleware/errorHandler');

const { startReminderScheduler } = require('./services/schedulerService');
const { GOOGLE_API_SCOPES } = require('./services/googleApiService');


const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
const connectDB = async () => {
  try {
    // Connect to global.__MONGO_URI__ if Jest is running tests, otherwise use MONGO_URI
    const dbUri = process.env.NODE_ENV === 'test' ? global.__MONGO_URI__ : process.env.MONGO_URI;
    if (!dbUri) {
        console.error('MONGO_URI or __MONGO_URI__ is not defined. Please check .env or jest-mongodb setup.');
        process.exit(1);
    }
    await mongoose.connect(dbUri);
    console.log(`MongoDB Connected successfully! (${process.env.NODE_ENV} environment)`);

    // Start the reminder scheduler ONLY if not in test environment
    if (process.env.NODE_ENV !== 'test') {
        startReminderScheduler();
    }
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Only connect DB and start server/scheduler if not in test environment (Jest handles its own connections)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// --- Global Middleware ---
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourfrontend.com' : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// --- Swagger API Documentation Setup ---
// Only set up Swagger if not in test environment
if (process.env.NODE_ENV !== 'test') {
    const swaggerOptions = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'KIMELIA Omnia API Documentation',
                version: '1.0.0',
                description: `Comprehensive API documentation for KIMELIA Omnia, your AI-driven productivity platform. This API empowers individuals, students, startups, and businesses to organize, manage, and optimize all aspects of life and work.
                \n\n**Google Integration Scopes:**
                \n\`\`\`
                ${GOOGLE_API_SCOPES.join('\n')}
                \`\`\`
                \n\n**Note on Microsoft Teams & Notion:** These integrations are currently disabled/removed.`,
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
app.use('/api/v1', require('./routes/learningResourceRoutes'));
app.use('/api/v1/projects', require('./routes/projectRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/budgets', require('./routes/budgetRoutes'));
app.use('/api/v1', require('./routes/insightRoutes'));
app.use('/api/v1', require('./routes/wellnessRoutes'));
app.use('/api/v1/integrations', require('./routes/integrationRoutes'));


// --- Centralized Error Handling Middleware (MUST be placed LAST) ---
app.use(errorHandler);

// --- Start Server ---
// Only listen on port if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app; 