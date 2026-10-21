"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Network, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function MindMapEngine({ data, topic = "Topic" }) {
  // Convert hierarchical mindmap schema into positioned ReactFlow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const rootLabel = (data?.label || data?.root || topic).slice(0, 30);
    const children = Array.isArray(data?.children) ? data.children : (
      Array.isArray(data?.branches) ? data.branches.map((b, i) => ({
        id: `branch-${i}`,
        label: b.name || b.label || `Branch ${i+1}`,
        children: Array.isArray(b.details) ? b.details.map((d, j) => ({ id: `detail-${i}-${j}`, label: String(d).slice(0, 25) })) : []
      })) : [
        { id: "c1", label: "Core Principles", children: [{ id: "c1a", label: "Rule A" }, { id: "c1b", label: "Rule B" }] },
        { id: "c2", label: "Mechanics", children: [{ id: "c2a", label: "Inputs" }, { id: "c2b", label: "Outputs" }] },
        { id: "c3", label: "Applications", children: [{ id: "c3a", label: "Industry Use" }] },
        { id: "c4", label: "Best Practices", children: [{ id: "c4a", label: "Golden Rule" }] }
      ]
    );

    const nodes = [];
    const edges = [];

    const rootX = 400;
    const rootY = 300;

    // Root Node (Large Indigo)
    nodes.push({
      id: "root",
      position: { x: rootX, y: rootY },
      data: { label: rootLabel },
      style: {
        background: "#4f46e5",
        color: "#ffffff",
        border: "3px solid #3730a3",
        borderRadius: "16px",
        padding: "16px 24px",
        fontFamily: "var(--font-sans), sans-serif",
        fontSize: "15px",
        fontWeight: "bold",
        boxShadow: "0 12px 30px -5px rgba(79, 70, 229, 0.45)",
        textAlign: "center",
        minWidth: "150px"
      },
    });

    const totalBranches = children.length;
    const branchRadius = 260;

    children.forEach((branch, bIdx) => {
      const angle = (bIdx / totalBranches) * 2 * Math.PI - Math.PI / 2;
      const branchX = rootX + Math.cos(angle) * branchRadius;
      const branchY = rootY + Math.sin(angle) * branchRadius;
      const branchId = branch.id || `branch-${bIdx}`;
      const branchLabel = (branch.label || `Branch ${bIdx + 1}`).slice(0, 25);

      // Level 1 Node (Medium Purple)
      nodes.push({
        id: branchId,
        position: { x: branchX, y: branchY },
        data: { label: branchLabel },
        style: {
          background: "#ffffff",
          color: "#1e1b4b",
          border: "2px solid #818cf8",
          borderRadius: "12px",
          padding: "12px 18px",
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "13px",
          fontWeight: "700",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
          minWidth: "140px",
          textAlign: "center"
        },
      });

      // Edge: Root -> Branch
      edges.push({
        id: `e-root-${branchId}`,
        source: "root",
        target: branchId,
        type: "default",
        animated: true,
        style: { stroke: "#6366f1", strokeWidth: 2.5 },
      });

      // Level 2 Nodes (Leaves)
      const leaves = Array.isArray(branch.children) ? branch.children : [];
      const leafRadius = 140;

      leaves.forEach((leaf, lIdx) => {
        const leafAngle = angle + ((lIdx - (leaves.length - 1) / 2) * 0.45);
        const leafX = branchX + Math.cos(leafAngle) * leafRadius;
        const leafY = branchY + Math.sin(leafAngle) * leafRadius;
        const leafId = leaf.id || `leaf-${bIdx}-${lIdx}`;
        const leafLabel = (typeof leaf === "object" ? leaf.label : String(leaf)).slice(0, 25);

        nodes.push({
          id: leafId,
          position: { x: leafX, y: leafY },
          data: { label: leafLabel },
          style: {
            background: "#f8fafc",
            color: "#475569",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "var(--font-sans), sans-serif",
            fontSize: "11px",
            fontWeight: "600",
            minWidth: "120px",
            textAlign: "center"
          },
        });

        // Edge: Branch -> Leaf
        edges.push({
          id: `e-${branchId}-${leafId}`,
          source: branchId,
          target: leafId,
          type: "default",
          style: { stroke: "#cbd5e1", strokeWidth: 1.5, strokeDasharray: "4 4" },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, topic]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full space-y-4">
      {/* Canvas Wrapper */}
      <div className="w-full h-[560px] bg-gray-50 border border-gray-200 rounded-3xl relative overflow-hidden shadow-inner">
        
        {/* Canvas Top Tag */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-gray-700 shadow-sm">
          <Network className="w-4 h-4 text-indigo-600" />
          <span>Interactive Mind Map Canvas — {topic}</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="touch-none"
        >
          <Background color="#cbd5e1" gap={24} size={1} />
          <Controls className="!bg-white !border-gray-200 !shadow-sm !rounded-2xl" />
          <MiniMap 
            nodeColor={(node) => {
              if (node.id === "root") return "#4f46e5";
              if (node.id.startsWith("branch") || node.id.startsWith("c")) return "#818cf8";
              return "#cbd5e1";
            }}
            className="!bg-white !border-gray-200 !rounded-2xl !shadow-sm" 
          />
        </ReactFlow>
      </div>

      <p className="text-xs text-gray-500 text-center font-medium">
        Nodes are automatically organized. Drag nodes to customize layout, use scroll to zoom.
      </p>
    </div>
  );
}
