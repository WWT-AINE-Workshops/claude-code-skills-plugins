# Foundations

You already use Claude Code. This workshop is about the work you repeat: the checklist you paste into every review, the way you always ask for tests, the steps you follow before a release. A skill writes that work down once, in a file Claude loads only when a request needs it. A plugin packages skills so a whole team installs them in one go.

This chapter explains the ideas the four labs rest on. You can read it before the session, or after it as a reference. It takes about ten minutes.

You work in the **Code** tab of the Claude desktop app, in a local session on your copy of the workshop repository. The `claude` command-line tool (the CLI) is optional. Where it differs, the labs add a line that starts "In the CLI:".

## The extension map

Claude Code has several ways to extend what it knows and does. They plug into the same loop: you ask, Claude reads and acts, and each extension adds something at a different point. The big difference between them is what they cost in context, which is the space Claude has to think in on every turn.

| Extension     | What it is for                                                                                               | When it costs context                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `CLAUDE.md`   | Things Claude should always know: conventions, build commands, project layout, rules such as "never do X"    | All of it, on every request. Keep it short and move reference material into skills |
| Skill         | Knowledge Claude needs sometimes (a style guide, API rules), or a workflow you run by name (review, release) | The name and description on every turn; the rest only when the skill is used       |
| Slash command | A prompt you run by typing `/` and its name                                                                  | Custom commands are now part of skills, so they cost the same as a skill           |
| Subagent      | A separate worker with its own context that does a task and returns only a summary                           | Nothing in your context while it works; only its summary comes back                |
| Hook          | A command Claude Code runs at a set point, such as after every file edit                                     | Nothing, unless the hook returns output                                            |
| MCP server    | A connection to an outside service or tool, such as a database or a ticket system                            | The names of its tools, from the start of the session                              |
| Plugin        | A package of skills, subagents, hooks and MCP servers that installs as one unit                              | What its parts cost, in every session where it is turned on                        |

**Slash commands are skills now.** A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both give you `/deploy`, and they work the same way. Old command files keep working. Skills add supporting files, control over who can start them, and loading on their own when a request matches, so use a skill for anything new.

### Pick the right one

Ask two questions. Should this happen every time, or only when it fits? And is it something Claude should know, or something that should run?

- **Claude should always know it:** put it in `CLAUDE.md`. Keep that file short, because all of it loads on every request.
- **Claude needs it sometimes, or you run it by name:** make it a skill. Only its description costs context until it is used.
- **It reads many files, or you want it out of your main conversation:** use a subagent, so only the summary comes back.
- **It must happen the same way every time:** use a hook. An instruction in `CLAUDE.md` or a skill is a request that Claude follows most of the time. A hook runs on its event whether or not Claude remembers.
- **Claude needs to reach an outside system:** add an MCP server. A skill can then teach Claude how to use that server's tools well.
- **You want to share any of these with a team, or use them in many repos:** package them as a plugin.

For example, a rule that every commit message must name a ticket, checked before each commit, is a hook. Your team's guide to naming database tables is a skill. The command that starts the dev server is a line in `CLAUDE.md`.

## What a skill is

A skill is a folder with a file called `SKILL.md` in it. The file has two parts:

- **Front matter**, a short block of YAML between two `---` lines. The opening `---` must be the very first line of the file, or Claude Code does not read the block. Every field is optional, but you almost always want two. `name` becomes the command you type, and defaults to the folder name. `description` says what the skill does and when to use it.
- **A body** of Markdown instructions: the steps Claude follows once the skill loads.

The folder can also hold supporting files: reference documents such as a checklist, examples, and scripts. `SKILL.md` links to each one and says when to use it.

```text
.claude/skills/reviewing-code/
├── SKILL.md                 front matter and the steps
├── references/
│   └── checklist.md         read only when Claude reaches that step
└── scripts/
    └── review-context.sh    run, not read
```

You can start a skill in two ways. Claude loads it on its own when your request matches its description. Or you run it yourself by putting `/` and its name at the start of a message, such as `/writing-tests`, with anything else you want to say after it. A skill can also opt out of the first way: with `disable-model-invocation: true` in its front matter, only you can start it.

Make a skill when you keep pasting the same instructions or checklist into chat, or when a section of `CLAUDE.md` has grown into a procedure.

### Progressive disclosure

A skill loads in stages, so it costs context only as it is needed:

