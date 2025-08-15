import React from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { componentMap } from "./ComponentMap"; // must have __sourceCode and __css

// Helper to capitalize component names
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ExportButton({ mode, themeComponents, content, gridItems }) {
  // ----- Existing Theme Export -----
  const handleExport = async () => {
    const zip = new JSZip();

    if (mode === "themeSelected" && themeComponents.length === 0) {
      alert("No theme selected to export.");
      return;
    } else if (themeComponents.length > 0) {
      themeComponents.forEach((compId) => {
        const Comp = componentMap[compId];
        if (Comp && Comp.__sourceCode && Comp.__css) {
          zip.file(`${compId}.jsx`, Comp.__sourceCode);
          zip.file(`${compId}.css`, Comp.__css);
        }
      });
    } else {
      alert("No components to export.");
      return;
    }

    zip.file("content.json", JSON.stringify(content, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "theme-export.zip");
  };

  // ----- Hybrid Export (existing) -----
  const handleHybridExport = async () => {
    if (!gridItems || gridItems.length === 0) {
      alert("No components to export.");
      return;
    }

    const zip = new JSZip();
    // Collect unique components
    const usedComponents = Array.from(new Set(gridItems.map((item) => item.type)));

    // Add component files
    usedComponents.forEach((compId) => {
      const Comp = componentMap[compId];
      if (Comp && Comp.__sourceCode && Comp.__css) {
        zip.file(`${compId}.jsx`, Comp.__sourceCode);
        zip.file(`${compId}.css`, Comp.__css);
      }
    });

    // Generate CustomTheme.jsx
    const importsStr = usedComponents.map((c) => `import ${capitalize(c)} from "./${c}.jsx";`).join("\n");
    const renderStr = gridItems
      .map((item) => `  <${capitalize(item.type)} />`)
      .join("\n");

    const customThemeCode = `
${importsStr}

export default function CustomTheme() {
  return (
    <div>
${renderStr}
    </div>
  );
}
`;
    zip.file("CustomTheme.jsx", customThemeCode);

    // Optional README
    const readme = `# Exported Hybrid Theme

- CustomTheme.jsx: modular component layout
- Component .jsx & .css files: ready to use
`;
    zip.file("README.md", readme);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "hybrid-theme-export.zip");
  };

  // ----- New dedicated Custom Theme Export -----
  const handleExportCustomTheme = async () => {
    if (!gridItems || gridItems.length === 0) {
      alert("No components to export.");
      return;
    }

    const zip = new JSZip();

    // Collect unique components
    const usedComponents = Array.from(new Set(gridItems.map((item) => item.type)));

    // Add component files
    usedComponents.forEach((compId) => {
      const Comp = componentMap[compId];
      if (Comp && Comp.__sourceCode && Comp.__css) {
        zip.file(`${compId}.jsx`, Comp.__sourceCode);
        zip.file(`${compId}.css`, Comp.__css);
      }
    });

    // Generate App.jsx with all props and sizes
    const importsStr = usedComponents
      .map((comp) => `import ${capitalize(comp)} from "./${comp}.jsx";`)
      .join("\n");

    const renderStr = gridItems
      .map((item) => {
        const combinedProps = { ...item.props };
        if (item.size) {
          combinedProps.style = {
            ...(combinedProps.style || {}),
            width: `${item.size.width}px`,
            height: `${item.size.height}px`,
          };
        }

        const propsStr = Object.entries(combinedProps)
          .map(([key, value]) =>
            typeof value === "object" ? `${key}={${JSON.stringify(value)}}` : `${key}=${JSON.stringify(value)}`
          )
          .join(" ");

        return `  <${capitalize(item.type)} ${propsStr} />`;
      })
      .join("\n");

    const appCode = `
${importsStr}

export default function App() {
  return (
    <div>
${renderStr}
    </div>
  );
}
`;

    zip.file("App.jsx", appCode);

    // Optional README
    const readme = `# Exported Custom Theme

- App.jsx: main entry with your components in correct order & sizes
- Component .jsx & .css files: ready to use
- All inline styles reflect the user-customized layout
`;
    zip.file("README.md", readme);

    // Generate ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "custom-theme.zip");
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={handleExport}
        style={{
          backgroundColor: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
        title="Export selected theme or components"
      >
        Export Theme
      </button>

      <button
        onClick={handleExportCustomTheme}
        style={{
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
        title="Export ready-to-build custom theme"
      >
        Export Live Changes
      </button>

      <button
        onClick={handleHybridExport}
        style={{
          backgroundColor: "#db7e00",
          color: "white",
          border: "none",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          cursor: "pointer",
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
  gridItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      props: PropTypes.object,
      size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
    })
  ).isRequired,
};

ExportButton.defaultProps = {
  content: {
    heading: "",
    paragraph: "",
  },
};
