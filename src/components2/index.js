import Header from "./Header";
import Aside from "./Aside";
import Footer from "./Footer";

export const BLOCK_TEMPLATES = {
  h1: {
    type: "text",
    tag: "h1",
    content: "Heading 1",
    style: { fontSize: "2rem", fontWeight: "bold" },
    width: 600, // typical width for headings
    height: 60, // approximate height for 2rem font
  },
  p: {
    type: "text",
    tag: "p",
    content: "Paragraph text",
    style: { margin: "0.5rem 0" },
    width: 600,
    height: 40, // one line of text ~40px
  },

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
    width: 1200, // full-width header typical
    height: 100, // standard header height
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
    width: 1000, // reasonable section width
    height: 250, // starting section height
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

  // Full React components
  fullHeader: {
    type: "component",
    component: Header,
    width: 1200,
    height: 100,
  },

  aside: {
    type: "component",
    component: Aside,
    width: 300,
    height: 600, // typical sidebar height
  },

  footer: {
    type: "component",
    component: Footer,
    width: 1200,
    height: 80, // standard footer height
  },
};
