import { readFileSync } from "fs";
import { writeFileSync } from "fs";
import { join } from "path";
import { commandSync } from "execa";

export function getCurrentBranch(cwd): string {
  return readFileSync(join(cwd, ".git", "HEAD"))
    .toString()
    .trim()
    .replace("ref: refs/heads/", "");
}

export function getTags(cwd): string[][] {
  const gitLogOutput = commandSync(
    "git log --tags --date-order --format='%D'",
    { cwd }
  ).stdout.toString();
  const lines = gitLogOutput
    .replace(/'/g, "")
    .split(/\r\n|\n|\r/g)
    .filter((l) => l !== "");
  return lines.map((l) =>
    l
      .split(/, /)
      .filter((t) => t.startsWith("tag: "))
      .map((t) => t.replace("tag: ", ""))
  );
}

export function tag(tagName: string, cwd: string): void {
  commandSync(`git tag ${tagName}`, { cwd });
}

export function checkoutNewBranch(branchName: string, cwd: string): void {
  commandSync(`git checkout -b ${branchName}`, { cwd });
}

export function getTagsOfHead(cwd: string): string[] {
  const logLine = commandSync("git log -1 --format='%D'", {
    cwd,
  }).stdout.toString();
  const tags = logLine
    .replace("HEAD -> master", "")
    .split(", tag: ")
    .filter((t) => t !== "");
  return tags;
}

export function createCommit(cwd): void {
  const randomString = Math.random().toString();
  writeFileSync(join(cwd, `${randomString}.txt`), randomString);
  commandSync(`git add ${randomString}.txt`, { cwd });
  commandSync(`git commit -m ${randomString}`, { cwd });
}
