import React, { useState, useEffect } from "react";
import {defaultPropsMap} from '../components/componentMap'
export default function StyleEditor({ selectedTarget, blocks, updateBlocks }) {
  const [styleValues, setStyleValues] = useState({});
  const [isItemStyle, setIsItemStyle] = useState(false);

  // Helper function to get the selected block
  function getSelectedBlock() {
    if (!selectedTarget?.blockId) return null;
    return blocks.find((b) => b.id === selectedTarget.blockId);
  }

  // Helper function to get element styles
  function getElementStyles(block, elementId) {
    if (!block || !elementId) return {};
    
    if (block.elements && block.elements[elementId]) {
      return block.elements[elementId];
    }
    
    return {};
  }
const styleableItems = Object.values(defaultPropsMap).flatMap(block => {
  return Object.entries(block.elements || {})
    .filter(([_, elConfig]) => elConfig.textStyle !== undefined) // items with textStyle
    .map(([elementId, _]) => elementId.toLowerCase());
});
  // Define which elements are styleable items (not containers)
  function isStyleableItem(elementId) {
    if (!elementId) return false;
    
    // Define styleable text/content elements (case-insensitive)
    // Generate styleable items dynamically from defaultPropsMap


    
    const lowerElementId = elementId.toLowerCase();
    
    // Check for exact matches
    if (styleableItems.includes(lowerElementId)) {
      return true;
    }
    
    // Check if it starts with styleable patterns (more flexible)
    const styleablePrefixes = ['navitem', 'item'];
    for (const prefix of styleablePrefixes) {
      if (lowerElementId.startsWith(prefix)) {
        return true;
      }
    }
    
    return false;
  }

  // Define container elements that should NOT be styleable
  function isContainerElement(elementId) {
    if (!elementId) return false;
    
    const containerElements = [
      'header', 'footer', 'nav', 'navlist', 'ctalist', 'logo', 'aside', 
      'section', 'card', 'list', 'childrenwrapper', 'about1', 'image',
      'backgroundimage'
    ];
    
    const lowerElementId = elementId.toLowerCase();
    return containerElements.includes(lowerElementId);
  }

  // Update element styles in the block
  function updateElementInBlock(block, elementId, key, value) {
    if (!block.elements) {
      block.elements = {};
    }
    
    if (!block.elements[elementId]) {
      block.elements[elementId] = { style: {}, textStyle: {} };
    }
    
    // Always use textStyle for item elements since they're all text/content
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

  // Load styles when selectedTarget changes
  useEffect(() => {
    const block = getSelectedBlock();
    if (!block) {
      setStyleValues({});
      setIsItemStyle(false);
      return;
    }

    console.log('🔍 Debug - Selected Target:', selectedTarget);

    if (selectedTarget.type === "block") {
      // Styling the main block
      setStyleValues(block.style || {});
      setIsItemStyle(false);
      console.log('🔍 Debug - Styling BLOCK, loaded styles:', block.style);
    } else if (selectedTarget.type === "element" && selectedTarget.elementId) {
      // Check if this is a styleable item or a container
      const isContainer = isContainerElement(selectedTarget.elementId);
      const isItem = isStyleableItem(selectedTarget.elementId);
      
      console.log('🔍 Debug - Element ID:', selectedTarget.elementId);
      console.log('🔍 Debug - Is Container:', isContainer);
      console.log('🔍 Debug - Is Styleable Item:', isItem);
      
      if (isContainer) {
        // If it's a container, don't allow styling - show message
        setStyleValues({});
        setIsItemStyle(false);
        return;
      } else if (isItem) {
        // If it's a styleable item, load its textStyle
        const elementStyles = getElementStyles(block, selectedTarget.elementId);
        setStyleValues(elementStyles.textStyle || {});
        setIsItemStyle(true);
        console.log('🔍 Debug - Loaded ITEM styles:', elementStyles.textStyle);
      } else {
        // Unknown element type - don't allow styling
        setStyleValues({});
        setIsItemStyle(false);
      }
    }
  }, [selectedTarget, blocks]);

  const handleStyleChange = (key, value) => {
    console.log('🎨 Style Change:', key, '=', value, 'isItemStyle:', isItemStyle);
    
    setStyleValues((prev) => ({ ...prev, [key]: value }));

    const block = getSelectedBlock();
    if (!block) return;

    updateBlocks(
      blocks.map((currentBlock) => {
        if (currentBlock.id !== selectedTarget.blockId) return currentBlock;

        if (selectedTarget.type === "block") {
          // Update main block style
          console.log('📦 Updating BLOCK style');
          return {
            ...currentBlock,
            style: { ...(currentBlock.style || {}), [key]: value }
          };
        } else if (selectedTarget.type === "element" && selectedTarget.elementId) {
          // Update item style (always use textStyle for items)
          console.log('🔤 Updating ITEM style');
          return updateElementInBlock(currentBlock, selectedTarget.elementId, key, value);
        }
        
        return currentBlock;
      })
    );
  };

  // Don't render if no target is selected
  if (!selectedTarget?.blockId) {
    return (
      <div className="style-editor">
        <h3 className="style-editor-header">No Element Selected</h3>
        <p>Select a block or element to edit its styles.</p>
      </div>
    );
  }

  // Check if trying to style a container element
  if (selectedTarget.type === "element" && selectedTarget.elementId) {
    const isContainer = isContainerElement(selectedTarget.elementId);
    const isItem = isStyleableItem(selectedTarget.elementId);
    
    if (isContainer) {
      return (
        <div className="style-editor">
          <h3 className="style-editor-header">❌ Container Not Styleable</h3>
          <p><strong>{selectedTarget.elementId}</strong> is a structural container.</p>
          <p>You can only style:</p>
          <ul>
            <li><strong>Block</strong> - entire component</li>
            <li><strong>Items</strong> - text/content elements (title, nav items, etc.)</li>
          </ul>
        </div>
      );
    }
    
    if (!isItem) {
      return (
        <div className="style-editor">
          <h3 className="style-editor-header">❓ Unknown Element</h3>
          <p><strong>{selectedTarget.elementId}</strong> is not recognized as a styleable element.</p>
        </div>
      );
    }
  }

  const fontSizeValue = parseInt(styleValues.fontSize || "16px", 10);
  const headerText = selectedTarget?.type === "block" 
    ? "🏗️ Block Styles" 
    : "📝 Item Styles";

  return (
    <div className="style-editor">
      <h3 className="style-editor-header">{headerText}</h3>
      
      {selectedTarget.elementId && (
        <p className="selected-element">
          Editing: <strong>{selectedTarget.elementId}</strong> 📝 (Item)
        </p>
      )}

      {/* COLORS - work for both block and items */}
      <h4>🎨 Colors</h4>
      <StyleInput 
        label="🎨 Background Color" 
        type="color" 
        value={styleValues.backgroundColor || "#ffffff"} 
        onChange={(val) => handleStyleChange("backgroundColor", val)} 
      />
      
      <StyleInput 
        label="🖍️ Text Color" 
        type="color" 
        value={styleValues.color || "#000000"} 
        onChange={(val) => handleStyleChange("color", val)} 
      />

      {/* TEXT PROPERTIES - only for items */}
      {isItemStyle && (
        <>
          <h4>📝 Text Properties</h4>
          <StyleInput 
            label="📏 Font Size" 
            type="number" 
            value={fontSizeValue} 
            onChange={(val) => handleStyleChange("fontSize", `${val}px`)} 
          />
          
          <StyleInput 
            label="🔤 Font Family" 
            type="text" 
            value={styleValues.fontFamily || ""} 
            placeholder="e.g., Arial, sans-serif"
            onChange={(val) => handleStyleChange("fontFamily", val)} 
          />
          
          <div className="text-style-options">
            <StyleCheckbox 
              label="🔹 Bold" 
              checked={styleValues.fontWeight === "bold"} 
              onChange={(checked) => handleStyleChange("fontWeight", checked ? "bold" : "normal")} 
            />
            <StyleCheckbox 
              label="🔹 Italic" 
              checked={styleValues.fontStyle === "italic"} 
              onChange={(checked) => handleStyleChange("fontStyle", checked ? "italic" : "normal")} 
            />
          </div>

          <StyleInput 
            label="📐 Text Align" 
            type="select"
            value={styleValues.textAlign || ""} 
            options={["", "left", "center", "right", "justify"]}
            onChange={(val) => handleStyleChange("textAlign", val)} 
          />
        </>
      )}

      {/* LAYOUT PROPERTIES - only for blocks */}
      {selectedTarget.type === "block" && (
        <>
          <h4>📦 Layout Properties</h4>
          <StyleInput 
            label="📏 Width" 
            type="text" 
            value={styleValues.width || ""} 
            placeholder="e.g., 100%, 200px"
            onChange={(val) => handleStyleChange("width", val)} 
          />
          
          <StyleInput 
            label="📏 Height" 
            type="text" 
            value={styleValues.height || ""} 
            placeholder="e.g., 100px, auto"
            onChange={(val) => handleStyleChange("height", val)} 
          />
        </>
      )}

      {/* SPACING PROPERTIES - for both block and items */}
      <h4>📏 Spacing</h4>
      <StyleInput 
        label="📦 Padding" 
        type="text" 
        value={styleValues.padding || ""} 
        placeholder="e.g., 10px, 10px 20px"
        onChange={(val) => handleStyleChange("padding", val)} 
      />
      
      <StyleInput 
        label="📦 Margin" 
        type="text" 
        value={styleValues.margin || ""} 
        placeholder="e.g., 10px, 10px 20px"
        onChange={(val) => handleStyleChange("margin", val)} 
      />

      {/* TEST BUTTONS */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#e8f4f8' }}>
        <h4>🧪 Quick Tests</h4>
        <button onClick={() => handleStyleChange("color", "red")} style={{ margin: '2px' }}>
          Red Text
        </button>
        <button onClick={() => handleStyleChange("fontSize", "24px")} style={{ margin: '2px' }}>
          Big Font
        </button>
        <button onClick={() => handleStyleChange("fontWeight", "bold")} style={{ margin: '2px' }}>
          Bold
        </button>
        <button onClick={() => handleStyleChange("backgroundColor", "yellow")} style={{ margin: '2px' }}>
          Yellow BG
        </button>
      </div>
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