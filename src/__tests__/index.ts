import { directory as tmpDir } from "tempy";
import { commandSync } from "execa";
import { setVersion } from "../index";
import { tryGetLatestVersion } from "../version";
import {
  getCurrentBranch,
  getTags,
  createCommit,
  tag,
  checkoutNewBranch,
} from "../git";

export function createNewRepo(): string {
  const cwd = tmpDir();
  commandSync("git init", { cwd });
  return cwd;
}

describe("When previous version has today's date", () => {
  it("returns the new version", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    createCommit(cwd);
    tag(`randomTag`, cwd);

    // Act
    const version = setVersion({ cwd });

    // Validate
    expect(version).toBe("1.20200510.3.0");
  });

  it("creates a new version which is a simple bump of the third component", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    createCommit(cwd);
    tag(`randomTag`, cwd);

    // Act
    setVersion({ cwd });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.3.0");
  });
});

describe("edge cases", () => {
  it("does not throw if head already has a version tag", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Validate
    expect(() => setVersion({ cwd })).not.toThrow();
  });

  it("returns new version if head already has a version tag", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Validate
    expect(setVersion({ cwd })).toBe("1.20200510.3.0");

    debugger;
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.3.0");
  });

  it("creates a new tag if the git history does not contain any version tag", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);

    // Act
    setVersion({ cwd });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.1.0");
  });

  it("throws if the patch option is passed but we can't find any version tag at all", () => {
    const cwd = createNewRepo();

    createCommit(cwd);

    createCommit(cwd);

    expect(() => setVersion({ cwd, patch: true })).toThrow();
  });
});

describe("When previous version has not today's date", () => {
  it("creates a new version which contains today's date", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200503.20.0`, cwd);

    createCommit(cwd);
    tag(`randomTag`, cwd);

    // Act
    setVersion({ cwd });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.1.0");
  });

  it("reset the third and fourth component", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200503.20.8`, cwd);

    createCommit(cwd);
    tag(`randomTag`, cwd);

    // Act
    setVersion({ cwd });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.1.0");
  });
});

describe("Creation of release branch", () => {
  it("creates a release branch with the three first components of the version", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    createCommit(cwd);
    tag(`randomTag`, cwd);

    // Act
    setVersion({ cwd });

    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("release/v1.20200510.3");
  });

  it("does not create a branch if HEAD is a release branch (case of patch build)", () => {
    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);
    checkoutNewBranch(`release/v1.20200510.2`, cwd);

    createCommit(cwd);

    // Act
    setVersion({ cwd, patch: true });

    // Validate
    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("release/v1.20200510.2");
  });
});

describe("When it is a patch build", () => {
  it("creates a version which is a bump of the fourth component compared to the previous version", () => {
    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200512.2.0`, cwd);
    checkoutNewBranch(`release/v1.20200512.2`, cwd);

    createCommit(cwd);

    // Act
    setVersion({ cwd, patch: true });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200512.2.1");
  });

  it("The version in other branches don't interfere with the patch build version", () => {
    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200512.2.0`, cwd);
    checkoutNewBranch(`release/v1.20200512.2`, cwd);

    commandSync("git checkout master", { cwd });
    createCommit(cwd);
    tag(`v1.20200512.3.0`, cwd);

    commandSync(`git checkout release/v1.20200512.2`, { cwd });

    createCommit(cwd);

    // Act
    setVersion({ cwd, patch: true });

    // Validate
    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200512.2.1");
  });
});

describe("Scope tag", () => {
  it("prefix tag with the scope when provided", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`scope/v1.20200510.2.0`, cwd);
    tag(`wrong-scope/v1.20200510.3.0`, cwd);

    // Act
    const scopeTag = "scope";
    setVersion({ cwd, scopeTag });

    const currentLatestVersion = tryGetLatestVersion(cwd, "scope");
    expect(currentLatestVersion.getTag(scopeTag)).toBe("scope/v1.20200510.3.0");

    const tags = getTags(cwd);
    expect(tags[0]).toContain("scope/v1.20200510.3.0");
  });

  it("requires existing tags to be prefixed when scope is provided", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Act
    const scopeTag = "scope";
    setVersion({ cwd, scopeTag });

    const currentLatestVersion = tryGetLatestVersion(cwd, "scope");
    expect(currentLatestVersion.getTag(scopeTag)).toBe("scope/v1.20200510.1.0");

    const tags = getTags(cwd);
    expect(tags[0]).toContain("scope/v1.20200510.1.0");
  });

  it("create a tag without a prefix when no scope is provided", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Act
    setVersion({ cwd });

    const currentLatestVersion = tryGetLatestVersion(cwd);
    expect(currentLatestVersion.getTag()).toBe("v1.20200510.3.0");

    const tags = getTags(cwd);
    expect(tags[0]).toContain("v1.20200510.3.0");
  });
});
describe("Scope branch", () => {
  it("prefix branch with the scope when provided", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Act
    setVersion({ cwd, scopeBranch: "scope" });

    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("scope/release/v1.20200510.3");
  });

  it("create a branch without a prefix when no scope is provided", () => {
    // Setup
    jest
      .spyOn(global.Date, "now")
      .mockImplementation(() => new Date("2020-05-10T11:01:58.135Z").valueOf());

    const cwd = createNewRepo();

    createCommit(cwd);
    tag(`v1.20200510.2.0`, cwd);

    // Act
    setVersion({ cwd });

    const currenBranch = getCurrentBranch(cwd);
    expect(currenBranch).toBe("release/v1.20200510.3");
  });
});
describe("skip tagging", () => {
  it("should not tag when skipTagging is true", () => {
    const cwd = createNewRepo();
    const options = { cwd, skipTagging: true };
    createCommit(cwd);
    setVersion(options);
    const tags = getTags(cwd);
    expect(tags).not.toContain("v1.20200510.1.0");
  });
});
