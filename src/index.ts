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
  iterateOnScope?: boolean;
}): string {
  const { cwd, scopeTag, scopeBranch } = options;
  const dryRun = options.dryRun || false;
  const patch = options.patch || false;
  const iterateOnScope = options.iterateOnScope || false;

  let latestVersion = tryGetLatestVersion(cwd, scopeTag);

  if (!patch) {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)
      ? latestVersion
      : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    if (dryRun) {
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
    if (!latestVersion && scopeTag && iterateOnScope) {
      let subScope = scopeTag.split("/").slice(0, -1).join("/");
      while (!latestVersion && subScope) {
        latestVersion = tryGetLatestVersion(cwd, subScope);
        subScope = subScope.split("/").slice(0, -1).join("/");
      }
    }
    if (!latestVersion) {
      throw new Error(
        "The current branch does not have any version tag in its history"
      );
    }

    const newVersion = bumpPatch(latestVersion);
    if (dryRun) {
      console.log(`git tag ${newVersion.getTag(scopeTag)}`);
    } else {
      tag(newVersion.getTag(scopeTag), cwd);
    }
    return newVersion.getVersion();
  }
}
