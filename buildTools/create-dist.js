#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const prettier = require("prettier-package-json");
const fsExtra = require("fs-extra");

fs.rmSync("dist", { force: true, recursive: true });
fs.mkdirSync("dist");

const packageJson = require(path.join(process.cwd(), "package.json"));
const { scripts, devDependencies, private, ...distributedPackageJson } = packageJson;

fs.writeFileSync(path.join("dist", "package.json"), prettier.format(distributedPackageJson));


fsExtra.copySync("index.js", path.join("dist", "index.js"));
fsExtra.copySync("bin", path.join("dist", "bin"));
fsExtra.copySync("README.md", path.join("dist", "README.md"));

