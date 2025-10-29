const request = require('supertest');
const app = require('../../server'); // Import the Express app
const User = require('../../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For manually generating tokens for test users

// Mock SendGrid and Twilio to prevent actual emails/SMS during tests
jest.mock('../../services/notificationService', () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve()),
  sendEmailNotification: jest.fn(() => Promise.resolve()),
  sendSmsNotification: jest.fn(() => Promise.resolve()),
}));

describe('Auth API', () => {
  let testUser; // To store a user created during tests
  let testUserToken; // To store JWT for authenticated test user
  let adminUser;
  let adminUserToken;

  beforeEach(async () => {
    // Create a user for login tests
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123', // Mongoose pre-save hook will hash this
      isVerified: true, // Mark as verified for login tests
    });
    testUserToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Create an admin user for admin tests
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminpassword',
      role: 'admin',
      isVerified: true,
    });
    adminUserToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  });

  afterEach(async () => {
    // Clean up created mocks
    jest.clearAllMocks();
  });

  // --- POST /api/v1/auth/register ---
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and send verification email', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword123',
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser)
        .expect(201);

      expect(res.body.message).toContain('User registered successfully!');
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', newUser.name);
      expect(res.body).toHaveProperty('email', newUser.email);
      expect(res.body).toHaveProperty('isVerified', false);
      expect(res.body).not.toHaveProperty('token'); // No token on registration until verified

      const createdUser = await User.findById(res.body._id);
      expect(createdUser).toBeDefined();
      expect(createdUser.isVerified).toBe(false);
      expect(createdUser).toHaveProperty('verificationToken'); // Ensure token is stored

      // Check if mock email service was called
      const { sendVerificationEmail } = require('../../services/notificationService');
      expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: newUser.email, name: newUser.name })
      );
    });

    it('should return 409 if user with email already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Existing User',
          email: 'test@example.com', // Already exists
          password: 'password123',
        })
        .expect(409);

      expect(res.body.message).toContain('A user with this email address already exists');
    });

    it('should return 400 for invalid input (e.g., missing email)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid User',
          password: 'password123',
        })
        .expect(400);

      expect(res.body.message).toContain('Validation Error: "email" is required');
    });
  });

  // --- POST /api/v1/auth/login ---
  describe('POST /api/v1/auth/login', () => {
    it('should log in a verified user and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('isVerified', true);
    });

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);

      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });

    it('should return 401 if user email is not verified', async () => {
      const unverifiedUser = await User.create({
        name: 'Unverified',
        email: 'unverified@example.com',
        password: 'password123',
        isVerified: false,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'unverified@example.com', password: 'password123' })
        .expect(401);

      expect(res.body.message).toContain('Your email address is not verified');
    });

    it('should return 400 for invalid login input', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400); // Joi validation error
    });
  });

  // --- POST /api/v1/auth/verify-email ---
  describe('POST /api/v1/auth/verify-email', () => {
    it('should verify a user with a valid token', async () => {
      const userToVerify = await User.create({
        name: 'Verify Me',
        email: 'verify@example.com',
        password: 'password123',
        isVerified: false,
      });
      const unhashedToken = userToVerify.getVerificationToken(); // Generates and stores hashed token
      await userToVerify.save();

      const res = await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: unhashedToken })
        .expect(200);

      expect(res.body.message).toContain('Email verified successfully!');
      expect(res.body).toHaveProperty('isVerified', true);

      const verifiedUser = await User.findById(userToVerify._id);
      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.verificationToken).toBeUndefined(); // Token should be cleared
      expect(verifiedUser.verificationTokenExpires).toBeUndefined();
    });

    it('should return 400 for an invalid or expired token', async () => {
      await request(app)
        .post('/api/v1/auth/verify-email')
        .send({ token: 'invalidtoken' })
        .expect(400);
    });

    it('should return 400 for missing token', async () => {
        await request(app)
            .post('/api/v1/auth/verify-email')
            .send({})
            .expect(400);
    });
  });

  // --- GET /api/v1/auth/profile ---
  describe('GET /api/v1/auth/profile', () => {
    it('should return the authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', testUser.email);
      expect(res.body).not.toHaveProperty('password'); // Password should be excluded
      expect(res.body).toHaveProperty('isVerified', true);
    });

    it('should return 401 if no token is provided', async () => {
      await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should return 401 if an invalid token is provided', async () => {
      await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer invalidtoken`)
        .expect(401);
    });
  });

  // --- PUT /api/v1/auth/profile ---
  describe('PUT /api/v1/auth/profile', () => {
    it('should update the authenticated user profile', async () => {
      const newName = 'Updated Test User';
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: newName })
        .expect(200);

      expect(res.body).toHaveProperty('name', newName);
      expect(res.body).toHaveProperty('email', testUser.email); // Email unchanged
      expect(res.body).toHaveProperty('isVerified', true); // Still verified if email unchanged

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.name).toBe(newName);
    });

    it('should re-verify email if email is updated', async () => {
      const newEmail = 'newtest@example.com';
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ email: newEmail })
        .expect(200);

      expect(res.body).toHaveProperty('email', newEmail);
      expect(res.body).toHaveProperty('isVerified', false); // Should become unverified
      expect(res.body.message).toContain('new verification email has been sent');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.isVerified).toBe(false);
      expect(updatedUser).toHaveProperty('verificationToken'); // New token stored

      const { sendVerificationEmail } = require('../../services/notificationService');
      expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({ email: newEmail })
      );
    });

    it('should return 409 if new email already exists', async () => {
      await User.create({ name: 'Another User', email: 'another@example.com', password: 'pass', isVerified: true });

      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ email: 'another@example.com' })
        .expect(409);

      expect(res.body.message).toContain('This email is already registered by another user.');
    });

    it('should return 400 for invalid input', async () => {
        await request(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${testUserToken}`)
            .send({ name: 'a' }) // Too short
            .expect(400);

        await request(app)
            .put('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${testUserToken}`)
            .send({ email: 'invalid-email' })
            .expect(400);
    });
  });

  // --- GET /api/v1/auth/admin-data ---
  describe('GET /api/v1/auth/admin-data', () => {
    it('should allow admin user to access admin data', async () => {
      const res = await request(app)
        .get('/api/v1/auth/admin-data')
        .set('Authorization', `Bearer ${adminUserToken}`)
        .expect(200);

      expect(res.body.message).toContain('Welcome, Admin!');
      expect(res.body.user.email).toBe(adminUser.email);
    });

    it('should return 403 for non-admin user trying to access admin data', async () => {
      await request(app)
        .get('/api/v1/auth/admin-data')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);
    });

    it('should return 401 if no token for admin data', async () => {
      await request(app)
        .get('/api/v1/auth/admin-data')
        .expect(401);
    });
  });
});