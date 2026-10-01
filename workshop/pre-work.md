# Pre-work for Claude Code Skills & Plugins

Do this before the session. It takes about **30 to 45 minutes**, and most of that is waiting for downloads. On Windows, if you start without WSL, git or Node, allow about an hour. In the session you will start working in the first few minutes, so a ready laptop matters.

When you finish, the tools are installed, and your own private copy of the workshop repository is set up on your machine. A Claude Code session is open on that copy in the Claude desktop app. You do not need to know the topic yet.

**What you need.** A laptop where you can install software, an internet connection, and a GitHub account. For Claude Code you also need a way to sign in. The Code tab in the desktop app needs a paid Claude plan (Pro, Max, Team or Enterprise). The docs list the sign-in options, so read their authentication page before you start: https://code.claude.com/docs/en/authentication.

**Where you work in the session.** The labs run in the **Code** tab of the Claude desktop app, in a session on your copy of the repository. The desktop app includes Claude Code, so you do not need the `claude` command-line tool (the CLI). If you already use the CLI, you can keep it, and the labs mention it where it differs.

**Lab 4 and your claude.ai account.** Lab 4 installs a plugin from the desktop app too: it uploads the workshop's plugin to your claude.ai account, and you remove it at the end of the lab. If your organization manages your Claude account, check with your admin that you may upload plugins.

**Which computer.** The steps are written for macOS. Windows works too, with WSL, a Linux system inside Windows. You run the commands in WSL, and the Code tab runs its session there. Linux works the same way as WSL. Windows has one limit, explained in Step 8: plugins do not load in the Code tab's WSL sessions, so lab 4 needs the facilitator's screen or a second copy on the Windows side.

**Where to type commands.** Every command below runs in a terminal. On macOS that is the Terminal app. On Linux it is your terminal. On Windows it is the Ubuntu window that WSL gives you, and the first step shows how to set it up. Lines in grey boxes are commands: copy one box at a time, paste it into the terminal and press Enter.

**Version numbers will differ.** Your numbers will not match the examples exactly. That is fine.

## Step 1: Install git and the GitHub CLI

**Who does it:** Everyone.

**Why it matters:** The labs use git to track changes and the GitHub CLI (`gh`) to create your own copy of the workshop repository.

**Windows users: set up WSL first.** The workshop does not run in PowerShell or CMD. Open PowerShell as an administrator (right-click it, then choose Run as administrator) and run this:

```powershell
wsl --install
```

What this does: turns on Windows Subsystem for Linux and installs Ubuntu. It needs a restart, and leaves your Windows files alone.

Restart your computer when it asks. Then open Ubuntu from the Start menu, pick a username and password, and wait for the prompt to appear. From here on, type everything in that Ubuntu window, and follow the **Linux and WSL** commands below. Microsoft's guide is at https://learn.microsoft.com/en-us/windows/wsl/install. Keep your work in your Linux home folder, not under `/mnt/c`, because it is faster and avoids permission problems.

**How to do it.**

