import React, { useState, useEffect } from "react";
import { defaultPropsMap } from '../components/componentMap';

export default function StyleEditor({ selectedTarget, blocks, updateBlocks }) {
  const [styleValues, setStyleValues] = useState({});
  const [isItemStyle, setIsItemStyle] = useState(false);

  function getSelectedBlock() {
    if (!selectedTarget?.blockId) return null;
    return blocks.find((b) => b.id === selectedTarget.blockId);
  }

  function getElementStyles(block, elementId) {
    if (!block || !elementId) return {};
    if (block.elements && block.elements[elementId]) {
      return block.elements[elementId];
    }
    return {};
  }

  const styleableItems = Object.values(defaultPropsMap).flatMap(block => {
    return Object.entries(block.elements || {})
      .filter(([_, elConfig]) => elConfig.textStyle !== undefined)
      .map(([elementId, _]) => elementId.toLowerCase());
  });

  function isStyleableItem(elementId) {
    if (!elementId) return false;
    const lowerElementId = elementId.toLowerCase();
    if (styleableItems.includes(lowerElementId)) return true;
    const styleablePrefixes = ['navitem', 'item'];
    return styleablePrefixes.some(prefix => lowerElementId.startsWith(prefix));
  }

  function updateElementInBlock(block, elementId, key, value) {
    if (!block.elements) block.elements = {};
    if (!block.elements[elementId]) block.elements[elementId] = { style: {}, textStyle: {} };
    return {
      ...block,
      elements: {
        ...block.elements,
        [elementId]: {
          ...block.elements[elementId],
          textStyle: {
            ...(block.elements[elementId].textStyle || {}),
            [key]: value
          }
        }
      }
    };
  }

  useEffect(() => {
    const block = getSelectedBlock();
    if (!block) {
      setStyleValues({});
      setIsItemStyle(false);
      return;
    }

    if (selectedTarget.type === "block") {
      setStyleValues(block.style || {});
      setIsItemStyle(false);
    } else if (selectedTarget.type === "element" && selectedTarget.elementId) {
      const isItem = isStyleableItem(selectedTarget.elementId);
      const elementStyles = getElementStyles(block, selectedTarget.elementId);
      setStyleValues(elementStyles.textStyle || {});
      setIsItemStyle(isItem);
    }
  }, [selectedTarget, blocks]);

  const handleStyleChange = (key, value) => {
    setStyleValues(prev => ({ ...prev, [key]: value }));
    const block = getSelectedBlock();
    if (!block) return;

    updateBlocks(
      blocks.map(currentBlock => {
        if (currentBlock.id !== selectedTarget.blockId) return currentBlock;
        if (selectedTarget.type === "block") {
          return { ...currentBlock, style: { ...(currentBlock.style || {}), [key]: value } };
        } else if (selectedTarget.type === "element" && selectedTarget.elementId) {
          return updateElementInBlock(currentBlock, selectedTarget.elementId, key, value);
        }
        return currentBlock;
      })
    );
  };

  if (!selectedTarget?.blockId) {
    return (
      <div className="style-editor">
        <h3 className="style-editor-header">No Element Selected</h3>
        <p>Select a block or element to edit its styles.</p>
      </div>
    );
  }

  const fontSizeValue = parseInt(styleValues.fontSize || "16px", 10);
  const headerText = selectedTarget?.type === "block" ? "Block Styles" : "Item Styles";

  return (
    <div className="style-editor">
      <h3 className="style-editor-header">{headerText}</h3>
      {selectedTarget.elementId && (
        <p className="selected-element">
          Editing: <strong>{selectedTarget.elementId}</strong>
        </p>
      )}

      {/* Colors */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <StyleInput
          label="Bg Color"
          type="color"
          value={styleValues.backgroundColor || "#ffffff"}
          onChange={(val) => handleStyleChange("backgroundColor", val)}
        />
        <StyleInput
          label="Text Color"
          type="color"
          value={styleValues.color || "#000000"}
          onChange={(val) => handleStyleChange("color", val)}
        />
      </div>

      {/* Text properties */}
      {isItemStyle && (
        <>
          <StyleInput
            label="Font Size"
            type="number"
            value={fontSizeValue}
            onChange={(val) => handleStyleChange("fontSize", `${val}px`)}
          />
          <StyleInput
            label="Font Family"
            type="text"
            value={styleValues.fontFamily || ""}
            placeholder="e.g., Arial, sans-serif"
            onChange={(val) => handleStyleChange("fontFamily", val)}
          />
          <div className="text-style-options">
            <StyleCheckbox
              label="Bold"
              checked={styleValues.fontWeight === "bold"}
              onChange={(checked) => handleStyleChange("fontWeight", checked ? "bold" : "normal")}
            />
            <StyleCheckbox
              label="Italic"
              checked={styleValues.fontStyle === "italic"}
              onChange={(checked) => handleStyleChange("fontStyle", checked ? "italic" : "normal")}
            />
          </div>
          <StyleInput
            label="Text Align"
            type="select"
            value={styleValues.textAlign || ""}
            options={["", "left", "center", "right", "justify"]}
            onChange={(val) => handleStyleChange("textAlign", val)}
          />
        </>
      )}

      <StyleInput
        label="Padding"
        type="text"
        value={styleValues.padding || ""}
        placeholder="e.g., 10px, 10px 20px"
        onChange={(val) => handleStyleChange("padding", val)}
      />
      <StyleInput
        label="Margin"
        type="text"
        value={styleValues.margin || ""}
        placeholder="e.g., 10px, 10px 20px"
        onChange={(val) => handleStyleChange("margin", val)}
      />
      <StyleInput
        label="Border Radius"
        type="text"
        value={styleValues.borderRadius || ""}
        placeholder="e.g., 5px, 50%"
        onChange={(val) => handleStyleChange("borderRadius", val)}
      />
      <StyleInput
        label="Box Shadow"
        type="text"
        value={styleValues.boxShadow || ""}
        placeholder="e.g., 0px 4px 6px rgba(0,0,0,0.1)"
        onChange={(val) => handleStyleChange("boxShadow", val)}
      />
    </div>
  );
}

function StyleInput({ label, type, value, onChange, options, placeholder }) {
  if (type === "select") {
    return (
      <div className="style-input">
        <label>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option || "Default"}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className="style-input">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(type === "number" ? parseInt(e.target.value, 10) : e.target.value)}
      />
    </div>
  );
}

function StyleCheckbox({ label, checked, onChange }) {
  return (
    <label className="style-checkbox">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
