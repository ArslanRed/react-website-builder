export const BLOCK_TEMPLATES = {
  h1: { type: "text", tag: "h1", content: "Heading 1", style: { fontSize: "2rem", fontWeight: "bold" } },
  p: { type: "text", tag: "p", content: "Paragraph text", style: { margin: "0.5rem 0" } },

  header: {
    type: "container",
    tag: "header",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#eee",
      padding: "1rem",
    },
    content: [],
    elements: [
      {
        id: "icon_1",
        type: "icon",
        content: "🔷",
        style: { fontSize: "1.5rem" },
      },
      {
        id: "heading_1",
        type: "heading",
        tag: "h1",
        content: "Site Title",
        style: { margin: 0, cursor: "pointer", userSelect: "text" },
      },
      {
        id: "nav_1",
        type: "nav",
        content: ["Home", "About", "Contact"],
        style: {
          display: "flex",
          gap: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          userSelect: "none",
        },
      },
    ],
  },

  section: {
    type: "container",
    tag: "section",
    style: {
      padding: "1rem",
      border: "1px solid #ddd",
      textAlign: "center",
    },
    elements: [
      {
        id: "heading_2",
        type: "heading",
        tag: "h2",
        content: "Section Heading",
        style: { cursor: "pointer", userSelect: "text" },
      },
      {
        id: "paragraph_1",
        type: "paragraph",
        tag: "p",
        content: "This is some example text inside the section.",
        style: { marginTop: "0.5rem" },
      },
    ],
  },
};
