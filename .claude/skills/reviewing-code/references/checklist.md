# Review checklist

## Contents

- Authorization
- Input validation
- Data access
- Errors
- Tests

## Authorization

- Does every write (create, change, delete) check that the caller may act on this record, not only that the caller is known?
- Is the caller's identity taken from the request (a header or a session), never from the body?
- Can one member read or change another member's data?

## Input validation

- Is every path parameter, query parameter and body field validated before use?
- Do bad inputs give a 400 with a clear message, not a 500?
- Are limits enforced at both ends (empty, too long, too large, out of range)?

## Data access

- Is every SQL statement parameterized? A value built into the SQL string is a finding. A pattern built in code and passed as a bound parameter is not.
- Are reads and writes for one request consistent with each other?

## Errors

- Do errors go through the app's shared error type, with the right status code?
- Does any error message leak internals (stack traces, SQL, file paths)?

## Tests

- Is there a test for the success path and for each refusal?
- Would the tests fail if the check under review were removed?
