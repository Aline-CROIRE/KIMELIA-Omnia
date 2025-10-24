const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Node.js built-in module for cryptographic functions

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated unique ID of the user.
 *           readOnly: true
 *           example: 60d0fe4f5b5f7e001c0d3a7b
 *         name:
 *           type: string
 *           description: User's full name.
 *           minLength: 2
 *           maxLength: 50
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: User's unique and valid email address.
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           description: User's hashed password. Only for writing (e.g., registration, password change).
 *           writeOnly: true
 *           minLength: 6
 *           example: myStrongPassword123
 *         role:
 *           type: string
 *           enum: [individual, student, startup, admin]
 *           default: individual
 *           description: The role of the user, defining their access level and primary segment.
 *           example: student
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Indicates if the user's email address has been verified.
 *           readOnly: true
 *           example: false
 *         verificationToken:
 *           type: string
 *           description: Unique token used for email verification. This field is hidden from API responses.
 *           writeOnly: true # Prevents it from being shown in Swagger UI responses
 *         verificationTokenExpires:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the verification token expires. This field is hidden from API responses.
 *           writeOnly: true # Prevents it from being shown in Swagger UI responses
 *         settings:
 *           type: object
 *           description: User-specific preferences and configurable settings.
 *           properties:
 *             theme:
 *               type: string
 *               default: light
 *               enum: [light, dark, system]
 *               example: dark
 *             timezone:
 *               type: string
 *               default: UTC
 *               example: America/New_York
 *           example:
 *             theme: light
 *             timezone: UTC
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user account was created.
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the user account was last updated.
 *           readOnly: true
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-1]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['individual', 'student', 'startup', 'admin'],
      default: 'individual',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String, // Store the hashed token
    verificationTokenExpires: Date, // Store expiration time
    settings: {
        theme: { type: String, default: 'light', enum: ['light', 'dark', 'system'] },
        timezone: { type: String, default: 'UTC' }
    }
  },
  {
    timestamps: true,
  }
);

// --- Mongoose Pre-Save Hook for Password Hashing ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Mongoose Instance Method for Password Comparison ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Mongoose Instance Method for Generating Verification Token ---
userSchema.methods.getVerificationToken = function () {
    // Generate a random 32-byte hex string (more secure than just base64)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and save it to the database (for comparison, never store plain tokens)
    this.verificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Set token expiration (e.g., 1 hour from now)
    this.verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    return verificationToken; // Return the *unhashed* token to be sent in the email
};


module.exports = mongoose.model('User', userSchema);