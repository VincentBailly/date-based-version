import { commandSync } from "execa";
import { readFileSync } from "fs";
import { join } from "path";
import { tryParseVersion, tryGetLatestVersion, isVersionFromToday, getVersionZeroForToday, bumpMinor, bumpPatch } from "./version";

const releaseBranchRegExp = /release\/v\d+\.\d{8}\.\d+/;


type RelaseBranch = {
  p1: number;
  p2: number;
  p3: number;
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


export function getCurrentBranch(cwd): string {
  return readFileSync(join(cwd, ".git", "HEAD")).toString().trim().replace("ref: refs/heads/","");
}

export function setVersion (cwd) {
  if (tryParseVersion(commandSync("git log -1 --format='%D'", { cwd }).stdout.toString())) {
    throw new Error("HEAD already has a version number");
  }

  const latestVersion = tryGetLatestVersion(cwd);

  if (getCurrentBranch(cwd) === "master") {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)? latestVersion : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    commandSync(`git tag ${newVersion.toString()}`, { cwd });

    const {p1,p2,p3} = newVersion;
    const newBranch = `release/v${p1}.${p2}.${p3}`;

    commandSync(`git checkout -b ${newBranch}`, { cwd });
  } else {
    if (!latestVersion) {
      throw new Error("The current branch does not have any version tag in its history");
    }

    const releaseBranch = parseBranchName(getCurrentBranch(cwd));
    if (latestVersion.p1 !== releaseBranch.p1 || latestVersion.p2 !== releaseBranch.p2 || latestVersion.p3 !== releaseBranch.p3) {
      throw new Error("The latest version tag does not match with the current release branch")
    }

    const newVersion = bumpPatch(latestVersion);
    commandSync(`git tag ${newVersion.toString()}`, { cwd });
  }
}
