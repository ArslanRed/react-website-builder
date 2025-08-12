import React from "react";

export default function UndoRedoControls({ onUndo, onRedo, canUndo, canRedo }) {
  return (
    <div style={{ padding: 8, backgroundColor: "#fff", display: "flex", gap: 10 }}>
      <button onClick={onUndo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
}
