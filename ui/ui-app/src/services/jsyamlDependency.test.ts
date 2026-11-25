import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const editorsDir = resolve(here, "../../../ui-editors");

function readJson(relativePath: string): any {
    const text = readFileSync(resolve(editorsDir, relativePath), "utf8");
    // tsconfig.json is JSONC; strip the block and line comments before parsing.
    const json = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    return JSON.parse(json);
}

describe("ui-editors js-yaml dependency", () => {
    it("is pinned to the v5 API version used by the editor call sites", () => {
        const packageJson = readJson("package.json");
        const packageLock = readJson("package-lock.json");

        expect(packageJson.dependencies["js-yaml"]).toBe("5.5.0");
        expect(packageLock.packages[""].dependencies["js-yaml"]).toBe("5.5.0");
        expect(packageLock.packages["node_modules/js-yaml"].version).toBe("5.5.0");
        // js-yaml 5 depends on argparse 3, which must be present in the lock.
        expect(packageLock.packages["node_modules/argparse"].version).toBe("3.0.4");
        expect(packageLock.packages["node_modules/js-yaml"].dependencies["argparse"]).toBe("^3.0.3");
    });

    it("keeps declaration checking compatible with the v5 type definitions", () => {
        const tsconfig = readJson("tsconfig.json");
        // js-yaml 5 ships a d.ts that uses TypedArray generics unsupported by
        // the TypeScript version pinned in ui-editors.
        expect(tsconfig.compilerOptions.skipLibCheck).toBe(true);
    });
});
