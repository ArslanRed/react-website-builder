/* ----------------
   Imports
------------------ */
import Header1 from "./Header1";
import header1Css from "../styles/Header1.module.css?raw";
import header1Source from "./Header1.jsx?raw";

import Header2 from "./Header2";
import header2Css from "../styles/Header2.module.css?raw";
import header2Source from "./Header2.jsx?raw";

import Hero from "./Hero";
import heroCss from "../styles/Hero.module.css?raw";
import heroSource from "./Hero.jsx?raw";

import Footer1 from "./Footer1";
import footer1Css from "../styles/Footer1.module.css?raw";
import footer1Source from "./Footer1.jsx?raw";

/* ----------------
   Attach metadata
------------------ */
Header1.__sourceCode = header1Source;
Header1.__files = { "styles/Header1.module.css": header1Css };

Header2.__sourceCode = header2Source;
Header2.__files = { "styles/Header2.module.css": header2Css };

Hero.__sourceCode = heroSource;
Hero.__files = { "styles/Hero.module.css": heroCss };

Footer1.__sourceCode = footer1Source;
Footer1.__files = { "styles/Footer1.module.css": footer1Css };

/* ----------------
   Export Maps
------------------ */
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
      "navItem-0": { style: {}, textStyle: {} },
      "navItem-1": { style: {}, textStyle: {} },
      cta: { style: {} },
      "cta-0": { style: {}, textStyle: {} },
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
