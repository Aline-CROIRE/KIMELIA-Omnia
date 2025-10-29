require('dotenv').config(); // Load environment variables for JWT_SECRET
const generateToken = require('../../utils/generateToken');
const jwt = require('jsonwebtoken');

describe('generateToken', () => {
  it('should generate a valid JWT token', () => {
    const userId = '60d0fe4f5b5f7e001c0d3a7b';
    const token = generateToken(userId);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(userId);
    expect(decoded).toHaveProperty('iat'); // Issued At
    expect(decoded).toHaveProperty('exp'); // Expiration
  });

  it('should generate a token with the correct expiration', () => {
    const userId = '60d0fe4f5b5f7e001c0d3a7c';
    const token = generateToken(userId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // JWT_EXPIRE is '1h' in .env, so expiration should be roughly 1 hour from now.
    const now = Math.floor(Date.now() / 1000);
    const expectedExpirationSeconds = 3600; // 1 hour

    // Check if expiration is roughly within expected range
    expect(decoded.exp).toBeGreaterThan(now + expectedExpirationSeconds - 60); // Give 60s buffer
    expect(decoded.exp).toBeLessThan(now + expectedExpirationSeconds + 60);
  });
});