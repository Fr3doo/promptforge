export type VersionBump = "major" | "minor" | "patch";

export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.split(".").map(Number);
  return { major: major || 0, minor: minor || 0, patch: patch || 0 };
}

export function bumpVersion(current: string, type: VersionBump): string {
  const { major, minor, patch } = parseVersion(current);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      return current;
  }
}

export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (parsed1.major !== parsed2.major) {
    return parsed1.major - parsed2.major;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor - parsed2.minor;
  }
  return parsed1.patch - parsed2.patch;
}

export function isValidSemVer(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/;
  return semverRegex.test(version);
}
