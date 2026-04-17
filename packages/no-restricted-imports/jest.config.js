/** @type import('jest').Config */
const config = {
  extensionsToTreatAsEsm: [".mts"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.m?ts$": [
      "ts-jest",
      {
        tsconfig: {
          module: "ESNext",
          moduleResolution: "bundler",
          verbatimModuleSyntax: false,
        },
        useESM: true,
      },
    ],
  },
};

export default config;
