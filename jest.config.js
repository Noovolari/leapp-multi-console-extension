module.exports = {
  testEnvironment: "node",
  roots: ['<rootDir>'],
  testMatch: [
    "**/*.spec.ts"
  ],
  collectCoverageFrom: [
    "**/*.ts",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "src/coverage"
};
