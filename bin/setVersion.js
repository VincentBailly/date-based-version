#!/usr/bin/env node
if (process.argv.includes("--dry-run")) {
  require("../lib/index").dryRun(process.cwd());
} else {
  require("../lib/index").setVersion(process.cwd());
}

