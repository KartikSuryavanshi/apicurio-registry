import { describe, expect, it } from "vitest";
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

describe("@xyflow/react dependency", () => {
    it("is pinned to 13.x and exposes the API the reference graph imports", () => {
        // These exports are the public React Flow API consumed by
        // ReferenceGraphView, ReferenceGraphNode and useReferenceGraph.
        expect(appPackage.dependencies["@xyflow/react"]).toBe("13.0.2");
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