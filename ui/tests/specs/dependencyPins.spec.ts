import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Walk up from this spec file until the repository root is found.  The root is the
 * only directory that holds both the docs-playbook and the ui/ui-editors projects.
 */
function repositoryRoot(): string {
    let current: string = __dirname;
    for (let i = 0; i < 10; i++) {
        const hasDocs = existsSync(resolve(current, "docs-playbook", "package-lock.json"));
        const hasEditors = existsSync(resolve(current, "ui", "ui-editors", "package-lock.json"));
        if (hasDocs && hasEditors) {
            return current;
        }
        current = resolve(current, "..");
    }
    throw new Error("Could not locate the repository root starting from " + __dirname);
}

/** Read the resolved version of a package from a npm package-lock.json file. */
function lockedVersion(lockfilePath: string, packageName: string): string | undefined {
    const lock = JSON.parse(readFileSync(lockfilePath, "utf-8"));
    const entry = lock.packages["node_modules/" + packageName];
    return entry === undefined ? undefined : entry.version;
}

test("Dependencies - lockfiles pin the patched minimist and http-proxy-middleware", async () => {
    const root: string = repositoryRoot();

    // GHSA-xvch-5gv4-984h (prototype pollution) is fixed in minimist 1.2.6.
    const docsLockfile: string = resolve(root, "docs-playbook", "package-lock.json");
    expect(lockedVersion(docsLockfile, "minimist")).toBe("1.2.6");

    // GHSA-gcq2-9pq2-cxqm (CRLF injection in fixRequestBody) is fixed in 3.0.7.
    const editorsLockfile: string = resolve(root, "ui", "ui-editors", "package-lock.json");
    expect(lockedVersion(editorsLockfile, "http-proxy-middleware")).toBe("3.0.7");
});
