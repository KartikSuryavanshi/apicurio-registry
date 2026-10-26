import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

interface LockfilePackage {
    version?: string;
}

interface Lockfile {
    packages?: Record<string, LockfilePackage>;
}

const UI_APP_ROOT = process.cwd();

const LOCKFILES: string[] = [
    join(UI_APP_ROOT, "package-lock.json"),
    join(UI_APP_ROOT, "../ui-editors/package-lock.json"),
    join(UI_APP_ROOT, "../ui-docs/package-lock.json"),
    join(UI_APP_ROOT, "../tests/package-lock.json")
];

function parseVersion(version: string): number[] {
    return version.split(".").map((part) => parseInt(part, 10)).slice(0, 3);
}

function gte(actual: number[], expected: number[]): boolean {
    for (let i = 0; i < 3; i++) {
        const a = actual[i] ?? 0;
        const e = expected[i] ?? 0;
        if (a !== e) {
            return a > e;
        }
    }
    return true;
}

function packageName(lockfileKey: string): string | null {
    if (!lockfileKey.startsWith("node_modules/")) {
        return null;
    }
    const rest = lockfileKey.slice("node_modules/".length);
    return rest.split("/node_modules/").pop() ?? null;
}

describe("CVE-fixed dependency versions", () => {
    it("pins zod >= 4.6.6 and body-parser >= 2.4.0 in every UI lockfile", () => {
        const versions: Record<string, string[]> = {
            zod: [],
            "body-parser": []
        };

        for (const lockfilePath of LOCKFILES) {
            const lock = JSON.parse(readFileSync(lockfilePath, "utf8")) as Lockfile;
            for (const [key, pkg] of Object.entries(lock.packages ?? {})) {
                const name = packageName(key);
                if (name === "zod" || name === "body-parser") {
                    versions[name].push(pkg.version ?? "?");
                }
            }
        }

        expect(versions["zod"].length).toBeGreaterThan(0);
        expect(versions["body-parser"].length).toBeGreaterThan(0);

        for (const version of versions["zod"]) {
            expect(gte(parseVersion(version), [4, 6, 6]), `zod ${version} must be >= 4.6.6`).toBe(true);
        }
        for (const version of versions["body-parser"]) {
            expect(gte(parseVersion(version), [2, 4, 0]), `body-parser ${version} must be >= 2.4.0`).toBe(true);
        }
    });
});
