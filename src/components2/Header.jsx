import React from "react";
import SimpleDNDBlock from "./SimpleDndBlock"; // use your existing recursive renderer

const defaultElements = [
  {
    id: "icon_1",
    type: "icon",
    content: "🔷",
    style: { fontSize: "2rem", color: "#4fc3f7", fontWeight: 900, lineHeight: 1 },
  },
  {
    id: "site_title",
    type: "heading",
    content: "My Site Title",
    style: {
      fontSize: "1.9rem",
      fontWeight: 800,
      textAlign: "center",
      flexGrow: 1,
      color: "#f0f0f0",
      userSelect: "text",
    },
  },
  {
    id: "nav_1",
    type: "nav",
    style: { display: "flex", gap: "1.8rem", fontWeight: 600, fontSize: "1rem", userSelect: "none", color: "#bbb" },
    elements: [
      { id: "nav_home", type: "link", content: "Home", style: { textDecoration: "none", color: "#4fc3f7", padding: "0.4rem 0.8rem", borderRadius: "5px" } },
      { id: "nav_about", type: "link", content: "About", style: { textDecoration: "none", color: "#4fc3f7", padding: "0.4rem 0.8rem", borderRadius: "5px" } },
      { id: "nav_services", type: "link", content: "Services", style: { textDecoration: "none", color: "#4fc3f7", padding: "0.4rem 0.8rem", borderRadius: "5px" } },
      { id: "nav_contact", type: "link", content: "Contact", style: { textDecoration: "none", color: "#4fc3f7", padding: "0.4rem 0.8rem", borderRadius: "5px" } },
    ],
  },
  {
    id: "logo_name",
    type: "text",
    content: "LogoName",
    style: { fontWeight: 700, fontSize: "1.2rem", letterSpacing: "1px", color: "#4fc3f7" },
  },
];

export default function Header({ style = {}, elements = [], selectedTarget, setSelectedTarget, blockId }) {
  const elems = elements.length > 0 ? elements : defaultElements;

  return (
    <header
      style={{
        ...style,
        backgroundColor: "#1a1f36",
        padding: "1rem 3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
        borderRadius: "10px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#eee",
      }}
    >
      {elems.map((el) => (
        <SimpleDNDBlock
          key={el.id}
          block={el}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          blockId={blockId || "header_block"}
        />
      ))}
    </header>
  );
}
