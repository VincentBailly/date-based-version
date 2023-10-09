import {
  tryGetLatestVersion,
  isVersionFromToday,
  getVersionZeroForToday,
  bumpMinor,
  bumpPatch,
} from "./version";
import { toReleaseBranch } from "./branch";
import { checkoutNewBranch, tag } from "./git";

export function setVersion(options: {
  cwd: string;
  dryRun?: boolean;
  patch?: boolean;
  scopeTag?: string;
  scopeBranch?: string;
  skipTagging?: boolean;
}): string {
  const { cwd, scopeTag, scopeBranch } = options;
  const dryRun = options.dryRun || false;
  const patch = options.patch || false;
  const skipTagging = options.skipTagging || false;

  const latestVersion = tryGetLatestVersion(cwd, scopeTag);

  if (!patch) {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)
      ? latestVersion
      : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    if (dryRun || skipTagging) {
      console.log(`git tag ${newVersion.getTag(scopeTag)}`);
    } else {
      tag(newVersion.getTag(scopeTag), cwd);
    }

    const newBranch = toReleaseBranch(newVersion, scopeBranch);
    if (dryRun) {
      console.log(`git checkout -b ${newBranch.toString()}`);
    } else {
      checkoutNewBranch(newBranch.toString(), cwd);
    }
    return newVersion.getVersion();
  } else {
    if (!latestVersion) {
      throw new Error(
        "The current branch does not have any version tag in its history"
      );
    }

    const newVersion = bumpPatch(latestVersion);
    if (dryRun || skipTagging) {
      console.log(`git tag ${newVersion.getTag(scopeTag)}`);
    } else {
      tag(newVersion.getTag(scopeTag), cwd);
    }
    return newVersion.getVersion();
  }
}
