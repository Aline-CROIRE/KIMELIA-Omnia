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
  origin: '*', // For development: allow all origins. In production, specify your frontend URL(s): ['https://yourfrontend.com', 'http://localhost:3000']
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
        // Reusable schemas will be defined in their respective Mongoose model files
        // and referenced here by swagger-jsdoc.
        AuthResponse: { // A common response structure for successful login/registration
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d0fe4f5b5f7e001c0d3a7b' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', example: 'jane.doe@example.com' },
            role: { type: 'string', example: 'individual' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDBmZTRmNWI1ZjdlMDAxYzBkM2E3YiIsImlhdCI6MTYyNDExNDQ1MSwiZXhwIjoxNjI0MTE4MDUxfQ.xxxxxxxxxxxxxxxxxxxxxxxx' }
          }
        },
        
      }
    },
    security: [
      {
        bearerAuth: [] // Apply JWT security globally by default (can be overridden per endpoint)
      }
    ]
  },
  // Paths to files containing JSDoc for API documentation and Mongoose model schemas for data definitions
  apis: ['./routes/*.js', './models/*.js', './middleware/errorHandler.js'],
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

// --- Centralized Error Handling Middleware (MUST be placed LAST) ---
app.use(errorHandler);

// --- Start Server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));