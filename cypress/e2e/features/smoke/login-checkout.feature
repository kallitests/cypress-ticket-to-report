# Linked ticket: JIRA-101 (see tickets/ticket-101.json)
@smoke @ui
Feature: Login and checkout critical path
  As a customer of Swag Labs
  I want to log in and purchase a product
  So that I receive an order confirmation

  Scenario: Standard user can log in and complete a purchase
    Given I am on the Swag Labs login page
    When I log in with username "standard_user" and password "secret_sauce"
    Then I should see the products inventory page
    When I add "Sauce Labs Backpack" to the cart
    And I proceed to checkout
    And I fill in checkout information "John" "Doe" "12345"
    And I finish the checkout
    Then I should see the order confirmation message "Thank you for your order!"
