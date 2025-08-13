import React from "react";

const defaultContent = [
  "© 2025 MyCompany. All rights reserved.",
  "Built with ❤️ using React.",
];

export default function Footer({ style, content }) {
  const footerContent = content && content.length ? content : defaultContent;

  return (
    <footer
      style={{
        backgroundColor: "#222",
        color: "#a76e6e",
        padding: "1.5rem 2rem",
        
        textAlign: "center",
        borderRadius: "6px",
        fontSize: "0.9rem",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 -2px 8px rgba(221, 193, 193, 0.7)",
        ...style,
      }}
    >
      {Array.isArray(footerContent)
        ? footerContent.map((line, idx) => <div key={idx}>{line}</div>)
        : footerContent}
    </footer>
  );
}
