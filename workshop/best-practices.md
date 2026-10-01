# Best practices for writing skills

This chapter is a reference for after the workshop. Each section says what to do and why it works. Its last line says where in the labs you practise it. Read it before you write your next skill, and come back to the checklist at the end before you share one.

## 1. Write the description so Claude picks the skill

The description is the only part of a skill that Claude sees when it decides which skill to use. Everything else loads later, if at all. So the description has to do the choosing on its own.

- Say what the skill does, then when to use it. Put the main use first. Name the requests that should load it, in the words people actually type.
- Write in the third person. The description goes into Claude's instructions, so "Writes Vitest tests for a module" reads right, and "I can help you write tests" or "You can use this to write tests" does not.
- Be specific. A vague description loads for the wrong requests or for none. Name the task, the kind of input and the output.
- Mind the cap. You can add trigger phrases or example requests in a `when_to_use` field. Claude Code adds it to the description in the skill list, and the two together are cut off at 1,536 characters. Anything past that, Claude never sees.
- Get the front matter right. The opening `---` must be the first line of the file. If the YAML does not parse, the skill still loads but has no description, so Claude cannot match it. A value that contains a colon followed by a space needs quotes. A field name with a typo is ignored without any error.

Compare two descriptions for a skill that writes database migrations:

```text
description: Helps with database stuff.

description: Writes SQL migration files for the orders database, with an up and a down step and a test that runs both. Use when adding, renaming or dropping a table or column, or when asked for a migration or schema change.
```

The first one could match almost anything, or nothing. The second says what it makes and names the requests that should load it.

Give the skill a clear name too. A verb plus "-ing", in lowercase with hyphens, such as `writing-tests`, says what it does. Avoid names such as `helper` or `utils`.

**Practised in** Lab 1 step 2 and Lab 3 step 1. The `when_to_use` field is in Lab 3's stretch goals.

## 2. Keep SKILL.md short, and put detail one level deep

Claude shares its context between your conversation, its instructions and every skill it loads. Each line in `SKILL.md` costs space once the skill is used. Claude is already capable, so add only what it would not know, such as your conventions and your checklist.

- Keep the body to the steps. Aim well under 500 lines. When it grows, move the detail out.
- Put detail in reference files, and link each one from `SKILL.md`. Say when to read it, such as "When you reach the checklist step, read references/checklist.md". The file then loads only at that step.
- Stay one level deep. Link every reference file straight from `SKILL.md`. A file that is only linked from another reference file may be read only in part.
- Give long reference files a table of contents. For a file over about 100 lines, a short list of sections at the top shows Claude what is in it, even from a partial read.
- Use forward slashes in paths, such as `references/checklist.md`, even on Windows.

**Practised in** Lab 2 step 1, where the review steps go in `SKILL.md` and the checklist goes in a reference file. Lab 1's stretch goals move the test patterns out the same way.

## 3. Use a script for the exact steps

Some steps must give the same answer every time, such as counting lines or grouping commits. Claude can do these, but a script does them the same way on every run. It also costs fewer tokens, and it is easier to check. Claude runs the script and reads only its output, not its source.

- Match the freedom to the task. Where many approaches are fine, such as writing prose or judging code, give guidance in words. Where steps must not vary, give a script.
- Say whether to run the script or read it. "Run scripts/review-context.sh" and "See scripts/review-context.sh for the format" mean different things.
- Write the path with `${CLAUDE_SKILL_DIR}`. Claude Code replaces it with the folder that holds the skill's `SKILL.md`, so the command works from any working directory, and from inside a plugin.

```text
bash "${CLAUDE_SKILL_DIR}/scripts/review-context.sh" <files or commits>
```

- Check the tool, not only the skill. If the script is wrong, the skill repeats the mistake. Compare the script's output with the source now and then.

**Practised in** Lab 2 step 2 (a context script for reviews) and Lab 3 steps 1 to 3 (a release tool, and the bug you find by comparing its output with the git log).

## 4. Keep the scope tight, and nest skills that belong to one folder

One skill should do one job. A skill that reviews code, writes tests and drafts release notes has a description too broad to trigger at the right time, and a body too long to stay cheap. Three skills, each with a sharp description, load only when each one fits.

When a skill's rules apply to one part of the repository only, put it in that part's own `.claude/skills/` folder, such as `apps/api/.claude/skills/`. A nested skill loads the first time Claude reads or edits a file in that folder, so it costs nothing while you work elsewhere. It also sits next to the code it describes, so the people who own that code keep it current.

Keep repository-specific skills out of a shared plugin. A skill that describes one repository's API is wrong in every other repository that installs the plugin.

**Practised in** Lab 2 step 3 (the nested `api-conventions` skill) and Lab 2 step 4, where you see it load only after Claude opens a file in `apps/api`.

