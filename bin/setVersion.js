#!/usr/bin/env node

const dryRun = process.argv.includes("--dry-run");
const patch = process.argv.includes("--patch");

const scopeTagArg = process.argv.find((arg) => arg.startsWith("--scopeTag"));
const scopeTag = scopeTagArg ? scopeTagArg.split("=").pop() : undefined;

const scopeBranchArg = process.argv.find((arg) =>
  arg.startsWith("--scopeBranch")
);
const scopeBranch = scopeBranchArg
  ? scopeBranchArg.split("=").pop()
  : undefined;

const version = require("../index").setVersion({
  cwd: process.cwd(),
  dryRun,
  patch,
  scopeTag,
  scopeBranch,
});
console.log(version);
