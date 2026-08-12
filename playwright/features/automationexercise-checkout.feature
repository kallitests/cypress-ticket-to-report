Feature: Cart and checkout on automationexercise.com

  # Mirror of the Gherkin intent behind playwright/tests/automationexercise/checkout.spec.ts.

  Scenario: Add a product to the cart and place an order
    Given a registered and logged-in user
    When they add the first product from the catalog to their cart
    And they proceed to checkout and leave an order comment
    And they pay with a dummy card
    Then they land on an order confirmation page
