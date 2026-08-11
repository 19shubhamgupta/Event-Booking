module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/__tests__/**/*.js'],
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};