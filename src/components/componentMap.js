import Header1 from "./Header1";
import Header2 from "./Header2";
import Hero from "./Hero";
import Footer1 from "./Footer1";

export const componentMap = {
  header1: Header1,
  header2: Header2,
  hero: Hero,
  footer1: Footer1,
};

export const defaultPropsMap = {
  header1: {
    title: "My Site",
    navItems: [{ content: "Home" }, { content: "About" }],
    ctaItems: [{ content: "Get Started" }],
    style: {}, 
    elements: {
  logo: { style: {}, textStyle: {} },
  title: { style: {}, textStyle: {} },
  nav: { style: {}, listStyle: {} },
  'navItem-0': { style: {}, textStyle: {} },
  'navItem-1': { style: {}, textStyle: {} },
  cta: { style: {} },
  'cta-0': { style: {}, textStyle: {} },
  // add more keys if you dynamically add items
},
  },
  header2: {
    title: "Header 2",
    navItems: [],
    ctaItems: [],
    style: {},
    elements: {},
  },
  hero: {
    title: "Hero Title",
    subtitle: "Hero Subtitle",
    style: {},
    elements: {
      title: { textStyle: {} },
      subtitle: { textStyle: {} },
    },
  },
  footer1: {
    text: "© 2025 My Company",
    style: {},
    elements: {
      text: { textStyle: {} },
    },
  },
};

export const components = [
  { id: "header1", name: "Header Style 1" },
  { id: "header2", name: "Header Style 2" },
  { id: "hero", name: "Hero Section" },
  { id: "footer1", name: "Footer" },
];
