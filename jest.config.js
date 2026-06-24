/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: ['data.js', 'combat.js', 'deck.js'],
  coverageThreshold: {
    global: { lines: 70 },
  },
};
