---
name: writing-release-notes
description: Drafts user-facing release notes for Roombook from the commits since the last release. Use when asked for release notes, a changelog entry, or a summary of what changed since the last release for users or clients.
---

# Writing release notes

1. Get the commits, grouped, from the release tool. Do not read `git log` yourself for this step:

   ```bash
   npm run changelog --silent -- --json
   ```

   It lists every conventional commit since the last `chore(release):` commit, in four groups: `breaking`, `features`, `fixes` and `other`.

2. Check the groups against `git log --oneline` since that release commit. If a commit is in the log but missing from the groups, stop and say so: the notes would be incomplete.
3. Write the notes for people who use the API, not for the team:
   - **Breaking changes** first, each with what a client must change.
   - Then **New**, then **Fixed**.
   - Leave out `chore`, `docs`, `test`, `build` and workshop commits.
   - One line per change, in plain words. No commit hashes.
4. Show the draft. Add it to the top of `CHANGELOG.md`, under a version heading, only if the user asks.
