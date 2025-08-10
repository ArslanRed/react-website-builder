import React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Import your component sources as raw strings
import EcommerceCode from "../components/AllThemes/Ecommerce.jsx?raw";
import EcommerceCSS from "../components/AllThemes/Ecommerce.css?raw";

import Header1Code from "../components/Header1.jsx?raw";
import Header2Code from "../components/Header2.jsx?raw";
// import HeroCode from "../components/Hero.jsx?raw";
// import Footer1Code from "../components/Footer1.jsx?raw";

import Header1CSS from "../styles/Header1.module.css?raw";
import Header2CSS from "../styles/Header2.module.css?raw";


// Map component IDs to their source code & CSS
const componentSources = {
  header1: { code: Header1Code, css: Header1CSS },
  header2: { code: Header2Code, css: Header2CSS },
  // hero: { code: HeroCode, css: HeroCSS },
  // footer1: { code: Footer1Code, css: Footer1CSS },
};

export default function ExportButton({ themeComponents, content, mode }) {
  const handleExport = async () => {
    const zip = new JSZip();

    if (mode === "themeSelected" && themeComponents.length === 0) {
      // Case 1: Full prebuilt theme (e.g., Ecommerce)
      zip.file("Ecommerce.jsx", EcommerceCode);
      zip.file("Ecommerce.css", EcommerceCSS);
    } else if (themeComponents.length > 0) {
      // Case 2: Custom-built theme
      themeComponents.forEach((compId) => {
        if (componentSources[compId]) {
          const { code, css } = componentSources[compId];
          zip.file(`${compId}.jsx`, code);
          if (css) {
            zip.file(`${compId}.css`, css);
          }
        }
      });
    } else {
      alert("No components to export.");
      return;
    }

    const contentFile = JSON.stringify(content, null, 2);
    zip.file("content.json", contentFile);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "theme-export.zip");
  };

  return (
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
    >
      Export Theme
    </button>
  );
}
