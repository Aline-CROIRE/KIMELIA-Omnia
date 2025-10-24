
    /**
     * @function asyncHandler
     * @description A utility function to wrap asynchronous Express route handlers.
     * Catches any errors and passes them to the Express error handling middleware.
     * @param {Function} fn - The asynchronous Express route handler function (req, res, next).
     * @returns {Function} An Express middleware function.
     */
    const asyncHandler = (fn) => (req, res, next) =>
      Promise.resolve(fn(req, res, next)).catch(next);

    module.exports = asyncHandler;
  