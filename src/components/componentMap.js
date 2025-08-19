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

import Card1 from "./Card1";
import card1Css from "../styles/Card1.module.css?raw";
import card1Source from "./Card1.jsx?raw";

import Aside1 from "./Aside1";
import aside1Css from "../styles/Aside1.module.css?raw";
import aside1Source from "./Aside1.jsx?raw";

import Section1 from "./Section1";
import section1Css from "../styles/Section1.module.css?raw";
import section1Source from "./Section1.jsx?raw";

import About1 from "./About1";
import about1Css from "../styles/About1.module.css?raw";
import about1Source from "./About1.jsx?raw";

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

Card1.__sourceCode = card1Source;
Card1.__files = { "styles/Card1.module.css": card1Css };

Aside1.__sourceCode = aside1Source;
Aside1.__files = { "styles/Aside1.module.css": aside1Css };

Section1.__sourceCode = section1Source;
Section1.__files = { "styles/Section1.module.css": section1Css };

About1.__sourceCode = about1Source;
About1.__files = { "styles/About1.module.css": about1Css };

/* ----------------
   Export Maps
------------------ */
export const componentMap = {
  header1: Header1,
  header2: Header2,
  hero: Hero,
  footer1: Footer1,
  card1: Card1,
  aside1: Aside1,
  section1: Section1,
  about1: About1,
};

export const defaultPropsMap = {
  header1: {
    title: "My Site",
    navItems: [{ content: "Home" }, { content: "About" }],
    ctaItems: [{ content: "Get Started" }],
    style: {},
    elements: {
      // Main container (structural - uses style)
      header: { style: {}, textStyle: {} },
      
      // Text elements (use textStyle for text styling)
      title: { style: {}, textStyle: {} },
      "navItem-0": { style: {}, textStyle: {} },
      "navItem-1": { style: {}, textStyle: {} }, 
      cta: { style: {}, textStyle: {} }, // CTA button text
      
      // Structural containers (use style only)
      nav: { style: {}, textStyle: {} },
      navList: { style: {}, textStyle: {} },
      logo: { style: {}, textStyle: {} },
    },
  },
  header2: {
    title: "Header 2",
    navItems: [],
    ctaItems: [],
    style: {},
    elements: {
      header: { style: {}, textStyle: {} },
      title: { style: {}, textStyle: {} },
      nav: { style: {}, textStyle: {} },
    },
  },
  hero: {
    heading: "Hero Title",
    subheading: "Hero Subtitle", 
    ctaText: "Get Started",
    backgroundImage: "https://images.unsplash.com/photo-1670584646629-e6d830beebaf?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.0.1&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    style: {},
    elements: {
      // Text elements
      heading: { style: {}, textStyle: {} },
      subheading: { style: {}, textStyle: {} },
      cta: { style: {}, textStyle: {} }, // CTA button text
      
      // Visual/structural elements
      backgroundImage: { style: {}, textStyle: {} },
    },
  },
  footer1: {
    title: "Footer Title",
    navItems: [{ content: "Home" }, { content: "Contact" }],
    copyright: "© 2025 My Company",
    style: {},
    elements: {
      // Main container
      footer: { style: {}, textStyle: {} },
      
      // Text elements
      title: { style: {}, textStyle: {} },
      copyright: { style: {}, textStyle: {} },
      "navItem-0": { style: {}, textStyle: {} },
      "navItem-1": { style: {}, textStyle: {} },
      
      // Structural elements
      navList: { style: {}, textStyle: {} },
    },
  },
  card1: {
    imageSrc: "https://via.placeholder.com/300",
    heading: "Card Heading", 
    text: "Card description text goes here.",
    style: {},
    elements: {
      // Main container
      card: { style: {}, textStyle: {} },
      
      // Text elements  
      heading: { style: {}, textStyle: {} }, // Use "heading" to match component
      text: { style: {}, textStyle: {} },     // Use "text" to match component
      
      // Visual elements
      image: { style: {}, textStyle: {} }, // Use "image" to match component
    },
  },
  aside1: {
    title: "Aside Title",
    items: [{ content: "Item 1" }, { content: "Item 2" }],
    style: {},
    elements: {
      // Main container
      aside: { style: {}, textStyle: {} },
      
      // Text elements - FIXED: Match component element IDs
      title: { style: {}, textStyle: {} },        // Main aside title
      "item-0": { style: {}, textStyle: {} },     // List items  
      "item-1": { style: {}, textStyle: {} },
      
      // Structural elements
      list: { style: {}, textStyle: {} },         // List container
    },
  },
  section1: {
    heading: "Section Heading",
    text: "Section description goes here.",
    style: {},
    elements: {
      // Main container
      section: { style: {}, textStyle: {} },
      
      // Text elements
      heading: { style: {}, textStyle: {} },
      text: { style: {}, textStyle: {} },
      
      // Structural elements
      childrenWrapper: { style: {}, textStyle: {} },
    },
  },
  about1: {
    heading: "About Us",
    text: "Information about the company goes here.",
    imageSrc: "https://via.placeholder.com/200",
    style: {},
    elements: {
      // Main container
      about1: { style: {}, textStyle: {} },
      
      // Text elements
      heading: { style: {}, textStyle: {} },
      text: { style: {}, textStyle: {} },
      
      // Visual/structural elements
      image: { style: {}, textStyle: {} },
      childrenWrapper: { style: {}, textStyle: {} },
    },
  },
};

/* ----------------
   Components Array
------------------ */
export const components = [
  { id: "header1", name: "Header Style 1" },
  { id: "header2", name: "Header Style 2" },
  { id: "hero", name: "Hero Section" },
  { id: "footer1", name: "Footer" },
  { id: "card1", name: "Card Component" },
  { id: "aside1", name: "Aside Component" },
  { id: "section1", name: "Section Component" },
  { id: "about1", name: "About Section" },
];