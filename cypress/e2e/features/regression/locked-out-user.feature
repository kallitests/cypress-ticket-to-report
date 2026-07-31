# Linked ticket: JIRA-104
@regression @ui @negative
Feature: Locked out user
  As the Swag Labs system
  I want to prevent locked out users from logging in
  So that access control is enforced

  Scenario: Locked out user cannot log in
    Given I am on the Swag Labs login page
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see the error message "Epic sadface: Sorry, this user has been locked out."
