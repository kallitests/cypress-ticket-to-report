import type { Page, Locator } from "@playwright/test";
import type { AeAccountPayload } from "../../fixtures/automationexercise/types";

/**
 * "Enter Account Information" — the full signup form shown after
 * LoginPage.startSignup(), and the "Account Created!"/"Account Deleted!"
 * interstitial pages that follow account creation / deletion. One POM for
 * all three since they're a single linear step of the same journey.
 */
export class AccountInfoPage {
  readonly page: Page;

  readonly titleMr: Locator;
  readonly titleMrs: Locator;
  readonly passwordInput: Locator;
  readonly daysSelect: Locator;
  readonly monthsSelect: Locator;
  readonly yearsSelect: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly address1Input: Locator;
  readonly address2Input: Locator;
  readonly countrySelect: Locator;
  readonly stateInput: Locator;
  readonly cityInput: Locator;
  readonly zipcodeInput: Locator;
  readonly mobileNumberInput: Locator;
  readonly createAccountButton: Locator;

  readonly accountCreatedHeading: Locator;
  readonly accountDeletedHeading: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleMr = page.locator("#id_gender1");
    this.titleMrs = page.locator("#id_gender2");
    this.passwordInput = page.getByTestId("password");
    this.daysSelect = page.locator("#days");
    this.monthsSelect = page.locator("#months");
    this.yearsSelect = page.locator("#years");
    this.firstNameInput = page.getByTestId("first_name");
    this.lastNameInput = page.getByTestId("last_name");
    this.companyInput = page.getByTestId("company");
    this.address1Input = page.getByTestId("address");
    this.address2Input = page.getByTestId("address2");
    this.countrySelect = page.getByTestId("country");
    this.stateInput = page.getByTestId("state");
    this.cityInput = page.getByTestId("city");
    this.zipcodeInput = page.getByTestId("zipcode");
    this.mobileNumberInput = page.getByTestId("mobile_number");
    this.createAccountButton = page.getByTestId("create-account");

    this.accountCreatedHeading = page.getByTestId("account-created");
    this.accountDeletedHeading = page.getByTestId("account-deleted");
    this.continueButton = page.getByTestId("continue-button");
  }

  async fillAndSubmit(account: AeAccountPayload): Promise<void> {
    await (account.title === "Mrs" ? this.titleMrs : this.titleMr).check();
    await this.passwordInput.fill(account.password);
    await this.daysSelect.selectOption(account.birth_date);
    await this.monthsSelect.selectOption(account.birth_month);
    await this.yearsSelect.selectOption(account.birth_year);
    await this.firstNameInput.fill(account.firstname);
    await this.lastNameInput.fill(account.lastname);
    await this.companyInput.fill(account.company);
    await this.address1Input.fill(account.address1);
    if (account.address2) await this.address2Input.fill(account.address2);
    await this.countrySelect.selectOption(account.country);
    await this.stateInput.fill(account.state);
    await this.cityInput.fill(account.city);
    await this.zipcodeInput.fill(account.zipcode);
    await this.mobileNumberInput.fill(account.mobile_number);
    await this.createAccountButton.click();
  }
}
