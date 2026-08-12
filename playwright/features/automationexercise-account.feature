Feature: Account lifecycle on automationexercise.com

  # Mirror of the Gherkin intent behind playwright/tests/automationexercise/account.spec.ts.
  # Not wired to a Cucumber runner (same convention as playwright/features/login.feature) —
  # kept as documentation so the scenario reads the same as the spec.

  Scenario: Register, log out, log back in, then delete the account
    Given a visitor is on the sign-in page
    When they sign up with a unique name and email
    And they fill in the full account information form
    Then their account is created and they land on the app logged in
    When they log out and log back in with the same credentials
    Then they are logged in again
    When they delete their account
    Then the account is confirmed deleted

  Scenario: Reject login with a wrong password
    Given a registered user exists
    When they submit their email with a wrong password
    Then an explicit "Your email or password is incorrect!" error is shown
