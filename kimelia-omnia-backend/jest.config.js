module.exports = {
  preset: '@shelf/jest-mongodb', // Use the MongoDB preset
  testEnvironment: 'node',      // Node.js environment for backend tests
  setupFilesAfterEnv: ['./jest.setup.js'], // Setup file for Mongoose connection/disconnection
  testPathIgnorePatterns: ['/node_modules/'], // Ignore node_modules
  coveragePathIgnorePatterns: ['/node_modules/', '/config/', '/dist/', '/__tests__/setup.js'], // Ignore specific folders from coverage
  testTimeout: 30000, // Extend timeout for tests, especially those involving database or external APIs
  forceExit: true, // Exit Jest process after tests complete
};