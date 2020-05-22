import { commandSync } from "execa";
import { readFileSync } from "fs";
import { join } from "path";

const versionTagRegExp = /v\d+\.\d{8}\.\d+\.\d+/;
const releaseBranchRegExp = /release\/v\d+\.\d{8}\.\d+/;

type Version = {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
}

type RelaseBranch = {
  p1: number;
  p2: number;
  p3: number;
}

function toString(version: Version): string {
  const { p1, p2, p3, p4 } = version;
  return  `v${p1}.${p2}.${p3}.${p4}`;
}

function bumpMinor(old: Version): Version {
  const { p1, p2, p4 } = old;
  const p3 = old.p3 + 1;

  return { p1, p2, p3, p4 };
}

function parseVersion(versionString: string): Version {
  if (!versionTagRegExp.test(versionString)) {
    throw new Error("the version string does not match the version regexp");
  }

  const p1 = parseInt(/v(\d+)\.\d{8}\.\d+\.\d+/.exec(versionString)[1]);
  const p2 = parseInt(/v\d+\.(\d{8})\.\d+\.\d+/.exec(versionString)[1]);
  const p3 = parseInt(/v\d+\.\d{8}\.(\d+)\.\d+/.exec(versionString)[1]);
  const p4 = parseInt(/v\d+\.\d{8}\.\d+\.(\d+)/.exec(versionString)[1]);

  return { p1, p2, p3, p4 };
}

function parseBranchName(branchName: string): RelaseBranch {
  if (!releaseBranchRegExp.test(branchName)) {
    throw new Error(`The branch ${branchName} is not a relase branch`);
  }

  const p1 = parseInt(/release\/v(\d+)\.\d{8}\.\d+/.exec(branchName)[1]);
  const p2 = parseInt(/release\/v\d+\.(\d{8})\.\d+/.exec(branchName)[1]);
  const p3 = parseInt(/release\/v\d+\.\d{8}\.(\d+)/.exec(branchName)[1]);

  return { p1, p2, p3 };
}

function getTodayNumber(): number {
  const date = new Date(Date.now());
  return parseInt(`${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
}

function getFirstVersionForToday(): string {
  const p1 = 1;
  const p2 = getTodayNumber();
  const p3 = 1;
  const p4 = 0;
  return toString({p1,p2,p3,p4});

}

function isTagFromToday(versionString: string): boolean {
  const p2 = parseInt(/v\d+\.(\d{8})\.\d+\.\d+/.exec(versionString)[1]);
  return p2 === getTodayNumber();
}

function tryGetCurrentLatestVersionFromToday(cwd): Version | undefined {
    const latestVersionTag = getCurrentLatestVersion(cwd);
    if (!latestVersionTag || !isTagFromToday(latestVersionTag)) {
      return undefined;
    }

    return parseVersion(latestVersionTag);
}

export function getCurrentBranch(cwd): string {
  return readFileSync(join(cwd, ".git", "HEAD")).toString().trim().replace("ref: refs/heads/","");
}

export function setVersion (cwd) {
  if (versionTagRegExp.test(commandSync("git log -1 --format='%D'", { cwd }).stdout.toString())) {
    throw new Error("HEAD already has a version number");
  }

  if (getCurrentBranch(cwd) === "master") {
    const currentLatestVersionFromToday = tryGetCurrentLatestVersionFromToday(cwd);

    const newVersionTag = Boolean(currentLatestVersionFromToday) ? toString(bumpMinor(currentLatestVersionFromToday)) : getFirstVersionForToday();

    commandSync(`git tag ${newVersionTag}`, { cwd });

    const {p1,p2,p3} = parseVersion(newVersionTag);
    const newBranch = `release/v${p1}.${p2}.${p3}`;

    commandSync(`git checkout -b ${newBranch}`, { cwd });
  } else {
    const oldTag = getCurrentLatestVersion(cwd);
    if (!oldTag) {
      throw new Error("The current branch does not have any version tag in its history");
    }

    const oldVersion = parseVersion(oldTag);

    const releaseBranch = parseBranchName(getCurrentBranch(cwd));
    if (oldVersion.p1 !== releaseBranch.p1 || oldVersion.p2 !== releaseBranch.p2 || oldVersion.p3 !== releaseBranch.p3) {
      throw new Error("The latest version tag does not match with the current release branch")
    }

  }
}

export function getCurrentLatestVersion(cwd): string | undefined {
    const gitLogOutput = commandSync("git log --tags --date-order --format='%D'", { cwd }).stdout.toString();
    const gitLogOutputLines = gitLogOutput.split(/\r\n|\n|\r/g).filter(l => l !== "");
    const linesWithCorrectVersionTags = gitLogOutputLines.filter(l => versionTagRegExp.test(l));

    return linesWithCorrectVersionTags.length > 0 ? versionTagRegExp.exec(linesWithCorrectVersionTags[0])[0] : undefined;
}
