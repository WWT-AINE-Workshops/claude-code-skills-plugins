---
name: writing-tests
description: Writes Vitest tests for the Roombook API and its modules. Use when asked to add, write or improve tests, or to cover a file, function or endpoint with tests.
---

# Writing tests

Follow these steps for any module or endpoint in `apps/api`.

1. Read the code under test. List each exported function or route, its inputs and what it returns.
2. Put the tests in `apps/api/test/<module>.test.ts`, next to the existing ones.
   - Pure functions: import them from `../src/<module>` and call them directly.
   - Routes: use `makeTestApp()` from `./helpers` and `app.inject()`. Each test gets a fresh, seeded in-memory database.
3. Use UTC ISO date-times that end in `Z`, such as `2026-11-02T09:00:00.000Z`, so the tests do not depend on the machine's time zone.
4. Write table-driven cases with `it.each`, one row per case, with a name that says what the row proves.
5. Always cover the boundaries:
   - equal values (start equals end, a value exactly at a limit);
   - adjacent values (one range ends exactly where the next starts);
   - empty input;
   - one step past each limit, on both sides.
6. Run `npm test`. If a case fails, report it as a possible bug and show the failing row. Do not change the code under test, or the test, to make it pass, until the user agrees which one is wrong.
