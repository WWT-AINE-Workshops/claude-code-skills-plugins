import { describe, expect, it } from 'vitest';
import { groupCommits, parseCommit, type Commit } from '../src/changelog';

const commit = (hash: string, subject: string, body = ''): Commit => ({ hash, subject, body });

describe('parseCommit', () => {
  it('marks a subject with ! as breaking', () => {
    expect(parseCommit(commit('c3', 'feat(api)!: require X-Member-Id on bookings'))).toEqual({
      type: 'feat',
      scope: 'api',
      description: 'require X-Member-Id on bookings',
      breaking: true,
      hash: 'c3',
    });
  });

  it.each([
    'BREAKING CHANGE: clients must send a header',
    'BREAKING-CHANGE: clients must send a header',
  ])('marks a body footer %s as breaking', (footer) => {
    const parsed = parseCommit(
      commit('d4', 'feat: drop memberId from the body', `Why.\n\n${footer}`),
    );
    expect(parsed?.breaking).toBe(true);
  });

  it('does not mark a body that only mentions breaking changes', () => {
    expect(
      parseCommit(commit('e5', 'docs: explain breaking changes', 'See BREAKING CHANGE: below.'))
        ?.breaking,
    ).toBe(false);
  });

  it('reads a feature with a scope', () => {
    expect(parseCommit(commit('a1', 'feat(api): add room search'))).toEqual({
      type: 'feat',
      scope: 'api',
      description: 'add room search',
      breaking: false,
      hash: 'a1',
    });
  });

  it('reads a fix without a scope', () => {
    expect(parseCommit(commit('b2', 'fix: reject bookings outside opening hours'))).toEqual({
      type: 'fix',
      scope: null,
      description: 'reject bookings outside opening hours',
      breaking: false,
      hash: 'b2',
    });
  });

  it('reads a chore, and keeps the rest of the subject as the description', () => {
    expect(parseCommit(commit('c3', 'chore(deps): bump fastify: patch release'))).toMatchObject({
      type: 'chore',
      scope: 'deps',
      description: 'bump fastify: patch release',
    });
  });

  it('accepts a scope with a hyphen', () => {
    expect(parseCommit(commit('d4', 'docs(release-tools): explain --json'))).toMatchObject({
      type: 'docs',
      scope: 'release-tools',
    });
  });

  it('does not take the description from the body', () => {
    expect(
      parseCommit(commit('e5', 'fix(api): return 404 for unknown rooms', 'Closes the gap.')),
    ).toMatchObject({ description: 'return 404 for unknown rooms' });
  });

  it.each([
    'Add rooms',
    'Merge branch main',
    'feat add rooms',
    'feat(): add rooms',
    'feat(api):add rooms',
    'feat(api): ',
    'Feat(api): add rooms',
  ])('returns null for the non-conventional subject %j', (subject) => {
    expect(parseCommit(commit('f6', subject))).toBeNull();
  });
});

describe('groupCommits', () => {
  it('sorts features, fixes and everything else into their groups', () => {
    const groups = groupCommits([
      commit('1', 'feat(api): add availability'),
      commit('2', 'fix(api): accept bookings that end at 18:00'),
      commit('3', 'chore: update dependencies'),
      commit('4', 'docs: describe the bookings endpoint'),
      commit('5', 'test(api): cover room search'),
    ]);
    expect(groups.breaking).toEqual([]);
    expect(groups.features.map((c) => c.hash)).toEqual(['1']);
    expect(groups.fixes.map((c) => c.hash)).toEqual(['2']);
    expect(groups.other.map((c) => c.hash)).toEqual(['3', '4', '5']);
  });

  it('skips commits that are not conventional', () => {
    const groups = groupCommits([
      commit('1', 'WIP'),
      commit('2', 'feat: add rooms'),
      commit('3', 'Merge pull request #4'),
    ]);
    const all = [...groups.breaking, ...groups.features, ...groups.fixes, ...groups.other];
    expect(all.map((c) => c.hash)).toEqual(['2']);
  });

  it('keeps the input order inside each group', () => {
    const groups = groupCommits([
      commit('3', 'feat: third'),
      commit('2', 'fix: second'),
      commit('1', 'feat: first'),
      commit('0', 'fix: zeroth'),
    ]);
    expect(groups.features.map((c) => c.description)).toEqual(['third', 'first']);
    expect(groups.fixes.map((c) => c.description)).toEqual(['second', 'zeroth']);
  });

  it('returns empty groups for no commits', () => {
    expect(groupCommits([])).toEqual({ breaking: [], features: [], fixes: [], other: [] });
  });
});
