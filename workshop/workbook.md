# Workbook

Use this workbook as you go. Each lab has one page: the goal, the checkpoint that tells you you're done, space for notes and one question to think about. Fill in the page at the end of each lab, so you leave with notes you can use in your own work. The glossary at the end defines the terms the labs use.

---

## Lab 1: Your first skill: writing tests

**Goal.** Write a `writing-tests` skill with a description and a checklist of boundary cases. Ask for tests without naming the skill, and let the checklist find a real bug in the booking rules.

**Checkpoint.** `npm test` passes, `apps/api/test/booking-rules.test.ts` exists, and `git log -1` shows your commit. Post ✓ in the chat with the name of the bug your skill found.

**Notes.**

```text
My description, as I first wrote it:


Did Claude load the skill on its own? How could I tell?


The bug the checklist found:


```

**Reflection.** Which instructions do you paste into Claude again and again in your own work, and which of them would make a good first skill?

---

## Lab 2: A code review skill, with a nested skill

**Goal.** Build a `reviewing-code` skill with a short `SKILL.md`, a checklist in a reference file and a script for the exact facts, plus a nested `api-conventions` skill that loads only in `apps/api`. Review the API, reproduce what the review finds, and fix it with a test.

**Checkpoint.** The cancel request as member 2 prints a 403 status line, and booking 1 is still in the list. Post ✓ in the chat.

**Notes.**

```text
What went in SKILL.md, and what went in the checklist:


What the script does that Claude should not do by hand:


When did api-conventions show in the list?


```

**Reflection.** Which part of your own codebase has rules that apply only there, and would be a good home for a nested skill?

---

## Lab 3: Release notes, then tune the trigger

**Goal.** Write a `writing-release-notes` skill that hands the grouping to the release tool and keeps the writing for Claude. Find and fix the bug in the tool by comparing its output with the git log. Then test when the skill loads with six prompts and tune the description until every row is right.

**Checkpoint.** `npm run changelog --silent` starts with a Breaking changes section, and every row of your trigger table is ticked. Post ✓ and your score in the chat.

**Notes.**

```text
My first score, out of 6:

The words I added to or removed from the description:


disable-model-invocation: on or off, and why:


```

**Reflection.** How would you know, a month from now, that a skill you shared still loads when it should and only then?

---

## Lab 4: Package it as a plugin

**Goal.** Package the three skills as the `bookings-toolkit` plugin, list it in a local marketplace called `roombook`, install it from the desktop app, and compare what the other install routes write. Route A, the upload, installs it to your claude.ai account, not to the repo. If the upload's skills do not show, or your terminal has no `zip`, use route B1 instead.

**Checkpoint.** `/bookings-toolkit:reviewing-code` started a review in a new Code tab session, and you can say where your route recorded the plugin. Post ✓ and the route you used (for example "✓ A") in the chat.

**Notes.**

```text
The install route I used, and what it showed:


What .claude/settings.json records, and which line works only on my machine:


What a teammate who clones the repo still has to do:


```

**Reflection.** Which skills from your own team would you put in a shared plugin, and which would you keep in one repository?

---

## Glossary

| Term                       | Meaning                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Skill                      | A folder with a `SKILL.md` file of instructions that Claude loads when a request matches it, or that you run with `/` and its name        |
| `SKILL.md`                 | The skill's main file: front matter, then the steps in Markdown                                                                           |
| Front matter               | The YAML block between two `---` lines at the very top of `SKILL.md`                                                                      |
| `name`                     | The front matter field that sets the command you type. It defaults to the folder name                                                     |
| `description`              | The front matter field that says what the skill does and when to use it. Claude reads it to decide whether to load the skill              |
| `when_to_use`              | An optional field with extra trigger text. It is added to the description, and the two together are cut off at 1,536 characters           |
| Progressive disclosure     | Loading in stages: name and description always, the body when the skill is used, supporting files when needed, scripts run but never read |
| Reference file             | A supporting file, such as a checklist, that `SKILL.md` links to and Claude reads only at the step that needs it                          |
| Script                     | A supporting file Claude runs, for steps that must give the same answer every time. Only its output enters the conversation               |
| `${CLAUDE_SKILL_DIR}`      | A placeholder Claude Code replaces with the folder that holds the skill's `SKILL.md`, so a script path works from anywhere                |
| Project skill              | A skill in `.claude/skills/` in the repository, shared with everyone who clones it                                                        |
| Personal skill             | A skill in `~/.claude/skills/`, for you in every project                                                                                  |
| Nested skill               | A skill in a subfolder's own `.claude/skills/`, which loads the first time Claude reads or edits a file in that subfolder                 |
| Slash command              | A prompt you run with `/` and a name. Custom commands are now part of skills                                                              |
| Trigger table              | A list of prompts that should and should not load a skill, each run in a fresh session, with a tick when the result is right              |
| Fresh session              | A new session with no earlier conversation, so nothing from before changes what Claude does                                               |
| `disable-model-invocation` | A front matter field. Set to `true`, Claude never loads the skill on its own and you run it by name                                       |
| `allowed-tools`            | A front matter field that lets Claude use the listed tools without asking, during the turn that starts the skill                          |
| `CLAUDE.md`                | A file of things Claude should always know. All of it loads on every request                                                              |
| Subagent                   | A separate worker with its own context that does a task and returns a summary                                                             |
| Hook                       | A command Claude Code runs at a set point, such as after every edit, every time                                                           |
| MCP server                 | A connection that gives Claude tools for an outside service                                                                               |
| Plugin                     | A folder of skills, subagents, hooks and MCP servers that installs as one unit                                                            |
| Plugin manifest            | `.claude-plugin/plugin.json`, which names the plugin                                                                                      |
| Namespace                  | The plugin name in front of a plugin skill's name, as in `/bookings-toolkit:reviewing-code`                                               |
| Marketplace                | A catalog of plugins, in `.claude-plugin/marketplace.json`. You add it once and install its plugins as `plugin@marketplace`               |
| Install scope              | Where an install is recorded, and so who gets it: user, project or local                                                                  |
| `enabledPlugins`           | The settings key that lists which plugins are on                                                                                          |
| `extraKnownMarketplaces`   | The settings key that lists which marketplaces a project expects, and where to fetch them                                                 |
| Code tab                   | The part of the Claude desktop app where you run Claude Code sessions on a folder                                                         |
| Integrated terminal        | The terminal inside a Code tab session. Click **Terminal** in the session's title bar to open it                                          |
