import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const editorsDir = resolve(here, "../../../ui-editors");

function readJson(relativePath: string): any {
    return JSON.parse(readFileSync(resolve(editorsDir, relativePath), "utf8"));
}

function readSource(relativePath: string): string {
    return readFileSync(resolve(editorsDir, relativePath), "utf8");
}

describe("ui-editors marked dependency", () => {
    it("is pinned to the release used by the markdown editors", () => {
        const packageJson = readJson("package.json");
        const packageLock = readJson("package-lock.json");

        expect(packageJson.dependencies["marked"]).toBe("18.3.0");
        expect(packageLock.packages[""].dependencies["marked"]).toBe("18.3.0");
        expect(packageLock.packages["node_modules/marked"].version).toBe("18.3.0");
        expect(packageLock.packages["node_modules/marked"].resolved).toContain("marked-18.3.0.tgz");
        expect(packageLock.packages["node_modules/marked"].integrity).toMatch(/^sha512-/);
    });

    it("keeps the token-based API used by the markdown components", () => {
        const markdown = readSource("src/app/editor/_components/common/markdown.component.ts");
        const summary = readSource("src/app/editor/_components/common/markdown-summary.component.ts");

        // marked 5 removed the positional renderer arguments, so both
        // components must keep using marked.parse and token renderers.
        for (const source of [markdown, summary]) {
            expect(source).toMatch(/import\s+\*\s+as\s+marked\s+from\s+["']marked["']/);
            expect(source).toContain("marked.parse(");
        }
        expect(summary).toContain("extends marked.Renderer");
        expect(summary).toContain("marked.Tokens.");
    });
});
