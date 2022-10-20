module.exports = {
  testEnvironment: "node",
  roots: ['<rootDir>'],
  testMatch: [
    "**/*.spec.ts"
  ],
  collectCoverageFrom: [
    "**/*.js",
    "**/*.ts",
    "!**/*.config.js",
    "!**/coverage/**",
    "!**/config/**",
    "!**/build/**",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "coverage"
};
