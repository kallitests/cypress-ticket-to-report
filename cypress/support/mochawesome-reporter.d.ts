// cypress-mochawesome-reporter ships no type declarations for its /plugin
// and /register entry points.
declare module "cypress-mochawesome-reporter/plugin" {
  const registerMochawesomePlugin: (on: Cypress.PluginEvents) => void;
  export default registerMochawesomePlugin;
}

declare module "cypress-mochawesome-reporter/register";
