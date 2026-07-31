# Linked ticket: JIRA-103
@regression @ui
Feature: Cart management
  As a customer of Swag Labs
  I want to add and remove products from my cart
  So that my order reflects what I actually want to buy

  Scenario: Remove an item from the cart
    Given I am logged in as "standard_user" with "Sauce Labs Backpack" in the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart badge should not be displayed
