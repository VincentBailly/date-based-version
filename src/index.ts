import { commandSync } from "execa";
import { tryParseVersion, tryGetLatestVersion, isVersionFromToday, getVersionZeroForToday, bumpMinor, bumpPatch } from "./version";
import { parseBranchName, toReleaseBranch } from "./branch";
import { getCurrentBranch } from "./git";


export function setVersion (cwd) {
  if (tryParseVersion(commandSync("git log -1 --format='%D'", { cwd }).stdout.toString())) {
    throw new Error("HEAD already has a version number");
  }

  const latestVersion = tryGetLatestVersion(cwd);

  if (getCurrentBranch(cwd) === "master") {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)? latestVersion : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    commandSync(`git tag ${newVersion.toString()}`, { cwd });

    const newBranch = toReleaseBranch(newVersion);

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