1. **Always:** the name and description of every skill are in Claude's list on every turn. That is how Claude knows the skill exists and decides whether to use it.
2. **When the skill is used:** the body of `SKILL.md` loads into the conversation.
3. **When Claude needs them:** supporting files load only when Claude reaches the step that names them.
4. **Never loaded:** scripts are run, not read. Only their output enters the conversation.

This is why the description matters so much. It is the only part Claude sees when it decides, so it has to say what the skill does and when to use it, in the words people actually type. It is also why `SKILL.md` stays short: long detail goes in a reference file that loads only when needed.

## Where skills live

Where you save a skill decides which sessions can use it.

| Where    | Path                                         | Who gets it                                                      |
| -------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Personal | `~/.claude/skills/<name>/SKILL.md`           | You, in every project                                            |
| Project  | `.claude/skills/<name>/SKILL.md`             | Everyone who works in this repository, once you commit it        |
| Nested   | `<subfolder>/.claude/skills/<name>/SKILL.md` | Everyone in this repository, when Claude works in that subfolder |
| Plugin   | `<plugin>/skills/<name>/SKILL.md`            | Everyone who installs the plugin                                 |

Organizations can also hand out skills through managed settings. When two skills share a name, the organization's wins over your personal one, and your personal one wins over the project's. Plugin skills never clash, because their names carry the plugin's name (see below).

Claude Code loads project skills from `.claude/skills/` in the folder where the session starts, and in each parent folder up to the root of the repository.

**A new skills folder needs a new session.** Claude Code watches the skills folders that existed when the session started, and picks up added or edited skills there without a restart. If the project had no `.claude/skills/` folder when you started, the session does not see the first skill you add. Start a new session, or, if your surface has it, run `/reload-skills`.

### Nested skills, and why you would put one in a subfolder

A nested skill lives in a `.claude/skills/` folder inside a subfolder of the repository, such as `apps/api/.claude/skills/`. It does not load when the session starts. It loads the first time Claude reads or edits a file in that subfolder, and then stays for the rest of the session. Until then it is not in the `/` list and you cannot run it by name. To load it sooner, add the subfolder with `/add-dir`.

Put a skill in a subfolder when its rules apply to one part of the repository only:

- It costs nothing elsewhere. In a monorepo, the API's error conventions do not need to sit in Claude's list while you work on the web app or the release tools.
- It sits next to the code it describes. The team that owns the package owns the skill, and changes to both land in the same pull request.
- It does not mislead. Rules for one package do not leak into work on another package where they are wrong.

A nested skill keeps its plain name. If it has the same folder name as another skill, both stay available, and you run the nested one by a longer name that includes its folder.

## Plugins and marketplaces

### A plugin is the package

A plugin is a folder that Claude Code installs and loads as one unit. It can hold skills, subagents, hooks and MCP servers. It has a manifest at `.claude-plugin/plugin.json`, where `name` is the only required field. Use lowercase words joined by hyphens, because the name becomes the prefix on every skill in the plugin.

```text
plugins/bookings-toolkit/
├── .claude-plugin/
│   └── plugin.json          the manifest, and nothing else in this folder
├── skills/
│   ├── reviewing-code/SKILL.md
│   └── writing-tests/SKILL.md
└── hooks/
    └── hooks.json           optional
```

Only `plugin.json` goes inside `.claude-plugin/`. The skills, hooks and other parts go at the plugin's root. Anything saved inside `.claude-plugin/` does not load.

**Plugin skills are namespaced.** A skill in a plugin runs as `/<plugin>:<skill>`, such as `/bookings-toolkit:reviewing-code`. Two plugins can each have a `reviewing-code` skill without a clash.

**When to make one.** Keep skills in `.claude/skills/` while they serve one repository or only you. Make a plugin when you want the same skills in several repositories, want to share them with a team, or want to release versions. Remember the cost: a plugin that is turned on is part of every session. The descriptions of its skills are in Claude's list on every turn, and its hooks fire at their events.

### A marketplace is the catalog

A marketplace is a repository or a folder with a file at `.claude-plugin/marketplace.json`. The file has a `name`, an `owner`, a one-sentence `description` and a list of `plugins`. Each entry in the list says where to fetch the plugin from. A plugin inside the same repository uses a relative source that starts with `./`, such as `./plugins/bookings-toolkit`. That path is read from the marketplace's root, the folder that holds `.claude-plugin/`.

You add a marketplace once. Then you install its plugins by name, as `plugin@marketplace`: `bookings-toolkit@roombook` is the `bookings-toolkit` plugin from the `roombook` marketplace. A marketplace can live in a git repository, so one shared repository can be the catalog for a whole team.

