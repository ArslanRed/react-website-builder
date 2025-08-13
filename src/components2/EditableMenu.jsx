import React, { useState, useEffect, useRef } from "react";

export default function EditableMenu({
  block,
  parentBlock = null,
  onChange,
  onNestedChange,
  onClose,
}) {
  if (!block) return null;

  const editableFields = block.editableFields || [];

  const [content, setContent] = useState(block.content || "");
  const contentUndoStack = useRef([]);
  const contentRedoStack = useRef([]);

  const [style, setStyle] = useState(block.style || {});
  const styleUndoStack = useRef([]);
  const styleRedoStack = useRef([]);

  useEffect(() => {
    setContent(block.content || "");
    contentUndoStack.current = [];
    contentRedoStack.current = [];

    setStyle(block.style || {});
    styleUndoStack.current = [];
    styleRedoStack.current = [];
  }, [block.content, block.style]);

  const pushContentUndo = (val) => {
    contentUndoStack.current.push(val);
    if (contentUndoStack.current.length > 50) contentUndoStack.current.shift();
  };

  const pushStyleUndo = (val) => {
    styleUndoStack.current.push(val);
    if (styleUndoStack.current.length > 50) styleUndoStack.current.shift();
  };

const triggerChange = (updatedBlock) => {
  if (!parentBlock) {
    // Outer block editing
    onChange((prevBlocks) =>
      prevBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
  } else {
    // Nested block editing
    const updatedParent = {
      ...parentBlock,
      elements: parentBlock.elements.map((el) =>
        el.id === updatedBlock.id ? updatedBlock : el
      ),
    };
    onNestedChange?.(updatedParent) || onChange(updatedParent);
  }
};

  const handleContentUndo = () => {
    if (contentUndoStack.current.length === 0) return;
    const prev = contentUndoStack.current.pop();
    contentRedoStack.current.push(content);
    setContent(prev);
    triggerChange({ ...block, content: prev, style });
  };

  const handleContentRedo = () => {
    if (contentRedoStack.current.length === 0) return;
    const next = contentRedoStack.current.pop();
    contentUndoStack.current.push(content);
    setContent(next);
    triggerChange({ ...block, content: next, style });
  };

  const handleStyleChange = (field, value) => {
    pushStyleUndo(style);
    const newStyle = { ...style, [field]: value };
    setStyle(newStyle);
    triggerChange({ ...block, content, style: newStyle });
  };

  // ✅ NEW: handle content changes live for outer + nested
  const handleContentChange = (e) => {
    const val = e.target.value;
    pushContentUndo(content);
    setContent(val);
    triggerChange({ ...block, content: val, style });
  };

  const handleStyleUndo = () => {
    if (styleUndoStack.current.length === 0) return;
    const prev = styleUndoStack.current.pop();
    styleRedoStack.current.push(style);
    setStyle(prev);
    triggerChange({ ...block, content, style: prev });
  };

  const handleStyleRedo = () => {
    if (styleRedoStack.current.length === 0) return;
    const next = styleRedoStack.current.pop();
    styleUndoStack.current.push(style);
    setStyle(next);
    triggerChange({ ...block, content, style: next });
  };

  const getStyleValue = (key) => {
    const val = style[key] || "";
    if (/^#[0-9A-F]{3}$/i.test(val)) {
      return "#" + val.slice(1).split("").map((ch) => ch + ch).join("");
    }
    return val;
  };

  const handleKeyDown = (e) => {
    if (e.target.tagName === "TEXTAREA" && editableFields.includes("content")) {
      if (e.key === "Backspace") {
        e.preventDefault();
        handleContentUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleContentUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleContentRedo();
      }
    }

    if (e.target.tagName === "INPUT" && e.target.type !== "color") {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleStyleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleStyleRedo();
      }
    }
  };

  const [editingNestedId, setEditingNestedId] = useState(null);
  const editingNestedBlock = block.elements?.find((el) => el.id === editingNestedId);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: 40,
        right: 10,
        backgroundColor: "#fff",
        border: "1px solid #e0e0e0",
        padding: "20px 24px",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
        zIndex: 1000,
        width: 320,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
        userSelect: "text",
        transition: "transform 0.2s ease, opacity 0.2s ease",
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          cursor: "pointer",
          fontSize: 18,
          border: "none",
          background: "none",
        }}
        aria-label="Close editor"
      >
        ✕
      </button>

      <h4
        style={{
          marginTop: 0,
          marginBottom: 12,
          fontWeight: "600",
          color: "#333",
        }}
      >
        Edit Block ({block.type})
      </h4>

      {editableFields.includes("content") && (
        <>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              fontWeight: "600",
              color: "#555",
            }}
            htmlFor="content-editor"
          >
            Content
          </label>
          <textarea
            id="content-editor"
            rows={5}
            style={{
              width: "100%",
              padding: 8,
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              resize: "vertical",
              fontFamily: "inherit",
              color: "#222",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
          />
          <small style={{ color: "#777" }}>
            Use Backspace or Ctrl+Z to undo typing.
          </small>
        </>
      )}

      {editableFields
        .filter((f) => f.startsWith("style."))
        .map((styleField) => {
          const styleKey = styleField.split(".")[1];
          const val = getStyleValue(styleKey);

          if (styleKey.includes("color")) {
            return (
              <div key={styleField} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: "600", color: "#555", display: "block" }}>
                  {styleKey}
                </label>
                <input
                  type="color"
                  value={val || "#000000"}
                  onChange={(e) => handleStyleChange(styleKey, e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            );
          }

          if (
            styleKey.includes("fontSize") ||
            styleKey.includes("padding") ||
            styleKey.includes("margin")
          ) {
            return (
              <div key={styleField} style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: "600", color: "#555", display: "block" }}>
                  {styleKey}
                </label>
                <input
                  type="text"
                  value={val || ""}
                  placeholder="e.g. 16px or 1rem"
                  onChange={(e) => handleStyleChange(styleKey, e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: "100%",
                    padding: "4px 6px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            );
          }

          return (
            <div key={styleField} style={{ marginBottom: 8 }}>
              <label style={{ fontWeight: "600", color: "#555", display: "block" }}>
                {styleKey}
              </label>
              <input
                type="text"
                value={val || ""}
                onChange={(e) => handleStyleChange(styleKey, e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontFamily: "inherit",
                }}
              />
            </div>
          );
        })}

      {block.type === "container" && block.elements && block.elements.length > 0 && (
        <>
          <h5 style={{ marginTop: 20, marginBottom: 6 }}>Nested Elements</h5>
          <ul
            style={{
              listStyle: "none",
              paddingLeft: 0,
              maxHeight: 200,
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
          >
            {block.elements.map((el) => (
              <li key={el.id} style={{ margin: 6 }}>
                <button
                  style={{
                    cursor: "pointer",
                    padding: "4px 8px",
                    width: "100%",
                    textAlign: "left",
                    borderRadius: 4,
                    border:
                      editingNestedId === el.id
                        ? "2px solid #007acc"
                        : "1px solid #ccc",
                    backgroundColor:
                      editingNestedId === el.id ? "#e6f0fa" : "#fff",
                  }}
                  onClick={() =>
                    setEditingNestedId(editingNestedId === el.id ? null : el.id)
                  }
                >
                  {el.type} {el.tag ? `(<${el.tag}>)` : ""} — {el.id}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {editingNestedBlock && (
        <EditableMenu
          block={editingNestedBlock}
          parentBlock={block}
          onChange={triggerChange}
          onNestedChange={onNestedChange}
          onClose={() => setEditingNestedId(null)}
        />
      )}

      <button
        style={{
          marginTop: 16,
          padding: "10px 18px",
          backgroundColor: "#007acc",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          width: "100%",
        }}
        onClick={() => {
          triggerChange({ ...block, content, style });
          onClose();
        }}
      >
        Save
      </button>
    </div>
  );
}
