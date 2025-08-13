import React from "react";

export default function EditableMenuWorking({ block, onClose }) {
  if (!block) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 40,
        right: 10,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        padding: 24,
        borderRadius: 12,
        width: 320,
        zIndex: 10000,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
        userSelect: "text",
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          fontSize: 18,
          border: "none",
          background: "none",
          cursor: "pointer",
        }}
        aria-label="Close editor"
      >
        ✕
      </button>

      <h3>Edit Block ({block.type})</h3>
    </div>
  );
}
