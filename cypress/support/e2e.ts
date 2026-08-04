import "./commands";
import "cypress-mochawesome-reporter/register";
import { register as registerCypressGrep } from "@cypress/grep";
import "cypress-axe";

registerCypressGrep();
