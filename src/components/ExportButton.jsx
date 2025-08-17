import React from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { componentMap } from "./componentMap";

/**
 * Helpers
 */
const toPascal = (str = "") =>
  String(str)
    .replace(/(^\w|-\w|_\w)/g, (m) => m.replace(/[-_]/, "").toUpperCase());

/** Deep clone + drop functions/undefined/symbols to keep JSON-safe props */
const sanitizeForJSON = (val, seen = new WeakSet()) => {
  if (val === null) return null;
  const t = typeof val;
  if (t === "function" || t === "undefined" || t === "symbol") return undefined;
  if (t !== "object") return val;
  if (seen.has(val)) return undefined; // avoid cycles
  seen.add(val);

  if (Array.isArray(val)) {
    const arr = val
      .map((v) => sanitizeForJSON(v, seen))
      .filter((v) => v !== undefined);
    return arr;
  }

  const out = {};
  for (const [k, v] of Object.entries(val)) {
    const s = sanitizeForJSON(v, seen);
    if (s !== undefined) out[k] = s;
  }
  return out;
};

/** Merge editor layout into props.style (absolute positioning + size) */
const mergeLayoutIntoProps = (item) => {
  const base = item?.props || {};
  const style = {
    ...(base.style || {}),
    position: "absolute",
    left: item?.position?.x ?? 0,
    top: item?.position?.y ?? 0,
    width: item?.size?.width ?? "auto",
    height: item?.size?.height ?? "auto",
  };
  return { ...base, style };
};

/** Pretty variable name for each block's props */
const propsVarName = (type, idx) =>
  `${toPascal(type)}Props_${String(idx + 1).padStart(2, "0")}`;

/** Safe JSON → JS literal string (for embedding in code) */
const toJSLiteral = (obj) => JSON.stringify(obj, null, 2);

/** Optional: create a minimal stub if source is missing so the export builds */
const makeStubSource = (pascalName) => `// Auto-generated stub: original source was not provided.
export default function ${pascalName}(props){
  if (typeof window !== 'undefined' && window.console) {
    console.warn("[Exported Stub] \`${pascalName}\` source missing. Rendering an empty container.", props);
  }
  return null; // or return <div style={{position:'absolute', ...props?.style}} />;
}
`;

/** Escape text content for safe JSX */
const escapeJSXText = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Convert saved elements (used by EditableText) into plain JSX — supports nesting */
/** Convert saved elements (used by EditableText) into plain JSX — supports nesting */

/** Convert saved elements (used by EditableText) into plain JSX — supports nesting */
const renderPlainChildren = (elements = {}) => {
  if (!elements || typeof elements !== "object") return "";

  // React void/self-closing tags
  const VOID_TAGS = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  return Object.entries(elements)
    .map(([key, el]) => {
      if (!el || typeof el !== "object") return "";

      const tag = el.tag || "div";

      // Collect attributes (preserve standard props beyond style)
      const { textStyle, children, text, ...rest } = el;

      // Build style string
      const styleString =
        textStyle && Object.keys(textStyle).length
          ? ` style={${JSON.stringify(textStyle)}}`
          : "";

      // Build other attributes (href, src, alt, id, className, target, etc.)
      const attrString = Object.entries(rest)
        .filter(([k, v]) => v !== undefined && v !== null && k !== "tag")
        .map(([k, v]) => {
          if (typeof v === "string") {
            return ` ${k}="${v.replace(/"/g, "&quot;")}"`;
          }
          if (typeof v === "boolean") {
            return v ? ` ${k}` : "";
          }
          return ` ${k}={${JSON.stringify(v)}}`;
        })
        .join("");

      // If void tag → self-closing
      if (VOID_TAGS.has(tag.toLowerCase())) {
        return `<${tag}${styleString}${attrString} />`;
      }

      // Children: recurse if nested, otherwise escape text
      const inner =
        children && Object.keys(children).length > 0
          ? renderPlainChildren(children)
          : escapeJSXText(text || "");

      return `<${tag}${styleString}${attrString}>${inner}</${tag}>`;
    })
    .join("\n");
};



/**
 * Component
 */
