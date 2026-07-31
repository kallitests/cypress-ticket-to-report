# Linked ticket: JIRA-102
@regression @ui
Feature: Product sorting
  As a customer of Swag Labs
  I want to sort the product list
  So that I can find products more easily

  Scenario: Sort products by price low to high
    Given I am logged in as "standard_user"
    When I sort products by "Price (low to high)"
    Then the products should be displayed in ascending price order

  Scenario: Sort products by price high to low
    Given I am logged in as "standard_user"
    When I sort products by "Price (high to low)"
    Then the products should be displayed in descending price order