### Ways to install a plugin

Lab 4 walks through four routes. You do the first one hands-on; the others are a short reference.

1. **Upload it in the desktop app (route A, the default).** In the desktop app, open **Customize**, then the **Plugins** tab, then **+ Add** and **Upload plugin**. The upload goes through your claude.ai account, and Claude Code loads it as `bookings-toolkit@synced`. The docs say synced plugins load in Cowork, and in terminal sessions signed in with that account. They don't name the Code tab. If the plugin's skills do not show there, lab 4 sends you to route B1. A Windows-side copy uses route B1 too, because Git Bash has no `zip` to build the upload.
2. **By hand (routes B1 and B2).** Either place the plugin as a skills-directory plugin in `.claude/skills/<name>/`, or write the two entries in `.claude/settings.json` yourself (the next section shows them). A project's `.claude/plugins/` folder is not scanned, so do not put a plugin there.
3. **Add the marketplace from the folder (route C).** With the CLI, `claude plugin marketplace add ./` registers the folder that holds `.claude-plugin/marketplace.json` as a marketplace, with a scope.
4. **Install from the shell (route D).** Then `claude plugin install` installs the plugin from that marketplace by name, `bookings-toolkit@roombook`, with a scope.

Routes C and D run in the Code tab's integrated terminal: click **Terminal** in the session's title bar, or press ``Ctrl+` ``. They are optional, and so is the CLI.

For a plugin installed from a marketplace, **Manage plugins**, in the same **+** menu, turns it on or off or removes it.

The desktop app, the CLI and the VS Code extension on one computer read the same settings files, so a plugin installed in one shows in the others. Plugins are not available in the desktop app's WSL sessions.

## Install scopes and what settings.json records

When you install a plugin, you choose a scope. The scope decides which settings file records it, and so who gets it.

| Scope   | File                                            | Who gets it                                             |
| ------- | ----------------------------------------------- | ------------------------------------------------------- |
| User    | `~/.claude/settings.json`                       | You, in every project                                   |
| Project | `.claude/settings.json` in the repository       | Everyone in the repository, once you commit the file    |
| Local   | `.claude/settings.local.json` in the repository | You, in this repository only. The file is not committed |

Local overrides project, and project overrides user.

Two keys in a settings file matter here:

- `extraKnownMarketplaces` lists the marketplaces this project expects to exist, and where to fetch each one.
- `enabledPlugins` lists the plugins that are turned on. Each key is `plugin@marketplace`, and `true` means on.

A project-scope install of the workshop plugin from a marketplace in a local folder records something like this. The `path` is the full path to the folder on the machine that added it:

```text
{
  "extraKnownMarketplaces": {
    "roombook": {
      "source": {
        "source": "directory",
        "path": "/path/to/your/copy"
      }
    }
  },
  "enabledPlugins": {
    "bookings-toolkit@roombook": true
  }
}
```

Committing this file turns the plugin on for everyone who clones the repository. It does not put the plugin on their machine. A teammate still has to:

- Trust the folder. The first time they open the repository, Claude Code asks whether to trust it, because committed files like this one can change what it does.
- Reach the marketplace. A `path` to a folder on your disk means nothing on their machine. For a team, declare the marketplace from a git repository instead, so the entry means the same thing everywhere.
- Install the plugin. A committed entry does not download the plugin. Each teammate installs it once. A plugin whose marketplace entry uses a relative `./` source is the exception: it loads straight from the marketplace, as long as the marketplace is on their machine.

## Where each idea shows up in the labs

| Idea                                                   | Where you practise it      |
| ------------------------------------------------------ | -------------------------- |
| A skill's front matter and body                        | Lab 1 step 2               |
| Claude loading a skill from a plain request            | Lab 1 step 3               |
| A new skills folder needs a new session                | Lab 1 step 3               |
| A short `SKILL.md` with a reference file               | Lab 2 step 1               |
| A script for the exact facts                           | Lab 2 step 2, Lab 3 step 1 |
| A nested skill that loads only in its folder           | Lab 2 steps 3 and 4        |
| Testing when a skill loads                             | Lab 3 step 4               |
| Tuning the description, and `disable-model-invocation` | Lab 3 step 5               |
| A plugin, a marketplace, install routes and scopes     | Lab 4                      |
| A hook in a plugin                                     | Lab 4 stretch goals        |
