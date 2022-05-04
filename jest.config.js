/* eslint-env node */

module.exports = {
  preset: "ts-jest",
  modulePathIgnorePatterns: ["<rootDir>/build/"],
  moduleNameMapper: {
    // Jest struggles to process d3 v7 because it's pure ESM.
    // So the whole d3 has been added as a dependency and it's mapped here so its puilt is used instead of all the individual packages
    "d3-.+": "<rootDir>/node_modules/d3/dist/d3.js",
    "\\.(css|less)$": "<rootDir>/css/__mocks__/styleMock.js",
  },
  // transformIgnorePatterns: ["/node_modules/(?!(d3.*)/)"],
  testEnvironment: "jsdom",
};
