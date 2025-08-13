import React from "react";

export default function Footer({ style, content }) {
  return (
    <footer
      style={{
        backgroundColor: "#222",
        color: "#eee",
        padding: "1.5rem 2rem",
        textAlign: "center",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.3)",
        ...style,
      }}
    >
      {Array.isArray(content)
        ? content.map((line, idx) => <div key={idx}>{line}</div>)
        : content}
    </footer>
  );
}
