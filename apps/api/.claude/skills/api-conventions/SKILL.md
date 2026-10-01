---
name: api-conventions
description: The Roombook API's own rules for routes, errors and members. Use when writing, changing or reviewing code under apps/api.
---

# Roombook API conventions

- **Routes** live in `src/routes/`, one file per group, registered in `src/app.ts`. Data access goes through `src/repo.ts`, with bound parameters only.
- **Errors** are thrown as `HttpError(status, message)` from `src/errors.ts`. Zod errors become 400 automatically. Never send a 500 on purpose.
- **Ids** in paths go through `toId()`, which gives 400 `invalid id` for anything that is not a positive integer.
- **Members:** the acting member comes from the `X-Member-Id` header, read with `actingMember(request, db)` from `src/members.ts`. A missing or unknown member is 401.
- **Ownership:** a member may change or cancel only their own bookings. A different member gets 403, and the booking stays as it was.
- **Times** are UTC ISO strings on the 15-minute grid. The rules live in `src/booking-rules.ts`.
- **Tests** for each route are in `test/<route>.test.ts`, using `makeTestApp()` and `app.inject()`.
