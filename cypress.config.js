const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");

async function setupNodeEvents(on, config) {
  await addCucumberPreprocessorPlugin(on, config);

  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    })
  );

  require("cypress-mochawesome-reporter/plugin")(on);

  return config;
}

module.exports = defineConfig({
  e2e: {
    // UI target: Sauce Labs demo e-commerce app (Swag Labs)
    baseUrl: "https://www.saucedemo.com",
    specPattern: "cypress/e2e/features/**/*.feature",
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents,
    env: {
      // API target: public REST sandbox used to demonstrate API smoke/regression tests
      apiBaseUrl: "https://reqres.in/api",
    },
  },
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "reports/mochawesome",
    overwrite: false,
    html: true,
    json: true,
  },
});
