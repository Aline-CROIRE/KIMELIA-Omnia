require('dotenv').config(); // Load environment variables first
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const errorHandler = require('./middleware/errorHandler'); // Custom error handler

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};
connectDB();

// --- Global Middleware ---
app.use(express.json()); // Built-in body parser for JSON requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourfrontend.com' : '*', // Allow all origins in dev, restrict in prod
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies/authorization headers to be sent
}));

// --- Swagger API Documentation Setup ---
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0', // Specify OpenAPI 3.0.0
    info: {
      title: 'KIMELIA Omnia API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for KIMELIA Omnia, your AI-driven productivity platform. This API empowers individuals, students, startups, and businesses to organize, manage, and optimize all aspects of life and work.',
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
      // Add production server URL here when deployed:
      // { url: 'https://api.kimeliaomnia.com/api/v1', description: 'Production Server' }
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
        // A common response structure for successful login/registration
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
        // ErrorResponse schema is also implicitly picked up from errorHandler.js,
        // but explicitly defining it here for clarity or if errorHandler doesn't have it
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
        bearerAuth: [] // Apply JWT security globally by default (can be overridden per endpoint)
      }
    ]
  },
  // Paths to files containing JSDoc for API documentation and Mongoose model schemas for data definitions
  apis: [
    './routes/*.js',
    './models/*.js',
    './middleware/errorHandler.js',
    './services/*.js' // Include services to pick up any future schema definitions or explanations
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true // Enable search bar in Swagger UI for easier navigation
}));

// --- Root Route ---
app.get('/', (req, res) => {
  res.send('<h1>KIMELIA Omnia API is running!</h1><p>Visit <a href="/api-docs">/api-docs</a> for API documentation.</p>');
});

// --- Route Imports (All API routes will be prefixed with /api/v1) ---
// User Authentication & Profile
app.use('/api/v1/auth', require('./routes/authRoutes'));
// Omnia Planner - Task Management
app.use('/api/v1/tasks', require('./routes/taskRoutes'));
// Omnia Planner - Event Management
app.use('/api/v1/events', require('./routes/eventRoutes'));
// Omnia Communicator - Smart Communication Entries & AI
app.use('/api/v1/messages', require('./routes/messageRoutes'));
// Admin Management (for users, etc.)
app.use('/api/v1/admin', require('./routes/adminRoutes'));
// Omnia Coach - Goal Tracking
// app.use('/api/v1/goals', require('./routes/goalRoutes'));


// --- Centralized Error Handling Middleware (MUST be placed LAST) ---
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));