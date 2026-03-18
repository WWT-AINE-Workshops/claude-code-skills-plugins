import { execFileSync } from 'node:child_process';
import { groupCommits, type Commit, type CommitGroups, type ParsedCommit } from './changelog';

const RELEASE_PREFIX = 'chore(release): ';
const FIELD = '\x1f';
const RECORD = '\x1e';

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function fail(message: string): never {
  console.error(`changelog: ${message}`);
  process.exit(1);
}

function readLog(range?: string): Commit[] {
  const args = ['log', `--format=%H${FIELD}%s${FIELD}%b${RECORD}`];
  if (range) args.push(range);
  let output: string;
  try {
    output = git(args);
  } catch (error) {
    const detail = error instanceof Error ? error.message.split('\n')[0] : String(error);
    fail(`git log failed (${detail})`);
  }
  return output
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ''))
    .filter((record) => record.length > 0)
    .map((record) => {
      const [hash, subject, body = ''] = record.split(FIELD);
      return { hash, subject, body: body.trim() };
    });
}

function line(commit: ParsedCommit): string {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  return `- ${scope}${commit.description} (${commit.hash.slice(0, 7)})`;
}

function toMarkdown(groups: CommitGroups): string {
  const sections: [string, ParsedCommit[]][] = [
    ['Breaking changes', groups.breaking],
    ['Features', groups.features],
    ['Fixes', groups.fixes],
    ['Other', groups.other],
  ];
  return sections
    .filter(([, commits]) => commits.length > 0)
    .map(([title, commits]) => [`## ${title}`, '', ...commits.map(line)].join('\n'))
    .join('\n\n');
}

const release = readLog().find((commit) => commit.subject.startsWith(RELEASE_PREFIX));
if (!release) {
  fail(
    `no commit with a subject starting "${RELEASE_PREFIX}" was found, so there is no release to start from`,
  );
}

const groups = groupCommits(readLog(`${release.hash}..HEAD`));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(groups, null, 2));
} else {
  const markdown = toMarkdown(groups);
  console.log(markdown || `No changes since ${release.subject}.`);
}
