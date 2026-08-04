# ADR 0001 — App Actions, with light Page Objects for stable UI chrome

**Status:** Accepted
**Date:** 2026-08-04

## Context

The previous iteration of this repo used Cucumber/Gherkin BDD against saucedemo.com.
The POC now targets [cypress-realworld-app](https://github.com/cypress-io/cypress-realworld-app)
(RWA), a real, non-trivial single-page app with backend state (users, transactions,
notifications, contacts). RWA's own maintainers recommend the **App Actions**
pattern over classic Page Objects for exactly this kind of app — see their
[testing README](https://github.com/cypress-io/cypress-realworld-app) and their
own `cypress/tests` suite, which is built the same way.

Classic Page Objects wrap every page in a class with methods per element. For an
app whose screens are mostly transient flows (sign in once, create a transaction,
move on) rather than pages a user revisits and re-verifies structurally, that adds
a layer of indirection without much payoff, and tends to fossilize into
one-God-object-per-page as the suite grows.

## Decision

- **App Actions** (`cypress/support/app-actions/*.ts`) are the primary building
  block: small, composable functions grouped by domain concept (`authActions`,
  `transactionActions`, `dbActions`), not by screen. A test reads like the
  business flow it exercises (`authActions.loginByApi()` →
  `transactionActions.sendPayment()`), not like a sequence of page visits.
- **Light Page Objects are not used as classes.** Stable, structural UI chrome
  (nav, sidenav) is addressed directly through the shared `getByTestId` /
  `getByTestIdLike` custom commands (see `cypress/support/commands.ts`), which
  is effectively a one-line "page object" for the app's selector convention as
  a whole, rather than one object per page.
- App Actions call the **UI** when the flow under test *is* the point (e.g. the
  sign-in form, the payment form — see the smoke suite), and call the **API
  directly** when the flow is setup/teardown for a different test (e.g.
  `dbActions.reseed()`, `dbActions.getUsers()`, `authActions.loginByApi()`).

## Consequences

- Faster to write and read for flow-shaped tests; less abstraction to maintain.
- No page-level assertion helpers to keep in sync with the DOM structure of
  screens no one is testing yet — assertions live in the spec, next to the
  action that produced the state being asserted.
- If the suite grows into many more screens with rich, revisited internal
  state (e.g. a settings page with a dozen fields), revisit this ADR — a
  thin, function-based "page object" module per screen would still fit
  alongside App Actions without contradicting this decision.
