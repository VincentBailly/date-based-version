#!/usr/bin/env node

const dryRun = process.argv.includes("--dry-run");
const patch = process.argv.includes("--patch");

require("../lib/index").setVersion({ cwd: process.cwd(), dryRun, patch });
