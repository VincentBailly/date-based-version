import { getTags } from "./git";

const versionTagRegExp = /v\d+\.\d{8}\.\d+\.\d+/;

export type Version = {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  getTag: (scopeTag?: string) => string;
  getVersion: () => string;
};

function makeVersion(p1: number, p2: number, p3: number, p4: number): Version {
  return {
    p1,
    p2,
    p3,
    p4,
    getTag: (scopeTag?: string) => getTag(p1, p2, p3, p4, scopeTag),
    getVersion: () => getVersion(p1, p2, p3, p4),
  };
}

function getTag(
  p1: number,
  p2: number,
  p3: number,
  p4: number,
  scopeTag?: string
): string {
  return `${scopeTag ? `${scopeTag}/` : ``}v${p1}.${p2}.${p3}.${p4}`;
}

function getVersion(p1: number, p2: number, p3: number, p4: number): string {
  return `${p1}.${p2}.${p3}.${p4}`;
}

export function tryGetLatestVersion(
  cwd: string,
  scopeTag?: string
): Version | undefined {
  const tags = getTags(cwd);
  const linesWithCorrectVersionTags = tags
    .map((l) => l.filter((t) => (scopeTag ? matchesScope(t, scopeTag) : true)))
    .map((l) => l.map((t) => trimScope(t, scopeTag)))
    .filter((l) => l.filter((t) => versionTagRegExp.test(t)).length > 0);

  if (linesWithCorrectVersionTags.length === 0) {
    return undefined;
  }

  const tag = linesWithCorrectVersionTags[0]
    .filter((t) => versionTagRegExp.test(t))
    .map((t) => versionTagRegExp.exec(t)[0])
    .sort()
    .reverse()[0];
  return parseVersion(tag);
}

function matchesScope(versionString: string, scopeTag?: string): boolean {
  return versionString.indexOf(`${scopeTag}/`) === 0;
}

function trimScope(versionString: string, scopeTag?: string): string {
  return versionString.replace(`${scopeTag}/`, ``);
}

function parseVersion(versionString: string): Version {
  if (!versionTagRegExp.test(versionString)) {
    throw new Error("the version string does not match the version regexp");
  }

  const p1 = parseInt(/v(\d+)\.\d{8}\.\d+\.\d+/.exec(versionString)[1]);
  const p2 = parseInt(/v\d+\.(\d{8})\.\d+\.\d+/.exec(versionString)[1]);
  const p3 = parseInt(/v\d+\.\d{8}\.(\d+)\.\d+/.exec(versionString)[1]);
  const p4 = parseInt(/v\d+\.\d{8}\.\d+\.(\d+)/.exec(versionString)[1]);

  return makeVersion(p1, p2, p3, p4);
}

export function bumpMinor(old: Version): Version {
  const { p1, p2, p4 } = old;
  const p3 = old.p3 + 1;

  return makeVersion(p1, p2, p3, p4);
}

export function bumpPatch(old: Version): Version {
  const { p1, p2, p3 } = old;
  const p4 = old.p4 + 1;

  return makeVersion(p1, p2, p3, p4);
}

function getTodayNumber(): number {
  const date = new Date(Date.now());
  return parseInt(
    `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`
  );
}

export function getVersionZeroForToday(): Version {
  const p1 = 1;
  const p2 = getTodayNumber();
  const p3 = 0;
  const p4 = 0;
  return makeVersion(p1, p2, p3, p4);
}

export function isVersionFromToday(version: Version): boolean {
  return Boolean(version) && version.p2 === getTodayNumber();
}
