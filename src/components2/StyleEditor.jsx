import React, { useState, useEffect } from "react";

export default function StyleEditor({ selectedTarget, blocks, updateBlocks }) {
  const [styleValues, setStyleValues] = useState({});
  const [isTextStyle, setIsTextStyle] = useState(false);

  function findElementById(elements, id) {
    for (const el of elements) {
      if (el.id === id) return el;
      if (el.elements?.length) {
        const found = findElementById(el.elements, id);
        if (found) return found;
      }
    }
    return null;
  }

  function updateElementStyle(elements, id, key, value, textStyle = false) {
    return elements.map((el) => {
      if (el.id === id) {
        if (textStyle) return { ...el, textStyle: { ...(el.textStyle || {}), [key]: value } };
        return { ...el, style: { ...(el.style || {}), [key]: value } };
      }
      if (el.elements?.length) return { ...el, elements: updateElementStyle(el.elements, id, key, value, textStyle) };
      return el;
    });
  }

  useEffect(() => {
    if (!selectedTarget?.blockId) return;
    const block = blocks.find((b) => b.id === selectedTarget.blockId);
    if (!block) return;

    if (selectedTarget.type === "block") {
      setStyleValues(block.style || {});
      setIsTextStyle(false);
    } else if (selectedTarget.type === "element") {
      const element = findElementById(block.elements || [], selectedTarget.elementId);
      if (!element) return;

      // Automatically detect whether to use textStyle or style
      const useTextStyle = selectedTarget.elementId !== "cta";
      setIsTextStyle(useTextStyle);
      setStyleValues(useTextStyle ? element.textStyle || {} : element.style || {});
    }
  }, [selectedTarget, blocks]);

  const handleStyleChange = (key, value) => {
    setStyleValues((prev) => ({ ...prev, [key]: value }));

    updateBlocks(
      blocks.map((block) => {
        if (block.id !== selectedTarget.blockId) return block;

        if (selectedTarget.type === "block") {
          return { ...block, style: { ...(block.style || {}), [key]: value } };
        } else if (selectedTarget.type === "element") {
          const textStyleFlag = selectedTarget.elementId !== "cta";
          return {
            ...block,
            elements: updateElementStyle(block.elements || [], selectedTarget.elementId, key, value, textStyleFlag),
          };
        }
        return block;
      })
    );
  };

  const fontSizeValue = parseInt(styleValues.fontSize || "16px", 10);
  const headerText =
    selectedTarget?.type === "block"
      ? "Block Styles"
      : isTextStyle
      ? "Text Styles"
      : "Element Styles";

  return (
    <div
      style={{
        padding: 16,
        
        maxHeight: "100%",
        overflowY: "auto",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#b2aab6",
        borderLeft: "1px solid #ddd",
        color: "#333",
      }}
    >
      <h3
        style={{
          marginBottom: 16,
          fontSize: 16,
          fontWeight: 600,
          borderBottom: "1px solid #ddd",
          paddingBottom: 8,
        }}
      >
        {headerText}
      </h3>

      <StyleInput label="Background" type="color" value={styleValues.backgroundColor || "#ffffff"} onChange={(val) => handleStyleChange("backgroundColor", val)} />
      <StyleInput label="Text Color" type="color" value={styleValues.color || "#000000"} onChange={(val) => handleStyleChange("color", val)} />
      <StyleInput label="Font Size" type="number" value={fontSizeValue} onChange={(val) => handleStyleChange("fontSize", `${val}px`)} />
      <StyleInput label="Font Family" type="text" value={styleValues.fontFamily || ""} onChange={(val) => handleStyleChange("fontFamily", val)} />
      <StyleCheckbox label="Bold" checked={styleValues.fontWeight === "bold"} onChange={(checked) => handleStyleChange("fontWeight", checked ? "bold" : "normal")} />
      <StyleCheckbox label="Italic" checked={styleValues.fontStyle === "italic"} onChange={(checked) => handleStyleChange("fontStyle", checked ? "italic" : "normal")} />

      {/* Show these for both block and element */}
      <StyleInput label="Border" type="text" value={styleValues.border || ""} onChange={(val) => handleStyleChange("border", val)} />
      <StyleInput label="Border Radius" type="text" value={styleValues.borderRadius || ""} onChange={(val) => handleStyleChange("borderRadius", val)} />
      <StyleInput label="Margin" type="text" value={styleValues.margin || ""} onChange={(val) => handleStyleChange("margin", val)} />
      <StyleInput label="Padding" type="text" value={styleValues.padding || ""} onChange={(val) => handleStyleChange("padding", val)} />
    </div>
  );
}

// Styled Input component
function StyleInput({ label, type, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
      <label style={{ marginBottom: 4, fontSize: 13, fontWeight: 500, color: "#555" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? parseInt(e.target.value, 10) : e.target.value)}
        style={{
          padding: 8,
          fontSize: 14,
          borderRadius: 6,
          border: "1px solid #ccc",
          background: "#fff",
          outline: "none",
          transition: "border 0.2s",
        }}
        onFocus={(e) => (e.target.style.border = "1px solid #1976d2")}
        onBlur={(e) => (e.target.style.border = "1px solid #ccc")}
      />
    </div>
  );
}

// Styled Checkbox component
function StyleCheckbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, cursor: "pointer", color: "#555" }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
