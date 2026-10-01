---
name: reviewing-code
description: Reviews code in this repository for bugs, security holes and missing tests, and reports findings by severity. Use when asked to review, audit or check a file, a route, a commit or a change before it ships.
---

# Reviewing code

1. Collect the facts first. Run the context script with the files or the commit to review:

   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/review-context.sh" <file-or-commit>...
   ```

   It prints each file's size, its recent commits and the tests that cover it. Read every file it lists.

2. Read [the checklist](references/checklist.md) and work through every section for the code under review.
3. For each finding, check it before you report it: reproduce it with a test, a `curl` command or a short script. Drop anything you cannot show.
4. Report the findings in a table, most severe first: severity (Critical, Important, Minor), file and line, what goes wrong, and how you showed it.
5. Do not change any code during the review. Offer to fix the findings afterwards, one at a time, each with a test.
