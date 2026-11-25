import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const editorsDir = resolve(here, "../../../ui-editors");

function readJson(relativePath: string): any {
    return JSON.parse(readFileSync(resolve(editorsDir, relativePath), "utf8"));
}

describe("ui-editors zone.js dependency", () => {
    it("is pinned to the 0.16.3 API version used by the Angular editor", () => {
        const packageJson = readJson("package.json");
        const packageLock = readJson("package-lock.json");

        expect(packageJson.dependencies["zone.js"]).toBe("0.16.3");
        // @angular/core 18 declares a ~0.14.10 peer range, so the pin is only
        // installable when the same version is forced through overrides.
        expect(packageJson.overrides?.["zone.js"]).toBe("0.16.3");
        expect(packageLock.packages[""].dependencies["zone.js"]).toBe("0.16.3");
        expect(packageLock.packages["node_modules/zone.js"].version).toBe("0.16.3");
        expect(packageLock.packages["node_modules/zone.js"].resolved).toContain("zone.js-0.16.3.tgz");
    });

    it("keeps the zone.js entry point imported by the editor polyfills", () => {
        const polyfills = readFileSync(resolve(editorsDir, "src/polyfills.ts"), "utf8");
        expect(polyfills).toMatch(/import\s+["']zone\.js["']\s*;/);
    });
});
