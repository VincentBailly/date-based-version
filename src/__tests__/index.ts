import { directory as tmpDir } from "tempy";
import { commandSync } from "execa";
import { writeFileSync } from "fs";
import { join } from "path";
import { setVersion, getCurrentLatestVersion, getCurrentBranch } from "../index";

function initRepo(): string {
    const cwd = tmpDir();
    commandSync("git init", { cwd });
    return cwd;
}

function createCommit(cwd): void {
  const randomString = Math.random().toString();
  writeFileSync(join(cwd, `${randomString}.txt`), randomString);
    commandSync(`git add ${randomString}.txt`, { cwd });
    commandSync(`git commit -m ${randomString}`, { cwd });

}

describe("When previous version has today's date", () => {
  it("creates a new version which is a simple bump of the third component", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200510.2.0`, { cwd });

    createCommit(cwd);
    commandSync(`git tag randomTag`, { cwd });

    // Act
    setVersion(cwd);

    // Validate
    const currentLatestVersion = getCurrentLatestVersion(cwd);
    expect(currentLatestVersion).toBe("v1.20200510.3.0");
  })
});

describe("edge cases", () => {
  it("thows if head already have a version tag", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200510.2.0`, { cwd });

    // Validate
    expect(() => setVersion(cwd)).toThrow();
  });

  it ("creates a new tag if the git history does not contain any version tag", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);

    // Act
    setVersion(cwd);

    // Validate
    const currentLatestVersion = getCurrentLatestVersion(cwd);
    expect(currentLatestVersion).toBe("v1.20200510.1.0");
  });

  it("throws if HEAD is a release branch but we can't find any matching tag", () => {
    throw new Error("Not implemented");
  })
})

describe("When previous version has not today's date", () => {
  it("creates a new version which contains today's date", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200503.20.0`, { cwd });

    createCommit(cwd);
    commandSync(`git tag randomTag`, { cwd });

    // Act
    setVersion(cwd);

    // Validate
    const currentLatestVersion = getCurrentLatestVersion(cwd);
    expect(currentLatestVersion).toBe("v1.20200510.1.0");
  })

  it("reset the third and fourth component", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200503.20.8`, { cwd });

    createCommit(cwd);
    commandSync(`git tag randomTag`, { cwd });

    // Act
    setVersion(cwd);

    // Validate
    const currentLatestVersion = getCurrentLatestVersion(cwd);
    expect(currentLatestVersion).toBe("v1.20200510.1.0");
  })
});

describe("Creation of release branch", () => {
  it("creates a release branch with the three first components of the version", () => {
    // Setup
    jest.spyOn(global.Date, "now").mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200510.2.0`, { cwd });

    createCommit(cwd);
    commandSync(`git tag randomTag`, { cwd });

    // Act
    setVersion(cwd);

    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("release/v1.20200510.3");
  });

  it("does not create a branch if HEAD is a release branch (case of patch build)", () => {
    const cwd = initRepo();

    createCommit(cwd);
    commandSync(`git tag v1.20200510.2.0`, { cwd });
    commandSync(`git checkout -b release/v1.20200510.2`, { cwd });

    createCommit(cwd);

    // Act
    setVersion(cwd);

    // Validate
    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("release/v1.20200510.2");
  });
})

describe("When it is a patch build", () => {
  it("creates a version which is a bump of the fourth component compared to the previous version", () => {
    throw new Error("Not implemented");
  })

})
