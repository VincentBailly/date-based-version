import { Version } from "./version";

type ReleaseBranch = {
  p1: number;
  p2: number;
  p3: number;
  toString: () => string;
};

export function toReleaseBranch(version: Version): ReleaseBranch {
  return makeReleaseBranch(version.p1, version.p2, version.p3);
}

function makeReleaseBranch(p1: number, p2: number, p3: number): ReleaseBranch {
  return { p1, p2, p3, toString: () => `release/v${p1}.${p2}.${p3}` };
}
