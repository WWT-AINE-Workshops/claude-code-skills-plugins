export type Commit = { hash: string; subject: string; body: string };

export type ParsedCommit = {
  type: string;
  scope: string | null;
  description: string;
  breaking: boolean;
  hash: string;
};

export type CommitGroups = {
  breaking: ParsedCommit[];
  features: ParsedCommit[];
  fixes: ParsedCommit[];
  other: ParsedCommit[];
};

const SUBJECT = /^([a-z]+)(?:\(([^()\s]+)\))?(!)?: (\S.*)$/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE: /m;

export function parseCommit(c: Commit): ParsedCommit | null {
  const match = SUBJECT.exec(c.subject.trim());
  if (!match) return null;
  const [, type, scope, bang, description] = match;
  const breaking = bang === '!' || BREAKING_FOOTER.test(c.body);
  return { type, scope: scope ?? null, description, breaking, hash: c.hash };
}

export function groupCommits(commits: Commit[]): CommitGroups {
  const groups: CommitGroups = { breaking: [], features: [], fixes: [], other: [] };
  for (const commit of commits) {
    const parsed = parseCommit(commit);
    if (!parsed) continue;
    if (parsed.breaking) groups.breaking.push(parsed);
    else if (parsed.type === 'feat') groups.features.push(parsed);
    else if (parsed.type === 'fix') groups.fixes.push(parsed);
    else groups.other.push(parsed);
  }
  return groups;
}
