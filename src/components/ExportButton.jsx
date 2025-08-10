// src/components/ExportButton.js
import React from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import ReactDOMServer from 'react-dom/server';
import ThemeContainer from './ThemeContainer';

// Utility: Convert user theme config to JSX string
function generateJSXString(components, content) {
  const compToJSX = {
    header1: `<Header1 title={"${content.heading || 'Default Title'}"} />`,
    header2: `<Header2 title={"${content.heading || 'Default Title'}"} />`,
    hero: `<Hero subtitle={"${content.paragraph || ''}"} />`,
    footer1: `<Footer1 />`,
  };

  // Compose import statements + JSX body
  const imports = `
import React from 'react';

function Header1({ title }) {
  return <header style={{ background: '#4f46e5', color: 'white', padding: '1rem' }}><h1>{title}</h1></header>;
}
function Header2({ title }) {
  return <header style={{ background: '#222', color: 'white', padding: '1rem' }}><h2>{title}</h2></header>;
}
function Hero({ subtitle }) {
  return <section style={{ padding: '2rem', background: '#eee' }}><p>{subtitle}</p></section>;
}
function Footer1() {
  return <footer style={{ padding: '1rem', background: '#333', color: 'white' }}>© 2025 Your Company</footer>;
}

export default function Theme() {
  return (
    <>
      ${components.map((c) => compToJSX[c]).join('\n      ')}
    </>
  );
}
  `;

  return imports;
}

// Utility: Generate full static HTML snapshot
function generateStaticHTML(containerId = 'root') {
  const container = document.getElementById(containerId);
  if (!container) return null;
  // Get full HTML content inside root container
  return container.innerHTML;
}

// Utility: Extract CSS from document (simple way: get all stylesheets content)
function generateCSS() {
  let cssText = '';
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        cssText += rule.cssText + '\n';
      }
    } catch (e) {
      // ignore CORS restricted sheets
    }
  }
  return cssText;
}

export default function ExportButton({ themeComponents, content, mode }) {
  async function handleExport() {
    const zip = new JSZip();

    // 1. Generate static HTML snapshot of #root (or your editor container)
    const html = generateStaticHTML('root') || '<!-- No HTML content found -->';

    // 2. Generate CSS snapshot
    const css = generateCSS();

    // 3. Generate JSX source string from theme config
    const jsxSource = generateJSXString(themeComponents, content);

    // Add files to zip
    zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Exported Theme</title>
<style>
${css}
</style>
</head>
<body>
<div id="root">
${html}
</div>
</body>
</html>`);

    zip.file('styles.css', css);
    zip.file('Theme.jsx', jsxSource);

    // Generate zip and trigger download
    const contentBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(contentBlob, 'exported-theme.zip');
  }

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '0.6rem 1.2rem',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: '1rem',
      }}
    >
      Export Theme
    </button>
  );
}
