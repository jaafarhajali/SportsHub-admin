module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  testTimeout: 10000,
  // Tests that rely on the real DB / env should use .env.test; smoke tests below
  // don't need a DB connection at all.
};
