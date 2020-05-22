import {
  tryParseVersion,
  tryGetLatestVersion,
  isVersionFromToday,
  getVersionZeroForToday,
  bumpMinor,
  bumpPatch,
} from "./version";
import { parseBranchName, toReleaseBranch } from "./branch";
import { getTagsOfHead, checkoutNewBranch, getCurrentBranch, tag } from "./git";

function setVersionImpl(cwd: string, dryRun: boolean) {
  const tagsOfHead = getTagsOfHead(cwd);
  const versionTagsOfHead = tagsOfHead
    .map((tag) => tryParseVersion(tag))
    .filter((t) => t !== undefined);
  if (versionTagsOfHead.length !== 0) {
    throw new Error("HEAD already has a version number");
  }

  const latestVersion = tryGetLatestVersion(cwd);

  if (getCurrentBranch(cwd) === "master") {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)
      ? latestVersion
      : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    if (dryRun) {
      console.log(`git tag ${newVersion.toString()}`);
    } else {
      tag(newVersion.toString(), cwd);
    }

    const newBranch = toReleaseBranch(newVersion);
    if (dryRun) {
      console.log(`git checkout -b ${newBranch.toString()}`);
    } else {
      checkoutNewBranch(newBranch.toString(), cwd);
    }
  } else {
    if (!latestVersion) {
      throw new Error(
        "The current branch does not have any version tag in its history"
      );
    }

    const releaseBranch = parseBranchName(getCurrentBranch(cwd));
    if (
      latestVersion.p1 !== releaseBranch.p1 ||
      latestVersion.p2 !== releaseBranch.p2 ||
      latestVersion.p3 !== releaseBranch.p3
    ) {
      throw new Error(
        "The latest version tag does not match with the current release branch"
      );
    }

    const newVersion = bumpPatch(latestVersion);
    if (dryRun) {
      console.log(`git tag ${newVersion.toString()}`);
    } else {
      tag(newVersion.toString(), cwd);
    }
  }

}

export function setVersion(cwd: string) {
  setVersionImpl(cwd, false);
}

export function dryRun(cwd: string) {
  setVersionImpl(cwd, true);
}
