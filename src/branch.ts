import { Version } from "./version";

const releaseBranchRegExp = /release\/v\d+\.\d{8}\.\d+/;

type ReleaseBranch = {
  p1: number;
  p2: number;
  p3: number;
  toString: () => string
}

export function toReleaseBranch(version: Version): ReleaseBranch {
  return makeReleaseBranch(version.p1, version.p2, version.p3);
}

export function parseBranchName(branchName: string): ReleaseBranch {
  if (!releaseBranchRegExp.test(branchName)) {
    throw new Error(`The branch ${branchName} is not a relase branch`);
  }

  const p1 = parseInt(/release\/v(\d+)\.\d{8}\.\d+/.exec(branchName)[1]);
  const p2 = parseInt(/release\/v\d+\.(\d{8})\.\d+/.exec(branchName)[1]);
  const p3 = parseInt(/release\/v\d+\.\d{8}\.(\d+)/.exec(branchName)[1]);

  return makeReleaseBranch(p1, p2, p3);
}

function makeReleaseBranch(p1: number, p2: number, p3: number): ReleaseBranch {
  return { p1, p2, p3, toString: () => `release/v${p1}.${p2}.${p3}` };
}


