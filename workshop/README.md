# Workshop materials

Welcome to _Claude Code Skills & Plugins_, a 2-hour workshop from World Wide Technology. You will work through four short labs on a working app. Everything in this folder is course material. It is not part of the app.

## Agenda

| Time | Segment                                         | Minutes |
| ---- | ----------------------------------------------- | ------- |
| 0:00 | AI-Native Engineering at WWT                    | 4       |
| 0:04 | Foundations: the extension map                  | 6       |
| 0:10 | Lab 1: Your first skill: writing tests          | 26      |
| 0:36 | Lab 2: A code review skill, with a nested skill | 26      |
| 1:02 | Lab 3: Release notes, then tune the trigger     | 26      |
| 1:28 | Lab 4: Package it as a plugin                   | 27      |
| 1:55 | Wrap-up, questions and close                    | 5       |

## Your materials

- [Pre-work](pre-work.md) ([Word version](pre-work.docx)): set up your computer before the session.
- [Foundations](foundations.md): the ideas behind the labs. Read it before or after the session.
- [Lab 1: Your first skill: writing tests](labs/01-lab-1.md) (26 minutes)
- [Lab 2: A code review skill, with a nested skill](labs/02-lab-2.md) (26 minutes)
- [Lab 3: Release notes, then tune the trigger](labs/03-lab-3.md) (26 minutes)
- [Lab 4: Package it as a plugin](labs/04-lab-4.md) (27 minutes)
- [Best practices](best-practices.md): a take-home reference for working with Claude Code.
- [Workbook](workbook.md) ([Word version](workbook.docx)): notes and exercises to fill in as you go.
- [Slides](slides.pptx): the deck from the session.

## Scripts

| Script                      | What it does                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `scripts/setup-workshop.sh` | Sets up your copy after the clone, one step at a time, asking before each step (`--yes` answers yes to all) |
| `scripts/check-setup.sh`    | Checks your computer has everything the workshop needs and tells you how to fix anything missing            |
| `scripts/reset-lab.sh <n>`  | Moves you to the start of lab `n` on a fresh branch                                                         |

Fell behind? `./scripts/reset-lab.sh <lab number>` puts you at the start of any lab.

## Next steps

Anthropic Academy has follow-on courses at https://anthropic.skilljar.com:

- Claude Code 101
- Claude Code in Action
- Introduction to agent skills
- Introduction to subagents
