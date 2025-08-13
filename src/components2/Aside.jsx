import React from "react";

export default function Aside({ style, elements }) {
  return (
    <aside
      style={{
        backgroundColor: "#f7f9fc",
        border: "1.5px solid #cbd5e1",
        borderRadius: "8px",
        padding: "1.5rem 1.75rem",
        width: "320px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 2px 12px rgba(100, 100, 120, 0.12)",
        color: "#333",
        ...style,
      }}
    >
      {elements?.map((el) => {
        switch (el.type) {
          case "heading":
            return (
              <h3
                key={el.id}
                style={{
                  marginBottom: "0.75rem",
                  fontSize: "1.3rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  userSelect: "text",
                  ...el.style,
                }}
              >
                {el.content}
              </h3>
            );

          case "paragraph":
            return (
              <p
                key={el.id}
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  marginTop: 0,
                  color: "#475569",
                  userSelect: "text",
                  ...el.style,
                }}
              >
                {el.content}
              </p>
            );

          default:
            return null;
        }
      })}
    </aside>
  );
}
