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

function getVersionZeroForToday(): string {
  const date = new Date(Date.now());
  const p1 = 1;
  const p2 = parseInt(`${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
  const p3 = 0;
  const p4 = 0;
  return toString({p1,p2,p3,p4});

}

export function setVersion (cwd) {
  if (versionTagRegExp.test(commandSync("git log -1 --format='%D'", { cwd }).stdout.toString())) {
    throw new Error("HEAD already has a version number");
  }

  const currentVersion = parseVersion(getCurrentLatestVersion(cwd));
  const newVersionTag = toString(bumpMinor(currentVersion));
  commandSync(`git tag ${newVersionTag}`, { cwd });
}

export function getCurrentLatestVersion(cwd): string {
    const gitLogOutput = commandSync("git log --tags --date-order --format='%D'", { cwd }).stdout.toString();
    const gitLogOutputLines = gitLogOutput.split(/\r\n|\n|\r/g).filter(l => l !== "");
    const linesWithCorrectVersionTags = gitLogOutputLines.filter(l => versionTagRegExp.test(l));
    const currentVersionTag = linesWithCorrectVersionTags.length === 0 ? getVersionZeroForToday() : versionTagRegExp.exec(linesWithCorrectVersionTags[0])[0];

    return currentVersionTag;
}
