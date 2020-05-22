import {
  tryParseVersion,
  tryGetLatestVersion,
  isVersionFromToday,
  getVersionZeroForToday,
  bumpMinor,
  bumpPatch,
} from "./version";
import { toReleaseBranch } from "./branch";
import { getTagsOfHead, checkoutNewBranch, tag } from "./git";

export function setVersion(options: {
  cwd: string;
  dryRun?: boolean;
  patch?: boolean;
}) {
  const { cwd } = options;
  const dryRun = options.dryRun || false;
  const patch = options.patch || false;

  const tagsOfHead = getTagsOfHead(cwd);
  const versionTagsOfHead = tagsOfHead
    .map((tag) => tryParseVersion(tag))
    .filter((t) => t !== undefined);
  if (versionTagsOfHead.length !== 0) {
    throw new Error("HEAD already has a version number");
  }

  const latestVersion = tryGetLatestVersion(cwd);

  if (!patch) {
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

    const newVersion = bumpPatch(latestVersion);
    if (dryRun) {
      console.log(`git tag ${newVersion.toString()}`);
    } else {
      tag(newVersion.toString(), cwd);
    }
  }
}
