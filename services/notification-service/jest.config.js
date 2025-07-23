module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
  ],
  testMatch: [
    '<rootDir>/src/_tests_/**/*.test.js'
  ],
  // Force Jest to exit after tests complete
  forceExit: true,
  // Detect open handles to help debug
  detectOpenHandles: true,
  // Set a timeout for tests
  testTimeout: 10000
};