module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  setupFiles: ["dotenv/config"],
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.js",
    "!src/**/*.spec.js"
  ],
  verbose: true
};