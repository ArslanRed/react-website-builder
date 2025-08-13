import React from "react";

export default function Header({ style, elements }) {
  return (
    <header
      style={{
        ...style,
        backgroundColor: "#f5f7fa",
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Icon / Logo */}
      <div
        style={{
          fontSize: "1.75rem",
          color: "#007acc",
          fontWeight: "bold",
          userSelect: "none",
        }}
      >
        {elements?.[0]?.content || "🔷"}
      </div>

      {/* Site Title */}
      <h1
        style={{
          margin: 0,
          fontSize: "1.8rem",
          color: "#222",
          fontWeight: "700",
          letterSpacing: "1.5px",
          flexGrow: 1,
          textAlign: "center",
          userSelect: "text",
        }}
      >
        {elements?.[1]?.content || "Site Title"}
      </h1>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          gap: "1.25rem",
          color: "#555",
          fontWeight: "600",
          fontSize: "1rem",
          userSelect: "none",
        }}
      >
        {elements?.[2]?.content?.map((item, i) => (
          <a
            key={i}
            href="#"
            style={{
              textDecoration: "none",
              color: "#007acc",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              transition: "background-color 0.3s ease, color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#007acc";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#007acc";
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
