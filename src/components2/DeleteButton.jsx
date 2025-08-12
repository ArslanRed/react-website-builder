import React from "react";

export default function DeleteButton({ onClick, style }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: "absolute",
        top: 2,
        right: 2,
        width: 20,
        height: 20,
        borderRadius: 10,
        border: "none",
        backgroundColor: "#f87171",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        zIndex: 20,
        lineHeight: "18px",
        textAlign: "center",
        padding: 0,
        ...style, // merge with additional styles
      }}
      title="Delete block"
    >
      ×
    </button>
  );
}
