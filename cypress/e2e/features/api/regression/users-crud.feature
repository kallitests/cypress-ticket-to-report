# Linked ticket: JIRA-106
@regression @api
Feature: Users API CRUD operations
  As a consumer of the Users API
  I want to create, update and delete a user
  So that the API supports the full lifecycle of a resource

  Scenario: Create a new user
    When I create a user with name "Khalid" and job "QA Engineer"
    Then the response status should be 201
    And the response body should contain name "Khalid"

  Scenario: Update an existing user
    When I update user id 2 with name "Khalid Updated" and job "Senior SDET"
    Then the response status should be 200
    And the response body should contain name "Khalid Updated"

  Scenario: Delete a user
    When I delete user id 2
    Then the response status should be 204
