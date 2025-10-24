const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * @function sendVerificationEmail
 * @description Sends an email verification link to a new user.
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient's email address.
 * @param {string} options.name - Recipient's name.
 * @param {string} options.verificationToken - The unhashed verification token.
 * @param {string} options.frontendUrl - The base URL of the frontend application.
 * @returns {Promise<Object>} - SendGrid email response.
 */
const sendVerificationEmail = async ({ email, name, verificationToken, frontendUrl }) => {
  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`; // Assuming your frontend has a /verify-email route

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL, // Must be a verified sender in SendGrid
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

module.exports = { sendVerificationEmail };