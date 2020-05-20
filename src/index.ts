import { commandSync } from "execa";

const versionTagRegExp = /v\d+\.\d{8}\.\d+\.\d+/;

type Version = {
  p1: number;
  p2: number;
  p3: number;
  p4: number;
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

function parseVersion(versionString): Version {
  if (!versionTagRegExp.test(versionString)) {
    throw new Error("the version string does not match the version regexp");
  }

  const p1 = parseInt(/v(\d+)\.\d{8}\.\d+\.\d+/.exec(versionString)[1]);
  const p2 = parseInt(/v\d+\.(\d{8})\.\d+\.\d+/.exec(versionString)[1]);
  const p3 = parseInt(/v\d+\.\d{8}\.(\d+)\.\d+/.exec(versionString)[1]);
  const p4 = parseInt(/v\d+\.\d{8}\.\d+\.(\d+)/.exec(versionString)[1]);

  return { p1, p2, p3, p4 };
}

export function setVersion (cwd) {
  const currentVersion = parseVersion(getCurrentLatestVersion(cwd));
  const newVersionTag = toString(bumpMinor(currentVersion));
  commandSync(`git tag ${newVersionTag}`, { cwd });
}

export function getCurrentLatestVersion(cwd) {
    const gitLogOutput = commandSync("git log --tags --date-order --format='%D'", { cwd }).stdout.toString();
    const gitLogOutputLines = gitLogOutput.split(/\r\n|\n|\r/g).filter(l => l !== "");
    const linesWithCorrectVersionTags = gitLogOutputLines.filter(l => versionTagRegExp.test(l));
    if (linesWithCorrectVersionTags.length === 0) {
      throw new Error("no valid version tag found in the git history");
    }

    const currentVersionTag = versionTagRegExp.exec(linesWithCorrectVersionTags[0])[0];

    return currentVersionTag;
}
