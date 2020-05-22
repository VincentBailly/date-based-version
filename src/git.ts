import { readFileSync } from "fs";
import { join } from "path";

export function getCurrentBranch(cwd): string {
  return readFileSync(join(cwd, ".git", "HEAD")).toString().trim().replace("ref: refs/heads/","");
}
