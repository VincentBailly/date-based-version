import { commandSync } from "execa";

const versionTagRegExp = /v\d+\.\d{8}\.\d+\.\d+/;

export type Version = {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
  toString: () => string;
}

function makeVersion(p1: number, p2:number, p3: number, p4: number): Version {
  return { p1, p2, p3, p4, toString: () => toString(p1, p2, p3, p4) }

}

function toString(p1: number, p2: number, p3: number, p4: number): string {
  return  `v${p1}.${p2}.${p3}.${p4}`;
}

export function tryGetLatestVersion(cwd: string): Version | undefined {
    const gitLogOutput = commandSync("git log --tags --date-order --format='%D'", { cwd }).stdout.toString();
    const gitLogOutputLines = gitLogOutput.split(/\r\n|\n|\r/g).filter(l => l !== "");
    const linesWithCorrectVersionTags = gitLogOutputLines.filter(l => versionTagRegExp.test(l));

    if (linesWithCorrectVersionTags.length === 0) {
      return undefined;
    }

    const tag = versionTagRegExp.exec(linesWithCorrectVersionTags[0])[0];
    return parseVersion(tag);
}

export function tryParseVersion(versionString: string): Version | undefined {
  if (!versionTagRegExp.test(versionString)) {
    return undefined;
  }

  return parseVersion(versionString);
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
  return parseInt(`${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
}

export function getVersionZeroForToday(): Version {
  const p1 = 1;
  const p2 = getTodayNumber();
  const p3 = 0;
  const p4 = 0;
  return makeVersion(p1,p2,p3,p4);
}

export function isVersionFromToday(version: Version): boolean {
  return Boolean(version) && version.p2 === getTodayNumber();
}
