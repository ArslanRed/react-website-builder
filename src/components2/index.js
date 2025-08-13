import Header from "./Header";
import Aside from "./Aside";
import Footer from "./Footer";

export const BLOCK_TEMPLATES = {
  h1: {
    type: "text",
    tag: "h1",
    content: "Heading 1",
    style: { fontSize: "2rem", fontWeight: "bold" },
    width: 600,
    height: 60,
  },
  p: {
    type: "text",
    tag: "p",
    content: "Paragraph text",
    style: { margin: "0.5rem 0" },
    width: 600,
    height: 40,
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
    width: 1200,
    height: 100,
    elements: [
      {
        id: "icon_1",
        type: "icon",
        content: "🔷",
        style: { fontSize: "1.5rem", cursor: "pointer" },
      },
      {
        id: "heading_1",
        type: "heading",
        tag: "h1",
        content: "Site Title",
        style: { margin: 0, cursor: "text", userSelect: "text" },
      },
      {
        id: "nav_1",
        type: "nav",
        content: [
          { id: "nav_home", text: "Home" },
          { id: "nav_about", text: "About" },
          { id: "nav_contact", text: "Contact" },
        ],
        style: { display: "flex", gap: "1rem", fontWeight: "bold", cursor: "pointer" },
      },
    ],
  },

  section: {
    type: "container",
    tag: "section",
    style: { padding: "1rem", border: "1px solid #ddd", textAlign: "center" },
    width: 1000,
    height: 250,
    elements: [
      {
        id: "heading_2",
        type: "heading",
        tag: "h2",
        content: "Section Heading",
        style: { cursor: "text", userSelect: "text" },
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

  fullHeader: { type: "component", component: Header, width: 1200, height: 100 },
  aside: { type: "component", component: Aside, width: 300, height: 600 },
  footer: { type: "component", component: Footer, width: 1200, height: 80 },
};
