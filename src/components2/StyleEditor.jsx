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

    // Force title to always use textStyle
    if (selectedTarget.elementId === "title") {
      setStyleValues(element.textStyle || {});
      setIsTextStyle(true);
    } else {
      setStyleValues(isTextStyle ? element.textStyle || {} : element.style || {});
    }
  }
}, [selectedTarget, blocks, isTextStyle]);


  const handleStyleChange = (key, value, textStyle = false) => {
  setStyleValues((prev) => ({ ...prev, [key]: value }));

  updateBlocks(
    blocks.map((block) => {
      if (block.id !== selectedTarget.blockId) return block;

      if (selectedTarget.type === "block") {
        const nextStyle = textStyle
          ? { ...block.style, textStyle: { ...(block.style?.textStyle || {}), [key]: value } }
          : { ...block.style, [key]: value };
        return { ...block, style: nextStyle };
      } else if (selectedTarget.type === "element") {
        // Force CTA container to always use style (not textStyle)
        if (selectedTarget.elementId === "cta") textStyle = false;

        return {
          ...block,
          elements: updateElementStyle(block.elements || [], selectedTarget.elementId, key, value, textStyle),
        };
      }
      return block;
    })
  );
};


  const fontSizeValue = parseInt(styleValues.fontSize || "16px", 10);

  return (
    <div style={{ padding: 12, overflowY: "auto" }}>
      {selectedTarget.type === "element" && (
        <div style={{ marginBottom: 10 }}>
          <label>
            <input type="checkbox" checked={isTextStyle} onChange={(e) => setIsTextStyle(e.target.checked)} /> Edit text style
          </label>
        </div>
      )}

      <div>
        <label>Background:</label>
        <input type="color" value={styleValues.backgroundColor || "#ffffff"} onChange={(e) => handleStyleChange("backgroundColor", e.target.value, !isTextStyle ? false : false)} />
      </div>

      <div>
        <label>Text Color:</label>
        <input type="color" value={styleValues.color || "#000000"} onChange={(e) => handleStyleChange("color", e.target.value, isTextStyle)} />
      </div>

      <div>
        <label>Font Size:</label>
        <input type="number" value={fontSizeValue} onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`, isTextStyle)} style={{ width: "100%" }} />
      </div>

      <div>
        <label>Font Family:</label>
        <input type="text" value={styleValues.fontFamily || ""} onChange={(e) => handleStyleChange("fontFamily", e.target.value, isTextStyle)} style={{ width: "100%" }} />
      </div>

      <div>
        <label>Bold:</label>
        <input type="checkbox" checked={styleValues.fontWeight === "bold"} onChange={(e) => handleStyleChange("fontWeight", e.target.checked ? "bold" : "normal", isTextStyle)} />
      </div>

      <div>
        <label>Italic:</label>
        <input type="checkbox" checked={styleValues.fontStyle === "italic"} onChange={(e) => handleStyleChange("fontStyle", e.target.checked ? "italic" : "normal", isTextStyle)} />
      </div>

      {!isTextStyle && (
        <>
          <div>
            <label>Border:</label>
            <input type="text" value={styleValues.border || ""} onChange={(e) => handleStyleChange("border", e.target.value, false)} style={{ width: "100%" }} />
          </div>

          <div>
            <label>Border Radius:</label>
            <input type="text" value={styleValues.borderRadius || ""} onChange={(e) => handleStyleChange("borderRadius", e.target.value, false)} style={{ width: "100%" }} />
          </div>

          <div>
            <label>Margin:</label>
            <input type="text" value={styleValues.margin || ""} onChange={(e) => handleStyleChange("margin", e.target.value, false)} style={{ width: "100%" }} />
          </div>

          <div>
            <label>Padding:</label>
            <input type="text" value={styleValues.padding || ""} onChange={(e) => handleStyleChange("padding", e.target.value, false)} style={{ width: "100%" }} />
          </div>
        </>
      )}
    </div>
  );
}
