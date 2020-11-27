import { Version } from "./version";

type ReleaseBranch = {
  p1: number;
  p2: number;
  p3: number;
  toString: () => string;
};

export function toReleaseBranch(
  version: Version,
  scopeBranch?: string
): ReleaseBranch {
  return makeReleaseBranch(version.p1, version.p2, version.p3, scopeBranch);
}

function makeReleaseBranch(
  p1: number,
  p2: number,
  p3: number,
  scopeBranch?: string
): ReleaseBranch {
  return {
    p1,
    p2,
    p3,
    toString: () =>
      `${scopeBranch ? `${scopeBranch}/` : ``}release/v${p1}.${p2}.${p3}`,
  };
}