export default function ExportButton({
  mode,
  themeComponents,
  content,
  gridItems,
}) {
  /**
   * 1) Export selected theme
   */
  const handleExport = async () => {
    const zip = new JSZip();

    if (mode === "themeSelected" && themeComponents.length === 0) {
      alert("No theme selected to export.");
      return;
    } else if (themeComponents.length > 0) {
      themeComponents.forEach((compId) => {
        const Comp = componentMap[compId];
        const pascal = toPascal(compId);
        if (Comp?.__sourceCode) {
          zip.file(`${pascal}.jsx`, Comp.__sourceCode);
          if (Comp.__files && typeof Comp.__files === "object") {
            for (const [rel, content] of Object.entries(Comp.__files)) {
              zip.file(rel, content);
            }
          }
        }
      });
    } else {
      alert("No components to export.");
      return;
    }

    zip.file("content.json", JSON.stringify(content ?? {}, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "theme-export.zip");
  };

  /**
   * 2) Hybrid export
   */
  const handleHybridExport = async () => {
    if (!Array.isArray(gridItems) || gridItems.length === 0) {
      alert("No components to export.");
      return;
    }

    const zip = new JSZip();

    const usedTypes = Array.from(new Set(gridItems.map((i) => i.type)));
    usedTypes.forEach((compId) => {
      const Comp = componentMap[compId];
      const pascal = toPascal(compId);
      if (Comp?.__sourceCode) {
        zip.file(`${pascal}.jsx`, Comp.__sourceCode);
        if (Comp.__files) {
          for (const [rel, content] of Object.entries(Comp.__files)) {
            zip.file(rel, content);
          }
        }
      } else {
        zip.file(`${pascal}.jsx`, makeStubSource(pascal));
      }
    });

    const imports = usedTypes
      .map((t) => `import ${toPascal(t)} from "./${toPascal(t)}.jsx";`)
      .join("\n");

    const body = gridItems
      .map((item) => `      <${toPascal(item.type)} />`)
      .join("\n");

    const custom = `/* Auto-generated hybrid theme */
${imports}

export default function CustomTheme() {
  return (
    <div>
${body}
    </div>
  );
}
`;
    zip.file("CustomTheme.jsx", custom);

    const readme = `# Exported Hybrid Theme

- CustomTheme.jsx renders the modular components.
- Each component file is included if available; missing sources are stubbed.
- No editor logic is included.
`;
    zip.file("README.md", readme);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "hybrid-theme-export.zip");
  };

  /**
   * 3) Component-preserving export with EditableText stripped
   */
  const handleExportCustomTheme = async () => {
    if (!Array.isArray(gridItems) || gridItems.length === 0) {
      alert("No components to export.");
      return;
    }

    const zip = new JSZip();

    const usedTypes = Array.from(new Set(gridItems.map((i) => i.type)));
    const missing = [];

    usedTypes.forEach((compId) => {
      const Comp = componentMap[compId];
      const pascal = toPascal(compId);

      if (Comp?.__sourceCode) {
        zip.file(`${pascal}.jsx`, Comp.__sourceCode);

        if (Comp.__files && typeof Comp.__files === "object") {
          for (const [rel, content] of Object.entries(Comp.__files)) {
            zip.file(rel, content);
          }
        }
      } else {
        zip.file(`${pascal}.jsx`, makeStubSource(pascal));
        missing.push(pascal);
      }
    });

    const importLines = usedTypes
      .map((t) => `import ${toPascal(t)} from "./${toPascal(t)}.jsx";`)
      .join("\n");

    let propsSection = "";
    let renderSection = "";

    gridItems.forEach((item, idx) => {
      const pascal = toPascal(item.type);

      const mergedProps = mergeLayoutIntoProps(item);
      const safeProps = sanitizeForJSON(mergedProps);

      const varName = propsVarName(item.type, idx);
      propsSection += `const ${varName} = ${toJSLiteral(safeProps)};\n\n`;

      const plainChildren = renderPlainChildren(safeProps.elements);
      renderSection += `      <${pascal} {...${varName}}>\n${plainChildren}\n      </${pascal}>\n`;
    });

    const appCode = `/* Auto-generated by ExportButton: Custom Theme Export
   - Preserves component names (Header1, Hero, Footer1, ...)
   - Preserves user-edited props & element-level styles
   - Preserves layout (absolute top/left/width/height)
   - EditableText stripped → plain JSX tags
*/
${importLines}

${propsSection}export default function App() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
${renderSection.trimEnd()}
    </div>
  );
}
`;
    zip.file("App.jsx", appCode);

    const layoutSnapshot = gridItems.map((item) => ({
      id: item.id,
      type: item.type,
      position: item.position,
      size: item.size,
      props: sanitizeForJSON(item.props || {}),
    }));
    zip.file("layout.json", JSON.stringify(layoutSnapshot, null, 2));

    const readme = `# Exported Custom Theme

This zip contains:
- **App.jsx** — imports your components and renders them with user-edited props.
- **layout.json** — a snapshot of gridItems for rehydration/migrations.
- **<Component>.jsx** — the original component source (if provided), otherwise a stub.
- **Any extra files** declared under \`__files\`.

## How EditableText is handled
- In the editor: components use <EditableText>.
- In the export: these are replaced with plain HTML tags (<h1>, <p>, <a>, etc.).
- No dependency on EditableText remains.

${
  missing.length
    ? `## Missing component sources
The following components did not provide \`__sourceCode\`:

- ${missing.join("\n- ")}

Stubs were generated so the export still builds.
`
    : ""
}
`;
    zip.file("README.md", readme);

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "custom-theme.zip");
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
        title="Export ready-to-build custom theme preserving components + layout + edits"
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
        title="Export live snapshot + original components + CustomTheme.jsx"
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
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
        .isRequired,
      size: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number })
        .isRequired,
      props: PropTypes.object,
    })
  ).isRequired,
};

ExportButton.defaultProps = {
  content: { heading: "", paragraph: "" },
};
