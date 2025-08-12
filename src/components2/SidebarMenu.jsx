import React from "react";
import { useDrag } from "react-dnd";
import { BLOCK_TEMPLATES } from "./index.js";

export default function SidebarMenu() {
  return (
    <div style={{ width: 200, borderRight: "1px solid #ddd", padding: 10 }}>
      <h3>Blocks</h3>
      {Object.entries(BLOCK_TEMPLATES).map(([key, block]) => (
        <DraggableBlock key={key} block={block} label={key.toUpperCase()} />
      ))}
    </div>
  );
}

function DraggableBlock({ block, label }) {
  const [, drag] = useDrag(() => ({
    type: "NEW_BLOCK",
    item: { block },
  }));
  return (
    <div
      ref={drag}
      style={{
        padding: 8,
        marginBottom: 8,
        backgroundColor: "#e6d6d6ff",
        border: "1px solid #ccc",
        cursor: "grab",
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}
