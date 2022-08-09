module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.js'],
  transform: {
    "\\.[jt]sx?$": "ts-jest"
  }
};
