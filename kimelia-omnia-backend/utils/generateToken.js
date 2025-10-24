 
    const jwt = require('jsonwebtoken');

    /**
     * @function generateToken
     * @description Generates a JSON Web Token (JWT) for a given user ID.
     * @param {string} id - The user's MongoDB `_id`.
     * @returns {string} The signed JWT.
     */
    const generateToken = (id) => {
      return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE, // E.g., '1h', '7d'
      });
    };

    module.exports = generateToken;

   