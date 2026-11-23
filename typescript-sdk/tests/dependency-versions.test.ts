import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface LockfilePackage {
    version?: string;
}

interface Lockfile {
    packages?: Record<string, LockfilePackage>;
}

const HERE = dirname(fileURLToPath(import.meta.url));
const DOCS_PLAYBOOK_LOCKFILE = resolve(HERE, "../../docs-playbook/package-lock.json");

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

function isPackage(lockfileKey: string, name: string): boolean {
    return lockfileKey === `node_modules/${name}` || lockfileKey.endsWith(`/node_modules/${name}`);
}

describe("docs-playbook dependency versions", () => {
    it("does not resolve a vulnerable isomorphic-git version", () => {
        const lock = JSON.parse(readFileSync(DOCS_PLAYBOOK_LOCKFILE, "utf8")) as Lockfile;
        const versions = Object.entries(lock.packages ?? {})
            .filter(([key]) => isPackage(key, "isomorphic-git"))
            .map(([, pkg]) => pkg.version ?? "?");

        expect(versions.length).toBeGreaterThan(0);
        for (const version of versions) {
            expect(gte(parseVersion(version), [1, 38, 6]), `isomorphic-git ${version} must be >= 1.38.6`).toBe(true);
        }
    });
});