## 5. Test when the skill loads, with prompts that should and should not load it

Seeing a skill load once shows that Claude found it. It does not show that it loads every time it should, or only then.

- Write both kinds of prompt. Write three or more requests that should load the skill, each in different words. Then write three or more that sit close by but should not load it, such as a question about the same files that asks for something else.
- Run each prompt in a fresh session. An earlier prompt in the same session can change what Claude does next. A skill that already loaded also stays in the conversation, and an edited `SKILL.md` shows reliably only in a new session.
- Keep score in a table, then change one thing at a time.
- Fix a miss by adding the words from the missed request to the description.
- Fix a false load by making the description more specific: say what the skill is for and what it is not for.
- Check the output too. Loading is half the test. Run a few real tasks with the skill and without it, and compare what you get.
- Test with each model you use. Instructions that work for one model may need more detail for a smaller one.

If you want to go further, write the test prompts before the skill. Run Claude on real tasks without a skill, note what it gets wrong, and write just enough to fix that. A good way to work is to have one Claude session help you write the skill and a fresh one try it on real tasks.

When a skill does not load at all, ask Claude which skills it has. If yours is not listed, the file is in the wrong place or the front matter does not parse. You can always start it yourself with `/` and its name.

**Practised in** Lab 3 step 4 (the trigger table) and Lab 3 step 5 (fixing the description until every row is right).

## 6. Keep actions with side effects on request

Some skills do things you want to start yourself: deploy, publish, send a message, change a shared file. For these, set `disable-model-invocation: true` in the front matter. Claude then never starts the skill on its own, and its description leaves Claude's context altogether. You still run it whenever you want, with `/` and its name at the start of a message.

Know the trade-off. A skill with this setting no longer loads from a plain request, so your "should load" prompts stop loading it. Choose it when the timing matters more than the convenience.

If Claude still skips a rule that must hold every time, a skill is the wrong tool. An instruction in a skill or in `CLAUDE.md` is a request. A hook runs on its event every time, whether or not Claude follows the skill.

**Practised in** Lab 3 step 5, where you decide whether the release-notes skill sets it, and say why.

## 7. Pre-approve the exact tools a skill needs

`allowed-tools` in the front matter lists tools Claude can use without asking for permission, during the turn that starts the skill. Use it for the one command the skill always runs, such as its own script, and write that rule with `${CLAUDE_SKILL_DIR}` so it matches wherever the skill lives. For a skill with a script at `scripts/render.sh`, the line looks like this:

```text
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
```

Two things it does not do. The approval ends when you send your next message, so a later turn asks again. And it restricts nothing: every other tool is still available, with the usual permission prompts. Keep the list short and exact, because each entry is a command that runs without you seeing a prompt.

**Practised in** Lab 2's stretch goals.

## 8. Share skills through a plugin and a git-hosted marketplace

Skills committed in `.claude/skills/` already reach everyone who clones that one repository. When the same skills should reach several repositories, or a team wants versions and one place to update them, package them as a plugin.

- Move, do not copy. While the original skills stay in `.claude/skills/`, they load next to the plugin's copies, so you see both `/reviewing-code` and `/bookings-toolkit:reviewing-code`. Remove the originals once the plugin works.
- Keep the plugin lean. Every enabled plugin adds its skills' descriptions to Claude's list on every turn. Ship the skills a team uses, not every skill anyone has written.
- Host the marketplace in git. A marketplace declared from a folder on your disk points at a path that exists only on your machine. A marketplace in a git repository means the same thing on every machine, so that is the entry a team commits.
- Write down what a teammate still has to do. A committed project setting turns the plugin on, but each teammate still trusts the folder, adds the marketplace and installs the plugin once.

**Practised in** Lab 4, which packages the three skills as a plugin, lists it in a marketplace, installs it and reads what the install wrote. Declaring the marketplace from git is one of Lab 4's stretch goals.

## Checklist before you share a skill

- The opening `---` is the first line of `SKILL.md`, and the front matter parses.
- The name is a lowercase verb with "-ing", and says what the skill does.
- The description is in the third person, says what and when, puts the main use first, and stays well under 1,536 characters with `when_to_use`.
- `SKILL.md` holds the steps only. Detail is in reference files linked straight from it, each with a line on when to read it.
- Exact steps are scripts, called with `${CLAUDE_SKILL_DIR}`, and the text says to run them.
- The skill does one job. Rules for one folder are in a nested skill in that folder.
- You ran a trigger table of should-load and should-not-load prompts, each in a fresh session, and every row came out right.
- Skills with side effects set `disable-model-invocation: true`.
- `allowed-tools`, if set, lists only the exact commands the skill runs.
- A rule that must hold every time is a hook, not a line in the skill.
