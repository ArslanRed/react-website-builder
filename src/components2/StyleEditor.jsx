import React, { useState, useEffect } from "react";

export default function StyleEditor({ selectedTarget, blocks, updateBlocks }) {
  const [styleValues, setStyleValues] = useState({});

  // Recursive helpers
  function findElementById(elements, id) {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.elements) {
        const found = findElementById(el.elements, id);
        if (found) return found;
      }
    }
    return null;
  }

  function updateElementStyle(elements, id, key, value) {
    return elements.map((el) => {
      if (el.id === id) return { ...el, style: { ...el.style, [key]: value } };
      if (el.elements) return { ...el, elements: updateElementStyle(el.elements, id, key, value) };
      return el;
    });
  }

  // Load styles for selected target
  useEffect(() => {
    if (!selectedTarget?.blockId) return;

    const block = blocks.find((b) => b.id === selectedTarget.blockId);
    if (!block) return;

    if (selectedTarget.type === "block") {
      setStyleValues(block.style || {});
    } else if (selectedTarget.type === "element") {
      const element = findElementById(block.elements || [], selectedTarget.elementId);
      if (!element) return;
      setStyleValues(element.style || {});
    }
  }, [selectedTarget, blocks]);

  // Handle style changes
  const handleStyleChange = (key, value) => {
    setStyleValues((prev) => ({ ...prev, [key]: value }));

    updateBlocks(
      blocks.map((block) => {
        if (block.id !== selectedTarget.blockId) return block;

        if (selectedTarget.type === "block") {
          return { ...block, style: { ...block.style, [key]: value } };
        } else if (selectedTarget.type === "element") {
          return {
            ...block,
            elements: updateElementStyle(block.elements || [], selectedTarget.elementId, key, value),
          };
        }
        return block;
      })
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 250,
        height: "100vh",
        background: "#f7f7f7",
        borderLeft: "1px solid #ccc",
        padding: 12,
        overflowY: "auto",
        zIndex: 9999,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Style Editor</h3>

      {/* Background Color */}
      <div>
        <label>Background Color:</label>
        <input
          type="color"
          value={styleValues.backgroundColor || "#ffffff"}
          onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
        />
      </div>

      {/* Text Color */}
      <div>
        <label>Text Color:</label>
        <input
          type="color"
          value={styleValues.color || "#000000"}
          onChange={(e) => handleStyleChange("color", e.target.value)}
        />
      </div>

      {/* Font Size */}
      <div>
        <label>Font Size:</label>
        <input
          type="number"
          value={parseInt(styleValues.fontSize || 16)}
          onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Font Family */}
      <div>
        <label>Font Family:</label>
        <input
          type="text"
          value={styleValues.fontFamily || ""}
          onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* Bold */}
      <div>
        <label>Bold:</label>
        <input
          type="checkbox"
          checked={styleValues.fontWeight === "bold"}
          onChange={(e) => handleStyleChange("fontWeight", e.target.checked ? "bold" : "normal")}
        />
      </div>

      {/* Italic */}
      <div>
        <label>Italic:</label>
        <input
          type="checkbox"
          checked={styleValues.fontStyle === "italic"}
          onChange={(e) => handleStyleChange("fontStyle", e.target.checked ? "italic" : "normal")}
        />
      </div>

      {/* Border */}
      <div>
        <label>Border:</label>
        <input
          type="text"
          value={styleValues.border || ""}
          onChange={(e) => handleStyleChange("border", e.target.value)}
          placeholder="1px solid #000"
          style={{ width: "100%" }}
        />
      </div>

      {/* Border Radius */}
      <div>
        <label>Border Radius:</label>
        <input
          type="text"
          value={styleValues.borderRadius || ""}
          onChange={(e) => handleStyleChange("borderRadius", e.target.value)}
          placeholder="4px"
          style={{ width: "100%" }}
        />
      </div>

      {/* Margin */}
      <div>
        <label>Margin:</label>
        <input
          type="text"
          value={styleValues.margin || ""}
          onChange={(e) => handleStyleChange("margin", e.target.value)}
          placeholder="e.g. 10px"
          style={{ width: "100%" }}
        />
      </div>

      {/* Padding */}
      <div>
        <label>Padding:</label>
        <input
          type="text"
          value={styleValues.padding || ""}
          onChange={(e) => handleStyleChange("padding", e.target.value)}
          placeholder="e.g. 10px"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
