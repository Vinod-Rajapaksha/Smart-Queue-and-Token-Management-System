export default {
  testEnvironment: "node",
  roots: ["<rootDir>/src/tests"],
  testMatch: ["**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/jest.setup.js"],

  transform: {},

  collectCoverageFrom: [
    "src/**/*.js", 
    "!src/server.js", 
    "!src/config/**/*.js"
  ],
  
  testTimeout: 30000,
};
