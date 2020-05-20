import { directory as tmpDir } from "tempy";
import { commandSync } from "execa";
import { writeFileSync } from "fs";
import { join } from "path";
import { setVersion, getCurrentLatestVersion } from "../index";

describe("When previous version has today's date", () => {
  it("creates a new version which is a simple bump of the third component", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());
    const repo = tmpDir();
    commandSync("git init", { cwd: repo });
    writeFileSync(join(repo, "foo.txt"), "foo");
    commandSync("git add foo.txt", { cwd: repo });
    commandSync(`git commit -m first`, { cwd: repo });
    commandSync(`git tag v1.20200510.2.0`, { cwd: repo });

    writeFileSync(join(repo, "bar.txt"), "bar");
    commandSync("git add bar.txt", { cwd: repo });
    commandSync(`git commit -m second`, { cwd: repo });
    commandSync(`git tag vincent`, { cwd: repo });

    // Act
    setVersion(repo);

    // Validate
    const currentLatestVersion = getCurrentLatestVersion(repo);
    expect(currentLatestVersion).toBe("v1.20200510.3.0");
  })
});

/*
describe("When previous version has not today's date", () => {
  it("creates a new version which contains today's date", () => {
    throw new Error("Not implemented");
  })

  it("reset the third and fourth component", () => {
    throw new Error("Not implemented");
  })
});

describe("Creation of release branch", () => {
  it("creates a release branch with the three first components of the version", () => {
    throw new Error("Not implemented");
  });

  it("does not happen for a patch build", () => {
    throw new Error("Not implemented");
  });
})

describe("When it is a patch build", () => {
  it("creates a version which is a bump of the fourth component compared to the previous version", () => {
    throw new Error("Not implemented");
  })

})
*/
