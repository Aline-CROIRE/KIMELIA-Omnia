# 🌟 KIMELIA Omnia Backend

"Your World, Organized Intelligently."

This is the robust backend API for **KIMELIA Omnia**, an AI-driven productivity and personal management platform. It empowers individuals, students, startups, and businesses by intelligently organizing, managing, and optimizing all aspects of life and work through various integrated modules and AI-powered features.

---

## 📝 Table of Contents

- [🌟 KIMELIA Omnia Backend](#-kimelia-omnia-backend)
- [📝 Table of Contents](#-table-of-contents)
- [🚀 Features](#-features)
  - [Core Modules](#core-modules)
  - [Integrations](#integrations)
  - [Backend Enhancements](#backend-enhancements)
- [💻 Technology Stack](#-technology-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Install dependencies](#2-install-dependencies)
  - [3. Environment Variables (`.env` setup)](#3-environment-variables-env-setup)
  - [4. Start MongoDB and Redis (Memurai)](#4-start-mongodb-and-redis-memurai)
  - [5. Start the Backend Server (Development Mode)](#5-start-the-backend-server-development-mode)
- [📚 API Documentation (Swagger UI)](#-api-documentation-swagger-ui)
- [🧪 Running Tests](#-running-tests)
- [📂 Project Structure](#-project-structure)
- [🔮 Future Enhancements (Planned)](#-future-enhancements-planned)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [✉️ Contact](#-contact)

---

## 🚀 Features

The KIMELIA Omnia backend provides a comprehensive set of API endpoints for all its core modules and functionalities:

### Core Modules
- **Authentication & User Management:**
  - User Registration, Login, Profile Management.
  - Secure Email Verification with SendGrid.
  - JWT-based authentication for secure API access.
  - Role-Based Access Control (RBAC) with `admin` routes.
- **Omnia Planner (Tasks & Events):**
  - Full CRUD operations for Tasks (priorities, statuses, due dates, tags, project linking).
  - Full CRUD operations for Calendar Events (start/end times, locations, attendees, categories).
- **Omnia Communicator (Smart Messaging & AI):**
  - Full CRUD for Smart Communication Entries (AI-summarized emails, drafts, notes).
  - AI-powered text summarization for any content.
  - AI-powered message drafting based on instructions and context.
- **Omnia Coach (Goals, Learning, Motivation):**
  - Full CRUD for personal & professional Goals (progress, target dates, categories, related tasks).
  - Full CRUD for Learning Resources (articles, videos, courses, linked to goals).
  - AI-driven personalized motivational tips.
- **Omnia Workspace (Projects & Collaboration):**
  - Full CRUD for Projects (owner, status, priority, members, tags).
  - Add/Remove members from projects.
  - Tasks can be linked to projects.
- **Omnia Finance (Expenses & Budgets):**
  - Full CRUD for Expenses (amounts, categories, dates, payment methods, tags).
  - Full CRUD for Budgets (category-specific limits, periods, alert thresholds).
- **Omnia Insights (Analytics & AI Recommendations):**
  - Productivity Summary Reports (tasks, events, goals over periods).
  - Spending Summary Reports (expenses by category over periods).
  - AI-driven personalized productivity recommendations.
  - AI-driven personalized goal achievement recommendations.
- **Omnia Wellness (Tracking & Suggestions):**
  - Full CRUD for Wellness Records (breaks, meals, exercise, mindfulness, sleep, water intake, mood tracking).
  - AI-driven personalized wellness suggestions.

### Integrations
- **Google Services (Calendar & Gmail):**
  - Unified Google OAuth2 authorization flow.
  - Sync Omnia events to Google Calendar.
  - Sync Google Calendar events to Omnia.
  - Fetch and AI-summarize recent Gmail inbox messages.
  - Send drafted emails via Gmail.
  - Disconnect all Google integrations.
- **Slack:**
  - Slack OAuth2 authorization flow.
  - Retrieve Slack channels (where the bot is a member).
  - Send messages to Slack channels or direct messages.
  - AI-summarize recent Slack channel discussions.
  - Disconnect Slack integration.

### Backend Enhancements
- **Robust Input Validation:** Utilizes `joi` for comprehensive schema-based validation on all incoming request bodies and parameters.
- **Enhanced Security:**
  - `helmet`: Sets various HTTP headers for improved security.
  - `cors`: Configurable Cross-Origin Resource Sharing, restrictive in production.
  - `xss-clean`: Sanitizes user input to prevent Cross-site Scripting (XSS) attacks.
  - `hpp`: Protects against HTTP Parameter Pollution attacks.
  - `express-rate-limit`: Prevents brute-force and abuse by rate-limiting requests.
- **Real-time Reminders:**
  - `node-cron`: Schedules periodic checks for upcoming reminders (tasks, events, goals).
  - Notifications dispatched via Email (SendGrid) and SMS (Twilio).
  - Reminder `isSent` tracking to prevent duplicate notifications.
- **Centralized Error Handling:** Consistent and informative error responses.
- **Swagger/OpenAPI Documentation:** Interactive API documentation available at `/api-docs`.

---

## 💻 Technology Stack

- **Backend:** `Node.js`, `Express.js`
- **Database:** `MongoDB` (with `Mongoose` ODM)
- **AI Engine:** `OpenAI GPT API` (via `openai` SDK)
- **Authentication:** `JSON Web Tokens` (JWT), `bcryptjs`
- **Validation:** `Joi`
- **Email Service:** `SendGrid` (`@sendgrid/mail`)
- **SMS Service:** `Twilio` (`twilio`)
- **Scheduling:** `Node-Cron` (`node-cron`)
- **Integrations:**
  - `Google APIs Client Library` (`googleapis`) for Calendar & Gmail
  - `Slack Web API` (`@slack/web-api`)
- **Dev Tools:** `Nodemon`, `Concurrently`, `Cross-env`, `Swagger-UI-Express`, `Swagger-JSDoc`, `Jest`, `Supertest`, `@shelf/jest-mongodb`

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager, usually comes with Node.js)
- **MongoDB:**
  - A running local instance (e.g., via [MongoDB Community Server](https://www.mongodb.com/try/download/community))
  - OR a cloud-hosted instance (e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Redis-compatible server (e.g., Memurai on Windows, or Redis for Linux/macOS):**
  - For local development: [Memurai](https://memurai.com/download) (Windows), or `docker run --name my-redis -p 6379:6379 -d redis` (Docker)
- **Google Cloud Project:** With OAuth 2.0 Client ID (Web Application) and enabled **Google Calendar API** & **Gmail API**.
- **Slack App:** With a Bot User OAuth Token and appropriate scopes (e.g., `chat:write`, `channels:read`).
- **SendGrid Account:** With a verified sender email and an API Key.
- **Twilio Account:** With an Account SID, Auth Token, and a Twilio Phone Number.

---

## 🚀 Getting Started

Follow these steps to get your KIMELIA Omnia backend up and running locally.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kimelia-omnia-backend.git # Replace with your actual repo URL
cd kimelia-omnia-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables (.env setup)

Create a `.env` file in the root of your project directory. This file will store sensitive information and configuration settings. **Do NOT commit this file to your Git repository.**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kimeliaomnia # Your MongoDB connection string
JWT_SECRET=YOUR_VERY_LONG_AND_COMPLEX_SECRET_KEY_HERE_MIN_32_CHARS # IMPORTANT: Use a truly random, long string!
JWT_EXPIRE=1h # e.g., '1h', '7d', or a number in seconds
NODE_ENV=development # development, test, or production

# OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SendGrid API Key (for email verification and notifications)
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY_HERE
SENDER_EMAIL=no-reply@kimeliaomnia.com # Must be a verified sender email in SendGrid

# Twilio SMS Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx # Your Twilio Account SID
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here     # Your Twilio Auth Token
TWILIO_PHONE_NUMBER=+12345678900                   # Your Twilio phone number (e.g., +1XXXXXXXXXX)

# Reminder buffer time (in minutes) - how many minutes before due to send reminder
REMINDER_BUFFER_MINUTES=10

# Frontend URL for OAuth redirects (after successful backend OAuth, frontend will be redirected here)
FRONTEND_POST_AUTH_REDIRECT_URL=http://localhost:3000/integrations # Replace with your frontend's integration callback URL

# Google API Credentials (for Calendar and Gmail integration)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/integrations/google/callback # Must match authorized redirect URI in Google Cloud Console

# Slack API Credentials
SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID_HERE
SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET_HERE
SLACK_REDIRECT_URI=http://localhost:5000/api/v1/integrations/slack/callback # Must match authorized redirect URI in Slack App settings
```

### 4. Start MongoDB and Redis (Memurai)

Ensure your MongoDB instance is running (locally or in the cloud).  
Ensure your Redis-compatible server (e.g., Memurai) is running (locally on `localhost:6379`).

### 5. Start the Backend Server (Development Mode)

```bash
npm run dev
```

This command will:
- Start the Express server using nodemon (auto-restarts on file changes).
- Start the node-cron reminder scheduler (which runs in-process).
- Automatically open your API documentation (Swagger UI) in your default web browser after a short delay.

You should see output similar to:

```
MongoDB Connected successfully! (Environment: development)
Reminder scheduler started. Checking and sending reminders every minute.
Server running on port 5000
wait-on http://localhost:5000/api-docs && open-cli http://localhost:5000/api-docs
```

---

## 📚 API Documentation (Swagger UI)

Once the server is running in development mode (`npm run dev`), you can access the interactive API documentation at:

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

This interface allows you to:
- View all available API endpoints.
- Understand request/response schemas.
- Test endpoints directly (after authorizing with a JWT token).

### Authentication in Swagger:
1. Use `POST /api/v1/auth/register` to create a new user.
2. Follow the email verification process via the link sent to your email.
3. Use `POST /api/v1/auth/login` with the verified user's credentials to get a token.
4. Click the "Authorize" button (top right of Swagger UI).
5. In the dialog, enter `Bearer YOUR_JWT_TOKEN_HERE` (replace with the actual token).
6. Click "Authorize" and then "Close". Your subsequent requests will now be authenticated.

---

## 🧪 Running Tests

The backend is configured with Jest for unit and integration testing.  
To run all tests:

```bash
npm test
```

To run tests in watch mode (re-runs on file changes):

```bash
npm run test:watch
```

To generate a test coverage report:

```bash
npm run test:coverage
```

**Note:** When running tests, Jest will automatically connect to a separate, temporary MongoDB instance managed by `@shelf/jest-mongodb`. Ensure your primary MongoDB server is not occupying port 27017 during tests if `jest-mongodb` needs to start its own default instance.

---

## 📂 Project Structure

```
kimelia-omnia-backend/
├── .env                        # Environment variables (add to .gitignore!)
├── .gitignore                  # Git ignore file
├── package.json                # Project dependencies and scripts
├── server.js                   # Main Express application entry point
├── jest.config.js              # Jest test runner configuration
├── jest.setup.js               # Jest setup file for Mongoose connection/cleanup
├── __tests__/                  # Test files
│   ├── routes/
│   │   └── authRoutes.test.js  # Example integration tests for auth routes
│   └── utils/
│       └── generateToken.test.js # Example unit tests for utilities
├── models/                     # Mongoose schemas for MongoDB collections
│   ├── User.js                 # User model (includes integration tokens)
│   ├── Task.js                 # Omnia Planner Task model
│   ├── Event.js                # Omnia Planner Event/Calendar model
│   ├── Message.js              # Omnia Communicator Message model (AI summaries, drafts)
│   ├── Goal.js                 # Omnia Coach Goal model
│   ├── LearningResource.js     # Omnia Coach Learning Resource model
│   ├── Project.js              # Omnia Workspace Project model
│   ├── Expense.js              # Omnia Finance Expense model
│   └── Budget.js               # Omnia Finance Budget model
├── controllers/                # Business logic for handling API requests
│   ├── authController.js       # User authentication and profile logic
│   ├── adminController.js      # Admin-specific user management logic
│   ├── taskController.js       # Task management logic
│   ├── eventController.js      # Event management logic
│   ├── messageController.js    # Smart Communication and AI processing logic
│   ├── goalController.js       # Goal tracking logic
│   ├── learningResourceController.js # Learning resource & motivational tip logic
│   ├── projectController.js    # Project & member management logic
│   ├── expenseController.js    # Expense tracking logic
│   ├── budgetController.js     # Budget management logic
│   ├── insightController.js    # Analytics reports & AI recommendations logic
│   └── wellnessController.js   # Wellness tracking & AI suggestions logic
├── routes/                     # API endpoint definitions
│   ├── authRoutes.js           # Authentication routes
│   ├── adminRoutes.js          # Admin routes
│   ├── taskRoutes.js           # Task routes
│   ├── eventRoutes.js          # Event routes
│   ├── messageRoutes.js        # Message & AI communication routes
│   ├── goalRoutes.js           # Goal routes
│   ├── learningResourceRoutes.js # Learning resource & motivation routes
│   ├── projectRoutes.js        # Project routes
│   ├── expenseRoutes.js        # Expense routes
│   ├── budgetRoutes.js         # Budget routes
│   ├── insightRoutes.js        # Insights & AI recommendations routes
│   ├── wellnessRoutes.js       # Wellness routes
│   └── integrationRoutes.js    # Google, Slack integrations routes
├── middleware/                 # Express middleware functions
│   ├── authMiddleware.js       # JWT token verification and role authorization
│   ├── errorHandler.js         # Centralized custom error handling
│   └── validationMiddleware.js  # Joi schemas and validation factory
├── services/                   # Business logic for external integrations, AI, notifications
│   ├── aiService.js            # OpenAI GPT API interactions
│   ├── notificationService.js  # SendGrid (Email) and Twilio (SMS) services
│   ├── schedulerService.js     # Node-cron based reminder scheduling
│   ├── googleApiService.js     # Generic Google OAuth2 client & token management
│   ├── googleCalendarService.js # Google Calendar API specific interactions
│   └── gmailService.js         # Gmail API specific interactions
│   └── slackService.js         # Slack API specific interactions
└── utils/                      # Utility functions
    ├── asyncHandler.js         # Wrapper for async Express route handlers
    └── generateToken.js        # JWT token generation helper
```

---

## 🔮 Future Enhancements (Planned)

The following features and improvements are planned for future development:
- **Robust Job Queue System:** Transition from node-cron to a persistent job queue like BullMQ with Redis (or Memurai) to handle reminders, background tasks, and AI processing more reliably and scalably.
- **WebSockets for In-App Notifications:** Implement a WebSocket server (e.g., Socket.IO) to deliver real-time notifications directly to the frontend application for tasks, events, and AI suggestions.
- **Advanced AI Capabilities:**
  - Integrate LangChain for more sophisticated AI memory, agentic behavior, and complex reasoning based on combined user data across modules.
  - Personalized learning path suggestions in Omnia Coach.
  - AI-driven habit formation guidance in Omnia Wellness.
- **More Integrations:**
  - Notion integration (API for page/database management).
  - Microsoft Teams integration (full Microsoft Graph API access for reading, summarizing, and advanced messaging).
  - Calendar integrations beyond Google (e.g., Outlook Calendar).
- **Advanced Logging & Monitoring:** Implement structured logging with Winston or Pino and integrate with monitoring tools (e.g., Prometheus, Datadog) for better observability in production.
- **Caching Strategy:** Utilize Redis (or Memurai) for caching frequently accessed API responses and user data to improve overall API performance.
- **File Management:** Implement a file storage solution (e.g., AWS S3, Google Cloud Storage) to manage project files, receipts, etc.
- **Full-text Search:** Integrate a dedicated search engine (e.g., Elasticsearch, Algolia) for powerful cross-module search capabilities.
- **Comprehensive Testing:** Expand unit, integration, and end-to-end tests for all new features.
- **Deployment Automation:** Set up Docker containers and a CI/CD pipeline for automated testing and deployment to cloud platforms (AWS, Azure, Google Cloud, Heroku, etc.).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and submit pull requests.

---

## 📄 License

This project is licensed under the ISC License.

---

## ✉️ Contact

For support, questions, or collaboration, please reach out to:  
**KIMELIA Soft Support:** [support@kimeliasoft.com](mailto:support@kimeliasoft.com)  
**Website:** [http://kimeliasoft.com](http://kimeliasoft.com)
