import Header1 from './Header1';
import Header2 from './Header2';
import Hero from './Hero.jsx';
import Footer1 from './Footer1.jsx';

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
    ctaItems: [{ content: "Get Started" }] 
  },
  header2: { 
    title: "Header 2", 
    navItems: [], 
    ctaItems: [] 
  },
  hero: { 
    title: "Hero Title", 
    subtitle: "Hero Subtitle" 
  },
  footer1: { 
    text: "© 2025 My Company" 
  },
};

export const components = [
  { id: 'header1', name: 'Header Style 1' },
  { id: 'header2', name: 'Header Style 2' },
  { id: 'hero', name: 'Hero Section' },
  { id: 'footer1', name: 'Footer' },
];