1. Install **git**.
   - **macOS:** run `xcode-select --install`, or `brew install git` if you use Homebrew (https://brew.sh).
   - **Linux and WSL:**

     ```bash
     sudo apt-get update && sudo apt-get install -y git curl build-essential
     ```

     What this does: refreshes the list of Ubuntu packages and installs git and curl, plus the compilers some packages need. It asks for your password because it uses `sudo`.

   - Tell git who you are. Use your own name and email.

     ```bash
     git config --global user.name "Your Name"
     ```

     What this does: sets the name git puts on your commits, for every repository on this computer. It changes no files in any repository.

     ```bash
     git config --global user.email you@example.com
     ```

     What this does: sets the email address git puts on your commits, for every repository on this computer. It changes no files in any repository.

2. Install the **GitHub CLI**.
   - **macOS:** if you have Homebrew, run the command below. If you do not, either install Homebrew first from https://brew.sh (it needs administrator rights), or download the GitHub CLI installer from https://cli.github.com.

     ```bash
     brew install gh
     ```

     What this does: installs the GitHub CLI, `gh`, with Homebrew. It does not sign you in.

   - **Linux and WSL:** the official apt instructions are at https://github.com/cli/cli/blob/trunk/docs/install_linux.md. For Ubuntu and Debian, paste this whole block as one command:

     ```bash
     (type -p wget >/dev/null || (sudo apt update && sudo apt install wget -y)) && sudo mkdir -p -m 755 /etc/apt/keyrings && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg && sudo mkdir -p -m 755 /etc/apt/sources.list.d && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null && sudo apt update && sudo apt install gh -y
     ```

     What this does: adds GitHub's package source and its signing key to apt, then installs `gh`. It asks for your password because it uses `sudo`, and it does not sign you in.

3. Open a **new terminal window** so your shell picks up the changes, then check each tool.

   ```bash
   git --version
   ```

   What this does: prints the version of git on your PATH. It changes nothing.

   ```bash
   gh --version
   ```

   What this does: prints the version of `gh`. It changes nothing.

**Done when:** both commands print a version number.

**If you get stuck.**

- `wsl --install` needs a restart and may need administrator rights, so allow extra time on Windows.
- Your company laptop blocks installs: ask your IT team, or bring a personal laptop. Tell the facilitator ahead of time and we will find a way.
- On another Linux distribution, install the same tools with your package manager. The links above have instructions.

## Step 2: Sign in to GitHub

**Who does it:** Everyone.

**Why it matters:** The GitHub CLI creates your copy of the repository, so it needs your account.

**How to do it.**

1. Sign in to GitHub. Run this and answer the prompts. Choose **GitHub.com**, then **HTTPS**. When it asks "Authenticate Git with your GitHub credentials?", answer **Yes**. Then choose to sign in with a **web browser**. `gh` shows a one-time code and waits for you to press Enter before it opens your browser. Type the code there. If no browser opens (common in WSL), copy the URL that `gh` prints into a browser on Windows.

   ```bash
   gh auth login
   ```

   What this does: signs the GitHub CLI in to your GitHub account and stores its token on this computer. Because you answer yes to authenticating git, git uses it too when it pushes. It changes no repository.

2. Check that it worked.

   ```bash
   gh auth status
   ```

   What this does: shows which GitHub account `gh` is signed in to. It changes nothing.

**Done when:** `gh auth status` says you are logged in to github.com.

**If you get stuck.**

- `gh auth login` keeps asking for a code: copy the code exactly, including the dash, into the page your browser opened.
- If your company signs in to GitHub with single sign-on, you may need to authorize the GitHub CLI for your organization. This workshop only uses your personal account.

## Step 3: Install Node.js

**Who does it:** Everyone.

**Why it matters:** The workshop app and its tests run on Node.js.

**How to do it.** Install **Node.js 24 LTS** (24.15 or later). Node 22 (22.22.2 or later) and Node 26 also pass the check, but 24 is the one we tested. On Windows, run these in your Ubuntu window and use the Linux and WSL command.

- **macOS:** download the installer from https://nodejs.org/en/download, or with Homebrew run these two commands:

  ```bash
  brew install node@24
  ```

  What this does: installs Node 24, with its npm, with Homebrew. It does not remove any other Node you have.

  ```bash
  brew link --overwrite --force node@24
  ```

  What this does: puts that Node 24 on your PATH, in place of whichever Node Homebrew linked before. It changes no project files.

- **Linux and WSL:** the Node.js download page offers nvm, a small tool that installs Node for you. Copy the current nvm command from https://nodejs.org/en/download, which looks like this:

  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
  ```

  What this does: installs nvm in your home folder and adds it to your shell's start-up file. It installs no Node yet.

  Close the terminal and open a new one. Then install Node:

  ```bash
  nvm install 24
  ```

  What this does: downloads Node 24, with its npm, into nvm's folder and makes it the one your terminal uses.

Open a **new terminal window**, then check it.

```bash
node --version
```

What this does: prints the version of Node on your PATH. It changes nothing.

Check npm too. It comes with Node, and the workshop needs npm 11 or later.

```bash
npm --version
```

What this does: prints the version of npm on your PATH. It changes nothing.

If it prints a number below 11, which is usual with Node 22, update npm:

```bash
npm install -g npm@11
```

What this does: replaces the npm that came with this Node with npm 11. It changes no project files, and leaves Node itself alone.

**Done when:** `node --version` prints a version number, and `npm --version` prints 11 or later. v24 is recommended; 22.22.2 or later and 26 or later also pass.

**If you get stuck.**

- `node --version` shows an older number after installing: you have a second copy of Node. Open a new terminal. With nvm, run `nvm use 24`.
- `npm install -g` fails with a permission error: your Node was installed for all users. Install Node with nvm or Homebrew as above, which needs no `sudo`, then run it again.

## Step 4: Install the Claude desktop app and sign in

**Who does it:** Everyone.

**Why it matters:** The labs run in the desktop app's **Code** tab. The app includes Claude Code, and it needs your account before it will answer anything.

**How to do it.**

1. Download the desktop app from https://code.claude.com/docs/en/desktop-quickstart and run the installer. There is one download for macOS and one for Windows. On Linux, that page links to the Linux build, which is in beta.
2. Open **Claude** from your Applications folder on macOS, or from the Start menu on Windows, and sign in with your claude.ai account.
3. Click the **Code** tab at the top of the sidebar. If the tabs show only icons, hover over one to see its name.

**What you should see.** The Code tab opens with a prompt box, and a row of controls under it.

**Done when:** you are signed in and the Code tab opens without a prompt to upgrade or an error.

**If you get stuck.**

- A prompt to upgrade: the Code tab needs a paid plan. Ask your team admin, or tell the facilitator before the session.
- A prompt to sign in online: finish the sign-in, then quit and reopen the app.
- A `403` error in the Code tab: see the troubleshooting section of https://code.claude.com/docs/en/desktop.

## Step 5: Make your copy of the workshop repository

**Who does it:** Everyone.

**Why it matters:** You get your own private repository, so you can commit, push and open pull requests without touching anyone else's. Cloning keeps the full commit history, so do not use GitHub's fork button.

**Why a private copy and not a fork.** A fork of a public repository is public, and GitHub does not let you make it private. In a fork, the GitHub CLI can pick the workshop repository instead of yours when you work with issues or pull requests. Some companies do not allow forks at all.

You lose nothing by not forking: the labs fetch their starting points straight from the workshop's URL, so your copy needs no link back to the workshop repository.

**How to do it.** Run these two commands, one at a time, in the folder where you want the project to live. On WSL, that is your Linux home folder.

1. Clone the workshop repository into a folder called `my-claude-code-skills-plugins`.

   ```bash
   git clone https://github.com/WWT-AINE-Workshops/claude-code-skills-plugins.git my-claude-code-skills-plugins
   ```

   What this does: downloads the workshop repository, with its full history and its lab starting points, into a new folder called `my-claude-code-skills-plugins`. Nothing else on your computer changes.

2. Move into the folder.

   ```bash
   cd my-claude-code-skills-plugins
   ```

   What this does: moves your terminal into that folder. It changes nothing.

Stay in the `my-claude-code-skills-plugins` folder for every step below. Now choose one of two paths.

**Quick: run the setup script.**

```bash
./scripts/setup-workshop.sh
```

What this does: walks you through Steps 5 to 7. It makes your private copy on GitHub, installs the app's packages and checks your setup. It installs no system tools such as git or Node. Before each step it says what will change and asks `Run it? [Y/n]`.

You can answer no to any step and do it by hand. The script numbers its own steps, `Step 1 of 7` to `Step 7 of 7`, so its numbers differ from this guide's. This workshop has no GitHub issues, so its last step says `Not needed`.

The script never asks for a password of its own, though git may ask you to sign in when it pushes. To answer yes to every question, run `./scripts/setup-workshop.sh --yes` instead.

When it ends with `Setup finished.`, go straight to Step 8, which the script cannot do for you. If it ends with `Setup finished, with skipped steps:`, or stops on a step, do those steps by hand below, then Step 8.

**By hand.** Run these two commands, then carry on with the next step.

3. Remove the link back to the workshop repository.

   ```bash
   git remote remove origin
   ```

   What this does: deletes only your clone's pointer to the workshop's GitHub URL, which git calls `origin`. No commits, branches, tags or files are removed. The next command sets `origin` again, to your own private repository.

4. Create your private copy on GitHub and push to it.

   ```bash
   gh repo create my-claude-code-skills-plugins --private --source . --remote origin --push
   ```

   What this does: creates a private repository called `my-claude-code-skills-plugins` in your GitHub account, points `origin` at it and pushes your current branch, `main`, with its full history. It does not push the lab starting points: they stay in your clone, and the reset script fetches any that are missing from the workshop's URL.

**Done when:** the setup script ended with `Setup finished.`, or the last command finished without an error. Either way, the new repository shows up at `github.com/<your user name>/my-claude-code-skills-plugins`.

**If you get stuck.**

- `Repository not found` on the clone: check your network and try again. If it still fails, tell the facilitator.
- The setup script says a tool is missing: install it with the command it shows, or with the steps above. Open a new terminal, then run the script again. It skips the steps that are already done.
- `Name already exists on this account`: you have a repository called `my-claude-code-skills-plugins` already. Rename or delete that one on GitHub, or pick another name. To pick another name, run this, with the name you want in place of `<another name>`:

  ```bash
  ./scripts/setup-workshop.sh --name <another name>
  ```

  What this does: runs the setup again with the new name. It skips the steps that are already done.

  Or put the other name in the last command.

- `fatal: destination path 'my-claude-code-skills-plugins' already exists`: you cloned before. Run `cd my-claude-code-skills-plugins` and continue from there, or delete the folder and start again.

## Step 6: Check your setup

**Who does it:** Everyone.

**Why it matters:** One script checks everything above at once and tells you how to fix anything missing.

**How to do it.** The setup script runs this check for you. On the by-hand path, run it in the `my-claude-code-skills-plugins` folder, then read the output. Each line starts with a mark: a tick means ready, a warning means fix it if you can, a cross means it must be fixed.

```bash
./scripts/check-setup.sh
```

What this does: only reads and reports. It checks your tools, their versions and the ports the app needs, and changes nothing.

**What you should see.** A tick line each for Node.js, npm, git and the GitHub CLI sign-in, then `Ready for the workshop.` on the last line. Unless you use the `claude` command-line tool, you also see a warning that it was not found. That warning is expected: the desktop app includes Claude Code, and Step 8 checks its version.

The script may also warn that a port the app needs (3001) is in use. Fix a busy port by closing the program that uses it.

**Done when:** the last line says `Ready for the workshop.` If something is still missing, the next steps install it, and you run the check once more at the end.

**If you get stuck.**

- Each cross line says what is wrong and the command that fixes it. Run that command, then run the script again.
- `Permission denied`: run `chmod +x scripts/*.sh`, then try again.
- If you already use the `claude` command-line tool, you can check its sign-in as well with the `--live` option. It sends one tiny request, so it needs a working sign-in. Without the command-line tool it runs the normal check only:

  ```bash
  ./scripts/check-setup.sh --live
  ```

  What this does: the same check, plus one short request to the `claude` command-line tool to prove it is signed in. It changes no files.

## Step 7: Install the app and its tools

**Who does it:** Everyone.

**Why it matters:** The labs run the app and its tests, so they need its packages and its starting data.

**How to do it.** The setup script does this step for you. On the by-hand path, run these one at a time, from the `my-claude-code-skills-plugins` folder. The first can take a few minutes.

1. Install the project's packages with `npm ci`, which installs exactly what the lock file lists and never changes it, so your copy stays clean for `./scripts/reset-lab.sh`. npm may warn about install scripts. That warning is harmless.

   ```bash
   npm ci
   ```

   What this does: installs the exact package versions from `package-lock.json` into `node_modules`, without changing the lock file or any other file git tracks.

2. Set up the app's data.

   ```bash
   npm run setup
   ```

   What this does: checks the app's TypeScript and builds its local database with the starting data. It changes no file git tracks.

   It ends with a line that says the database was reset with 4 members, 5 rooms and 20 bookings.

Run the check again.

```bash
./scripts/check-setup.sh
```

What this does: only reads and reports, as before. It changes nothing.

**What you should see.** The check ends with `Ready for the workshop.`, as in Step 6.

**Done when:** the check passes with no cross.

**If you get stuck.**

- `npm ci` fails with an error that mentions `node-gyp` or a compiler: a build tool is missing. On macOS run `xcode-select --install`. On Linux and WSL, run `sudo apt-get install -y build-essential python3`. Then run `npm ci` again.
- `npm ci` warns about the engine or Node version: run `node --version`. You need 22.22.2 or later, and we recommend 24.
- Anything else: run the command once more and read the first error line, not the last.

## Step 8: Open your copy in the Code tab

**Who does it:** Everyone.

**Why it matters:** Every lab starts from a Code tab session on your copy of the repository, so open one now and check that Claude Code answers.

**How to do it.**

1. In the desktop app, open the **Code** tab.
2. In the row under the prompt box, click the first control, the environment selector.
   - **macOS:** select the top entry in the **Local** group.
   - **Windows:** select your Ubuntu distribution in the **WSL** group.
3. Click the project folder control beside it, select **Open folder…**, and choose your `my-claude-code-skills-plugins` folder. On Windows, the folder picker browses inside Ubuntu, so the folder is in your Linux home folder, such as `/home/<your user name>/my-claude-code-skills-plugins`.
4. The first session in a folder shows the workspace trust dialog. Read it, and trust the folder: it is your own copy.
5. Check that Claude Code can list skills. Paste this into the prompt box and press Enter:

   ```prompt
   What skills are available?
   ```

6. Check the version of Claude Code in the app. Type `/status` in the prompt box, press Enter, and read the **Claude Code** row. It must be 2.1.283 or later.

In the CLI: run `claude` in your `my-claude-code-skills-plugins` folder and paste the same prompt.

**What you should see.** Claude answers with a list of the skills it can use, or says it has none from this project yet. Either answer is fine: the repository has no skills of its own until lab 1. You can also type `/` in the prompt box, or click **+** and select **Slash commands**, to browse them.

**Done when:** the session is open on `my-claude-code-skills-plugins`, Claude has answered the prompt, and the Claude Code version is 2.1.283 or later.

**Windows and lab 4.** Plugins do not load in the Code tab's WSL sessions, and lab 4 installs a plugin. Labs 1 to 3 work in your WSL session. For lab 4 you have two choices:

- Follow lab 4 on the facilitator's screen.
- Clone a second copy on the Windows side, and open it as a local Windows session (the **Local** group). This needs git and Node.js 24 for Windows. In lab 4, that copy uses route B1 instead of the upload, because Git Bash has no `zip`.

To make the second copy, open **Git Bash** (it comes with git for Windows) and run these one at a time. Git may ask you to sign in to GitHub.

```bash
git clone https://github.com/<your user name>/my-claude-code-skills-plugins.git my-claude-code-skills-plugins-windows
```

What this does: clones your private copy into a new Windows folder called `my-claude-code-skills-plugins-windows`. It leaves your WSL copy alone.

```bash
cd my-claude-code-skills-plugins-windows
```

What this does: moves Git Bash into that folder. It changes nothing.

```bash
npm ci
```

What this does: installs the project's packages for Windows, without changing any file git tracks.

```bash
npm run setup
```

What this does: builds the local database with the starting data. It changes no file git tracks.

```bash
./scripts/reset-lab.sh 4
```

What this does: fetches the lab starting points and switches this copy to branch `lab-4` at the start of lab 4, then resets its database. It leaves your WSL copy alone.

Then open that folder in the Code tab from the **Local** group, as in point 2 above. If you can't install git or Node on Windows, tell the facilitator before the session. The facilitator helps, or you follow lab 4 on screen.

**If you get stuck.**

- No environment selector under the prompt box: your app has the earlier layout. See "Check which layout you have" on https://code.claude.com/docs/en/desktop.
- The Claude Code version is older than 2.1.283: on macOS open **Claude**, then **Check for Updates…**; on Windows open **Help**, then **Check for Updates…**. Then start a new session.
- Claude cannot find `npm` or `node`: check that they work in your terminal, then quit and reopen the desktop app so it reads your PATH again.
- Windows: the **WSL** entry is missing or greyed out: check that WSL 2 and Ubuntu are installed (Step 1). On a company laptop, your administrator may have turned WSL sessions off. Tell the facilitator.

## Before the session checklist

Tick each box.

- [ ] Windows only: WSL is installed, and I type everything in the Ubuntu window.
- [ ] `git --version` and `gh --version` print a version.
- [ ] `node --version` prints v24 (or v22.22.2 or later, or v26), and `npm --version` prints 11 or later.
- [ ] `gh auth status` says I am logged in.
- [ ] The Claude desktop app is installed, I am signed in, and the Code tab opens.
- [ ] My private `my-claude-code-skills-plugins` repository exists on GitHub.
- [ ] `./scripts/check-setup.sh` ends with `Ready for the workshop.`
- [ ] A Code tab session is open on `my-claude-code-skills-plugins`, and Claude answered which skills are available.
- [ ] The Claude Code version in the Code tab is 2.1.283 or later.
- [ ] Windows only: I know how I will do lab 4 (a second copy in a local Windows session, or the facilitator's screen).
- [ ] I will bring my laptop, charger and an internet connection.
- [ ] I know who to ask for help if something in this list fails: the facilitator.

If one box will not tick, do not wait. Tell the facilitator before the session what the error says.
