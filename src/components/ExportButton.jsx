import React from 'react';
import PropTypes from 'prop-types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import EcommerceCode from '../components/AllThemes/Ecommerce.jsx?raw';
import EcommerceCSS from '../components/AllThemes/Ecommerce.css?raw';

import Header1Code from '../components/Header1.jsx?raw';
import Header2Code from '../components/Header2.jsx?raw';

import Header1CSS from '../styles/Header1.module.css?raw';
import Header2CSS from '../styles/Header2.module.css?raw';

const componentSources = {
  header1: { code: Header1Code, css: Header1CSS },
  header2: { code: Header2Code, css: Header2CSS },
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ExportButton({ mode, themeComponents, content }) {
  const handleExport = async () => {
    const zip = new JSZip();

    if (mode === 'themeSelected' && themeComponents.length === 0) {
      zip.file('Ecommerce.jsx', EcommerceCode);
      zip.file('Ecommerce.css', EcommerceCSS);
    } else if (themeComponents.length > 0) {
      themeComponents.forEach((compId) => {
        if (componentSources[compId]) {
          const { code, css } = componentSources[compId];
          zip.file(`${compId}.jsx`, code);
          if (css) zip.file(`${compId}.css`, css);
        }
      });
    } else {
      alert('No components to export.');
      return;
    }

    zip.file('content.json', JSON.stringify(content, null, 2));
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'theme-export.zip');
  };

  // Helper function to extract CSS from document (handles media queries, ignores CORS errors)
  const extractCssForContainer = (container) => {
    let css = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.STYLE_RULE) {
            const selectors = rule.selectorText.split(',');
            if (selectors.some((sel) => {
              try {
                return container.querySelector(sel.trim()) !== null;
              } catch {
                return false;
              }
            })) {
              css += rule.cssText + '\n';
            }
          } else if (rule.type === CSSRule.MEDIA_RULE) {
            let mediaCss = '';
            for (const innerRule of rule.cssRules) {
              if (innerRule.type === CSSRule.STYLE_RULE) {
                const selectors = innerRule.selectorText.split(',');
                if (selectors.some((sel) => {
                  try {
                    return container.querySelector(sel.trim()) !== null;
                  } catch {
                    return false;
                  }
                })) {
                  mediaCss += innerRule.cssText + '\n';
                }
              }
            }
            if (mediaCss) {
              css += `@media ${rule.conditionText} {\n${mediaCss}}\n`;
            }
          }
        }
      } catch (e) {
        // Ignore CORS error stylesheets
      }
    }
    return css;
  };

  const handleLiveExport = async () => {
    const editor = document.querySelector('.theme-container');
    if (!editor) {
      alert('No theme content found to export!');
      return;
    }

    let html = editor.innerHTML.trim();
    let jsx = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const styleObj = styles
          .split(';')
          .filter(Boolean)
          .map((rule) => {
            let [prop, value] = rule.split(':');
            if (!prop || !value) return '';
            prop = prop.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            value = value.trim();
            return `${prop}: "${value}"`;
          })
          .join(', ');
        return `style={{ ${styleObj} }}`;
      });

    const css = extractCssForContainer(editor);

    const zip = new JSZip();
    zip.file('CustomTheme.jsx', `export default function CustomTheme() {\n  return (\n    <>${jsx}</>\n  );\n}`);
    zip.file('CustomTheme.css', css);

    if (themeComponents && themeComponents.length > 0) {
      themeComponents.forEach((compId) => {
        if (componentSources[compId]) {
          const { code, css } = componentSources[compId];
          zip.file(`${compId}.jsx`, code);
          if (css) zip.file(`${compId}.css`, css);
        }
      });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'custom-theme-export.zip');
  };

  // Hybrid export: both live snapshot and modular components
  const handleHybridExport = async () => {
    const editor = document.querySelector('.theme-container');
    if (!editor) {
      alert('No theme content found to export!');
      return;
    }

    let html = editor.innerHTML.trim();
    let liveJsx = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const styleObj = styles
          .split(';')
          .filter(Boolean)
          .map((rule) => {
            let [prop, value] = rule.split(':');
            if (!prop || !value) return '';
            prop = prop.trim().replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            value = value.trim();
            return `${prop}: "${value}"`;
          })
          .join(', ');
        return `style={{ ${styleObj} }}`;
      });

    const css = extractCssForContainer(editor);

    const zip = new JSZip();
    zip.file('LiveSnapshot.jsx', `export default function LiveSnapshot() {\n  return (\n    <>${liveJsx}</>\n  );\n}`);
    zip.file('LiveSnapshot.css', css);

    if (themeComponents && themeComponents.length > 0) {
      themeComponents.forEach((compId) => {
        if (componentSources[compId]) {
          const { code, css } = componentSources[compId];
          zip.file(`${compId}.jsx`, code);
          if (css) zip.file(`${compId}.css`, css);
        }
      });
    }

    const importsStr = themeComponents.map((compId) => `import ${capitalize(compId)} from "./${compId}.jsx";`).join('\n');
    const renderStr = themeComponents.map((compId) => `      <${capitalize(compId)} />`).join('\n');

    const customThemeCode = `${importsStr}

export default function CustomTheme() {
  return (
    <div>
${renderStr}
    </div>
  );
}
`;

    zip.file('CustomTheme.jsx', customThemeCode);

    const readme = `# Exported Theme

- LiveSnapshot.jsx/css: Your exact current customized layout snapshot.
- CustomTheme.jsx: Modular component-based theme you can scale & modify.
- Component source files: Original React components & styles used.

Use LiveSnapshot.jsx for a frozen look or start editing from CustomTheme.jsx and components.
`;

    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'hybrid-theme-export.zip');
  };

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={handleExport}
        style={{
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
        title="Export selected theme or components"
      >
        Export Theme
      </button>

      <button
        onClick={handleLiveExport}
        style={{
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
        title="Export live JSX and CSS snapshot"
      >
        Export Live JSX/CSS
      </button>

      <button
        onClick={handleHybridExport}
        style={{
          backgroundColor: '#db7e00',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
        title="Export live snapshot + original components + modular CustomTheme.jsx"
      >
        Export Hybrid Theme
      </button>
    </div>
  );
}

ExportButton.propTypes = {
  mode: PropTypes.string.isRequired,
  themeComponents: PropTypes.arrayOf(PropTypes.string).isRequired,
  content: PropTypes.shape({
    heading: PropTypes.string,
    paragraph: PropTypes.string,
  }),
};

ExportButton.defaultProps = {
  content: {
    heading: '',
    paragraph: '',
  },
};
