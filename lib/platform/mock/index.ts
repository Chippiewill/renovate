import child_process from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import JSON5 from 'json5';

import { PlatformId } from '../../constants';
import { logger } from '../../logger';
import { BranchStatus, PrState, VulnerabilityAlert } from '../../types';
import * as git from '../../util/git';
import type {
  BranchStatusConfig,
  CreatePRConfig,
  EnsureCommentConfig,
  EnsureCommentRemovalConfig,
  EnsureIssueConfig,
  FindPRConfig,
  Issue,
  MergePRConfig,
  PlatformParams,
  PlatformResult,
  Pr,
  RepoParams,
  RepoResult,
  UpdatePrConfig,
} from '../types';

let config: {
  repository: string;
  defaultBranch: string;
  endpoint: string;
} = {} as any;

const defaults = {
  hostType: PlatformId.Mock,
  endpoint: os.homedir(),
};

export function initPlatform({
  endpoint,
  token,
  gitAuthor,
}: PlatformParams): Promise<PlatformResult> {
  defaults.endpoint = endpoint;
  const platformConfig: PlatformResult = {
    endpoint: defaults.endpoint,
  };
  return Promise.resolve(platformConfig);
}

export async function initRepo({
  repository,
  endpoint,
}: RepoParams): Promise<RepoResult> {
  config = {} as any;
  config.endpoint = endpoint;

  const url = path.join(endpoint, repository, '.git');
  config.defaultBranch = child_process
    .execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: url,
      encoding: 'utf-8',
    })
    .trim();
  await git.initRepo({
    ...config,
    url,
  });

  const repoConfig: RepoResult = {
    defaultBranch: config.defaultBranch,
    isFork: false,
  };
  return repoConfig;
}

export function getRepos(): Promise<string[]> {
  logger.debug('Autodiscovering local repositories');
  const repos = child_process.execFileSync(
    '/usr/bin/find',
    [
      defaults.endpoint,
      '-type',
      'd',
      '-execdir',
      '/usr/bin/test',
      '-d',
      '{}/.git',
      '\\;',
      '-print',
      '-prune',
    ],
    { encoding: 'utf-8' }
  );
  return Promise.resolve(
    repos
      .trim()
      .split('\n')
      .map((repo) => repo.replace(new RegExp(`^${defaults.endpoint}/?`), ''))
  );
}

export function getIssueList(): Promise<Issue[]> {
  logger.debug(`getIssueList()`);
  return Promise.resolve([]);
}

export function findIssue(title: string): Promise<Issue | null> {
  logger.debug(`findIssue() ${title}`);
  return Promise.resolve(null);
}

export function ensureIssue({
  title,
  reuseTitle,
  body,
  labels,
}: EnsureIssueConfig): Promise<'updated' | 'created' | null> {
  logger.debug(`ensureIssue() ${title}`);

  logger.info(`Ensured Issue \n# ${title}\n\n${body}`);
  return Promise.resolve('created');
}

export function ensureIssueClosing(title: string): Promise<void> {
  logger.debug(`ensureIssue() ${title}`);
  return Promise.resolve();
}

export function getPrList(): Promise<Pr[]> {
  logger.debug(`getPrList()`);
  return Promise.resolve([]);
}

export function findPr({
  branchName,
  prTitle,
  state = PrState.All,
}: FindPRConfig): Promise<Pr> {
  logger.debug(`findPr(${branchName}, ${prTitle}, ${state})`);
  return Promise.resolve(null);
}

export function getPr(iid: number): Promise<Pr> {
  logger.debug(`getPr(${iid})`);
  return Promise.resolve(null);
}

export function getBranchPr(branchName: string): Promise<Pr> {
  logger.debug(`getBranchPr(${branchName})`);
  return Promise.resolve(null);
}

export function createPr({
  sourceBranch,
  targetBranch,
  prTitle,
  prBody,
  draftPR,
  labels,
  platformOptions,
}: CreatePRConfig): Promise<Pr> {
  logger.debug(`createPr(${sourceBranch})`);
  logger.info(
    `Created PR ${sourceBranch} -> ${targetBranch}\n# ${prTitle}\n\n${prBody}`
  );
  const pr: Pr = {
    sourceBranch,
    targetBranch,
    body: prBody,
    state: PrState.Open,
    title: prTitle,
    labels,
  };
  return Promise.resolve(pr);
}

export function updatePr({
  number: iid,
  prTitle,
  prBody: description,
  state,
  platformOptions,
}: UpdatePrConfig): Promise<void> {
  logger.debug(`updatePr()`);
  return Promise.resolve();
}

export function mergePr({ id }: MergePRConfig): Promise<boolean> {
  logger.debug(`mergePr(${id})`);
  return Promise.resolve(true);
}

export function deleteLabel(issueNo: number, label: string): Promise<void> {
  logger.debug(`deleteLabel(${issueNo}, ${label})`);
  return Promise.resolve();
}

export function ensureComment({
  number,
  topic,
  content,
}: EnsureCommentConfig): Promise<boolean> {
  logger.debug(`ensureComment(${number}, ${topic || content}`);
  return Promise.resolve(true);
}

export function ensureCommentRemoval({
  number,
  topic,
  content,
}: EnsureCommentRemovalConfig): Promise<void> {
  logger.debug(`ensureCommentRemoval(${number}, ${topic || content}`);
  return Promise.resolve();
}

export function addAssignees(iid: number, assignees: string[]): Promise<void> {
  logger.debug(`addAssignees(${iid}, '${assignees.join(', ')}')`);
  return Promise.resolve();
}

export function addReviewers(iid: number, reviewers: string[]): Promise<void> {
  logger.debug(`addReviewers(${iid}, '${reviewers.join(', ')}')`);
  return Promise.resolve();
}

export function getBranchStatus(branchName: string): Promise<BranchStatus> {
  logger.debug(`getBranchStatus(${branchName})`);
  return Promise.resolve(BranchStatus.green);
}

export function getBranchStatusCheck(
  branchName: string,
  context: string
): Promise<BranchStatus | null> {
  logger.debug(`getBranchStatusCheck(${branchName})`);
  return Promise.resolve(BranchStatus.green);
}

export function setBranchStatus({
  branchName,
  context,
  description,
  state: renovateState,
  url: targetUrl,
}: BranchStatusConfig): Promise<void> {
  logger.debug(`setBranchStatus(${branchName}, '${renovateState}')`);
  return Promise.resolve();
}

export function getRawFile(
  fileName: string,
  repo: string = config.repository
): Promise<string | null> {
  return Promise.resolve(
    fs.readFileSync(path.join(config.endpoint, repo, fileName), {
      encoding: 'utf-8',
    })
  );
}

export function getJsonFile(
  fileName: string,
  repo: string = config.repository
): Promise<any | null> {
  const raw = await getRawFile(fileName, repo);
  if (fileName.endsWith('.json5')) {
    return Promise.resolve(JSON5.parse(raw));
  }
  return Promise.resolve(JSON.parse(raw));
}

export function massageMarkdown(input: string): string {
  return input;
}

export function getRepoForceRebase(): Promise<boolean> {
  return Promise.resolve(false);
}

export function getVulnerabilityAlerts(): Promise<VulnerabilityAlert[]> {
  logger.debug(`getVulnerabilityAlerts()`);
  return Promise.resolve([]);
}

export function filterUnavailableUsers(users: string[]): Promise<string[]> {
  logger.debug(`filterUnavailableUsers()`);
  return Promise.resolve([]);
}
