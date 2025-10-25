const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const User = require('../models/User'); // Import User model to fetch phone number/email

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * @function sendEmailNotification
 * @description Sends an email notification.
 * @param {string} toEmail - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} htmlContent - HTML content of the email.
 * @throws {Error} If the email sending fails.
 */
const sendEmailNotification = async (toEmail, subject, htmlContent) => {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
    console.warn('SendGrid API key or sender email not configured. Skipping email to:', toEmail);
    return;
  }
  const msg = {
    to: toEmail,
    from: process.env.SENDER_EMAIL,
    subject: subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email notification sent to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending email notification to ${toEmail}:`, error);
    if (error.response && error.response.body) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send email notification.');
  }
};

/**
 * @function sendSmsNotification
 * @description Sends an SMS notification using Twilio.
 * @param {string} toPhoneNumber - Recipient's phone number (e.g., +12345678900).
 * @param {string} messageBody - The text content of the SMS.
 * @throws {Error} If the SMS sending fails.
 */
const sendSmsNotification = async (toPhoneNumber, messageBody) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not fully configured. Skipping SMS to:', toPhoneNumber);
    return;
  }
  if (!toPhoneNumber) {
    throw new Error('Recipient phone number is missing for SMS notification.');
  }

  try {
    await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: toPhoneNumber,
    });
    console.log(`SMS notification sent to ${toPhoneNumber}`);
  } catch (error) {
    console.error(`Error sending SMS notification to ${toPhoneNumber}:`, error);
    throw new Error('Failed to send SMS notification.');
  }
};

/**
 * @function sendVerificationEmail
 * @description Sends an email verification link to a new user.
 * (Moved here from emailService for centralization)
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient's email address.
 * @param {string} options.name - Recipient's name.
 * @param {string} options.verificationToken - The unhashed verification token.
 * @param {string} options.frontendUrl - The base URL of the frontend application.
 * @returns {Promise<Object>} - SendGrid email response.
 * @throws {Error} If the email sending fails.
 */
const sendVerificationEmail = async ({ email, name, verificationToken, frontendUrl }) => {
  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'KIMELIA Omnia: Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #6A2E9F;">Hello ${name},</h2>
        <p>Thank you for registering with KIMELIA Omnia, your AI-driven personal assistant!</p>
        <p>To get started and unlock all features, please verify your email address by clicking the link below:</p>
        <p style="text-align: center;">
          <a href="${verifyUrl}" style="
            display: inline-block;
            padding: 12px 25px;
            background-color: #2EC4B6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">Verify My Email</a>
        </p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not register for KIMELIA Omnia, please disregard this email.</p>
        <p>Best regards,<br>The KIMELIA Omnia Team</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 0.8em; color: #777;">KIMELIA Omnia | Your World, Organized Intelligently.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending verification email to ${email}:`, error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Failed to send verification email. Please try again later.');
  }
};


module.exports = {
  sendEmailNotification,
  sendSmsNotification,
  sendVerificationEmail, 
};