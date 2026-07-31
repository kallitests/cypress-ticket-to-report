# Linked ticket: JIRA-105
@smoke @api
Feature: Users API health check
  As a consumer of the Users API
  I want to retrieve an existing user
  So that I can confirm the API is up and returning valid data

  Scenario: Retrieve an existing user
    When I request the user with id 2
    Then the response status should be 200
    And the response body should contain email "janet.weaver@reqres.in"
