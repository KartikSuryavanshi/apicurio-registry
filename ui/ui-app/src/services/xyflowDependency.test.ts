import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
    Background,
    Controls,
    Handle,
    MiniMap,
    Panel,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
} from "@xyflow/react";
import appPackage from "../../package.json";

const here = dirname(fileURLToPath(import.meta.url));

function readJson(relativePath: string): any {
    return JSON.parse(readFileSync(resolve(here, relativePath), "utf8"));
}

describe("@xyflow/react dependency", () => {
    it("is pinned to the 13.0.3 release the reference graph is built against", () => {
        const lockfile = readJson("../../package-lock.json");
        const xyflow = lockfile.packages["node_modules/@xyflow/react"];
        const system = lockfile.packages["node_modules/@xyflow/system"];

        expect(appPackage.dependencies["@xyflow/react"]).toBe("13.0.3");
        expect(lockfile.packages[""].dependencies["@xyflow/react"]).toBe("13.0.3");
        expect(xyflow.version).toBe("13.0.3");
        expect(xyflow.resolved).toContain("@xyflow/react/-/react-13.0.3.tgz");
        // 13.0.3 ships @xyflow/system 1.0.1; the lockfile must mirror that.
        expect(xyflow.dependencies["@xyflow/system"]).toBe("1.0.1");
        expect(system.version).toBe("1.0.1");
        expect(system.resolved).toContain("@xyflow/system/-/system-1.0.1.tgz");
    });

    it("exposes the API the reference graph imports", () => {
        // These exports are the public React Flow API consumed by
        // ReferenceGraphView, ReferenceGraphNode and useReferenceGraph.
        expect(ReactFlow).toBeDefined();
        expect(Controls).toBeDefined();
        expect(MiniMap).toBeDefined();
        expect(Background).toBeDefined();
        expect(Panel).toBeDefined();
        expect(ReactFlowProvider).toBeDefined();
        expect(Handle).toBeDefined();
        expect(typeof useNodesState).toBe("function");
        expect(typeof useEdgesState).toBe("function");
        expect(Position.Top).toBeDefined();
    });
});
