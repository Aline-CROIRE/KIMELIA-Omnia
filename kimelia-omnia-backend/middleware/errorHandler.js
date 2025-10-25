/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: A descriptive error message.
 *           example: "Resource not found"
 *         statusCode:
 *           type: number
 *           description: The HTTP status code of the error.
 *           example: 404
 *         stack:
 *           type: string
 *           nullable: true
 *           description: Stack trace of the error (only present in development environment).
 *           example: "Error: Resource not found\\n    at..." # Use double backslash for literal \n
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             noToken:
 *               value: |
 *                 {
 *                   "message": "Not authorized, no token",
 *                   "statusCode": 401
 *                 }
 *             tokenFailed:
 *               value: |
 *                 {
 *                   "message": "Not authorized, token failed",
 *                   "statusCode": 401
 *                 }
 *     ForbiddenError:
 *       description: User does not have the necessary permissions to access this resource.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             forbidden:
 *               value: |
 *                 {
 *                   "message": "User role 'individual' is not authorized to access this route",
 *                   "statusCode": 403
 *                 }
 *     BadRequestError:
 *       description: Invalid request payload, parameters, or validation error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             invalidInput:
 *               value: |
 *                 {
 *                   "message": "Please enter all required fields",
 *                   "statusCode": 400
 *                 }
 *             validationFailed:
 *               value: |
 *                 {
 *                   "message": "Validation Error: \"title\" is required",
 *                   "statusCode": 400
 *                 }
 *     NotFoundError:
 *       description: The requested resource was not found.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             notFound:
 *               value: |
 *                 {
 *                   "message": "Resource not found",
 *                   "statusCode": 404
 *                 }
 *     ConflictError:
 *       description: A resource already exists (e.g., a user with that email already exists).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             userExists:
 *               value: |
 *                 {
 *                   "message": "User already exists with this email",
 *                   "statusCode": 409
 *                 }
 *     ServerError:
 *       description: Internal Server Error. Something unexpected happened on the server.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           examples:
 *             serverError:
 *               value: |
 *                 {
 *                   "message": "Something went wrong on the server",
 *                   "statusCode": 500
 *                 }
 */
const errorHandler = (err, req, res, next) => {
  const isValidationError = err.message.startsWith('Validation Error:');

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (isValidationError) {
    statusCode = 400;
  }

  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    statusCode: statusCode
  });
};

module.exports = errorHandler;