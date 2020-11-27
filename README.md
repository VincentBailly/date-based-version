# date-based-version

This library is a tool to help you maintain date-based versions in your git repository.

## Date based versioning

Here is how the date-based versioning works:

- Every commit to master is released.
- The release version of each commit is stored as a tag.
- Every commit to master become the source of its own release branch, this allows patching.
- The version is composed of 4 parts:

  1. always 1
  2. date of the release
  3. release number for this release date
  4. patch number

A git log command show such versioning strategy.

```

~/demo $ git log --oneline --decorate --graph --all

* 0dd0a2a (tag: v1.20200512.2.0, release/v1.20200512.2, master) fourth commit
* 39ccfc3 (tag: v1.20200512.1.0, release/v1.20200512.1) third commit
* 8d634ca (tag: v1.20200510.2.0, release/v1.20200510.2) second commit
| * 8b5c451 (tag: v1.20200510.1.1, release/v1.20200510.1) patch for first commit
|/
* 96fedff (tag: v1.20200510.1.0) first commit

```

## This tool

Usage:

Call this function from the release pipeline.

- The new version will be calculated based on the previous version, the date and the patch flag.
- The commit will be tagged with the version.
- If the --patch flag is not provided, a release branch will be created.

```
# on master
npx date-based-version

# on a release branch
npx date-based-version --patch

# dry run (won't create branch or tag)
npx date-based-version --dry-run

# scope tag by prefix (i.e. scope/v1.20200510.1.0)
npx date-based-version --scopeTag=scope

# scope branch by prefix (i.e. scope/release/v1.20200510.1)
npx date-based-version --scopeBranch=scope
```
