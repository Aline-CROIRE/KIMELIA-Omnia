/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             noToken:
 *               value:
 *                 message: Not authorized, no token
 *                 statusCode: 401
 *             tokenFailed:
 *               value:
 *                 message: Not authorized, token failed
 *                 statusCode: 401
 *     ForbiddenError:
 *       description: User does not have the necessary permissions to access this resource.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             forbidden:
 *               value:
 *                 message: User role 'individual' is not authorized to access this route
 *                 statusCode: 403
 *     BadRequestError:
 *       description: Invalid request payload or parameters.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             invalidInput:
 *               value:
 *                 message: Please enter all required fields
 *                 statusCode: 400
 *     NotFoundError:
 *       description: The requested resource was not found.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             notFound:
 *               value:
 *                 message: Resource not found
 *                 statusCode: 404
 *     ConflictError:
 *       description: A resource already exists (e.g., a user with that email already exists).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             userExists:
 *               value:
 *                 message: User already exists with this email
 *                 statusCode: 409
 *     ServerError:
 *       description: Internal Server Error. Something unexpected happened on the server.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             serverError:
 *               value:
 *                 message: Something went wrong on the server
 *                 statusCode: 500
 */
const errorHandler = (err, req, res, next) => {
  // Determine the status code: if a response status was already set, use it; otherwise, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // Only send stack trace in development for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    statusCode: statusCode
  });
};

module.exports = errorHandler;