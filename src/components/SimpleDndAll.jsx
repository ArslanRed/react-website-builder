// SimpleDND.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import PropTypes from "prop-types";
import { getRendererForType } from "../components/Registry"; // your adapter registry

const HANDLE_SIZE = 10;
const MIN_WIDTH = 50;
const MIN_HEIGHT = 30;

/* -------------------------
   Recursive renderer for element trees
   - clickable/selectable elements
   - inline editing for text-like elements when selected
------------------------- */
function RenderElements({ elements = [], blockId, selectedTarget, setSelectedTarget, updateElement }) {
  if (!elements || elements.length === 0) return null;

  return elements.map((el) => {
    const Tag = el.tag || "div";
    const isElementSelected =
      selectedTarget?.type === "element" && selectedTarget.blockId === blockId && selectedTarget.elementId === el.id;

    const handleClick = (e) => {
      e.stopPropagation();
      setSelectedTarget({ type: "element", blockId, elementId: el.id });
    };

    return (
      <Tag
        key={el.id}
        onClick={handleClick}
        style={{
          ...el.style,
          overflowWrap: "break-word",
          outline: isElementSelected ? "2px solid #2563eb" : "none",
          boxSizing: "border-box",
        }}
      >
        {["text", "heading", "link"].includes(el.type) && isElementSelected ? (
          <input
            value={el.content}
            onChange={(e) => updateElement(blockId, el.id, e.target.value, null)}
            style={{ font: "inherit", width: "100%", boxSizing: "border-box" }}
          />
        ) : (
          el.content
        )}

        {el.elements && (
          <RenderElements
            elements={el.elements}
            blockId={blockId}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            updateElement={updateElement}
          />
        )}
      </Tag>
    );
  });
}

/* -------------------------
   SimpleDNDBlock
   - either uses an Adapter (from registry) or renders element tree
   - marks selection when block clicked
------------------------- */
function SimpleDNDBlock({
  block,
  selectedTarget,
  setSelectedTarget,
  onAdapterContentChange, // (blockId, patchObject)
  updateElement, // (blockId, elementId, contentOrNull, styleOrNull)
}) {
  const isBlockSelected = selectedTarget?.type === "block" && selectedTarget.blockId === block.id;
  const Adapter = getRendererForType(block.type);

  const handleBlockClick = (e) => {
    e.stopPropagation();
    setSelectedTarget({ type: "block", blockId: block.id, elementId: null });
  };

  return (
    <div
      onClick={handleBlockClick}
      style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        outline: isBlockSelected ? "2px solid #2563eb" : "none",
        ...block.style,
      }}
    >
      {Adapter ? (
        <Adapter
          blockId={block.id}
          content={block.content || {}}
          onContentChange={(id, patch) => {
            // Adapter passes patch object (adapter-specific)
            // We'll forward it to parent via onAdapterContentChange
            onAdapterContentChange?.(id, patch);
          }}
        />
      ) : (
        <RenderElements
          elements={block.elements || []}
          blockId={block.id}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          updateElement={updateElement}
        />
      )}
    </div>
  );
}

/* -------------------------
   Resizable + Draggable block wrapper
   - handles mouse drag for moving
   - handles 8-direction resize handles
   - displays small inline style editor panel (and Delete button)
------------------------- */
function ResizableBlock({
  block,
  moveBlock,
  selected,
  onClick,
  onDelete,
  selectedElementId,
  setSelectedElementId,
  selectedTarget,
  setSelectedTarget,
  updateElement, // (blockId, elementId, contentOrNull, styleOrNull)
  updateComponentChildren, // (blockId, updatedElements)
}) {
  const ref = useRef(null);
  const [resizing, setResizing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [startRect, setStartRect] = useState(null);
  const [rect, setRect] = useState({
    left: block.position?.left ?? 0,
    top: block.position?.top ?? 0,
    width: block.width ?? 150,
    height: block.height ?? 40,
  });

  // keep refs for event listeners
  const refs = useRef({ resizing, dragging, startPos, startRect, rect, blockId: block.id, moveBlock });
  useEffect(() => {
    refs.current = { resizing, dragging, startPos, startRect, rect, blockId: block.id, moveBlock };
  }, [resizing, dragging, startPos, startRect, rect, block.id, moveBlock]);

  // sync with external changes when not interacting
  useEffect(() => {
    if (!dragging && !resizing) {
      setRect({
        left: block.position?.left ?? rect.left,
        top: block.position?.top ?? rect.top,
        width: block.width ?? rect.width,
        height: block.height ?? rect.height,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.position?.left, block.position?.top, block.width, block.height]);

  useEffect(() => {
    document.body.style.userSelect = dragging || resizing ? "none" : "";
    document.body.style.touchAction = dragging || resizing ? "none" : "";
    return () => {
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    };
  }, [dragging, resizing]);

  useEffect(() => {
    function onMouseMove(e) {
      if (refs.current.resizing) {
        e.preventDefault();
        const deltaX = e.clientX - refs.current.startPos.x;
        const deltaY = e.clientY - refs.current.startPos.y;

        let newLeft = refs.current.startRect.left;
        let newTop = refs.current.startRect.top;
        let newWidth = refs.current.startRect.width;
        let newHeight = refs.current.startRect.height;

        if (refs.current.resizing.includes("e")) newWidth = Math.max(MIN_WIDTH, refs.current.startRect.width + deltaX);
        if (refs.current.resizing.includes("s")) newHeight = Math.max(MIN_HEIGHT, refs.current.startRect.height + deltaY);
        if (refs.current.resizing.includes("w")) {
          newWidth = Math.max(MIN_WIDTH, refs.current.startRect.width - deltaX);
          newLeft = refs.current.startRect.left + (refs.current.startRect.width - newWidth);
        }
        if (refs.current.resizing.includes("n")) {
          newHeight = Math.max(MIN_HEIGHT, refs.current.startRect.height - deltaY);
          newTop = refs.current.startRect.top + (refs.current.startRect.height - newHeight);
        }

        setRect({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
      } else if (refs.current.dragging) {
        e.preventDefault();
        const deltaX = e.clientX - refs.current.startPos.x;
        const deltaY = e.clientY - refs.current.startPos.y;
        setRect((prev) => ({ ...prev, left: refs.current.startRect.left + deltaX, top: refs.current.startRect.top + deltaY }));
      }
    }

    function onMouseUp() {
      if (refs.current.resizing || refs.current.dragging) {
        refs.current.moveBlock(refs.current.blockId, {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
        setResizing(null);
        setDragging(false);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseUp);
    };
  }, [rect]);

  const onHandleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    if (selectedElementId) return; // don't resize while editing element
    setResizing(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  const onDragMouseDown = (e) => {
    if (resizing || selectedElementId) return;
    e.stopPropagation();
    e.preventDefault();
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
    setSelectedElementId(null);
    setSelectedTarget({ type: "block", blockId: block.id, elementId: null });
  };

  // helpers to update block-level content/style
  const updateBlockStyle = (patch) => {
    updateElement(block.id, null, null, patch);
  };
  const updateBlockContent = (value) => {
    updateElement(block.id, null, value, null);
  };

  const currentStyle = block.style || {};

  // small inline editor visible when block selected and not editing element
  const isSelected = selected && !selectedElementId;
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  useEffect(() => setShowInlineEditor(isSelected), [isSelected]);

  const cursors = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
    sw: "nesw-resize",
  };

  const parsePx = (v) => {
    if (!v && v !== 0) return "";
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.endsWith("px")) return parseInt(v, 10);
    if (typeof v === "string") return parseInt(v, 10) || "";
    return "";
  };

  return (
    <div
      ref={ref}
      onMouseDown={onDragMouseDown}
      onClick={handleClick}
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        boxSizing: "border-box",
        border: selected && !selectedElementId ? "2px solid #4f46e5" : "none",
        backgroundColor: "transparent",
        userSelect: resizing || dragging ? "none" : "auto",
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
        overflow: "hidden",
      }}
    >
      <SimpleDNDBlock
        block={{ ...block, position: { left: 0, top: 0 }, width: rect.width, height: rect.height }}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        onAdapterContentChange={(blockId, patch) => {
          // adapters send patch object; we'll assign to block.content (adapter-specific contract)
          updateElement(blockId, null, patch, null);
        }}
        updateElement={updateElement}
        updateComponentChildren={updateComponentChildren}
      />

      {/* Delete button */}
      <div style={{ position: "absolute", top: 6, right: 6, zIndex: 40 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          title="Delete block"
          style={{
            border: "none",
            background: "rgba(255,255,255,0.95)",
            padding: "2px 6px",
            borderRadius: 4,
            cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          ✕
        </button>
      </div>

      {/* resize handles (only when not editing an inner element) */}
      {!selectedElementId &&
        [
          { dir: "ne", style: { top: 0, right: 0 } },
          { dir: "nw", style: { top: 0, left: 0 } },
          { dir: "se", style: { bottom: 0, right: 0 } },
          { dir: "sw", style: { bottom: 0, left: 0 } },
          { dir: "n", style: { top: 0, left: "50%", transform: "translateX(-50%)" } },
          { dir: "s", style: { bottom: 0, left: "50%", transform: "translateX(-50%)" } },
          { dir: "e", style: { right: 0, top: "50%", transform: "translateY(-50%)" } },
          { dir: "w", style: { left: 0, top: "50%", transform: "translateY(-50%)" } },
        ].map(({ dir, style: hs }) => (
          <div
            key={dir}
            onMouseDown={(e) => onHandleMouseDown(e, dir)}
            style={{
              position: "absolute",
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              backgroundColor: "rgba(0,0,0,0.25)",
              cursor: cursors[dir],
              ...hs,
              zIndex: 30,
              borderRadius: 2,
            }}
          />
        ))}

      {/* inline style editor */}
      {showInlineEditor && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: 8,
            top: rect.height + 8 > 360 ? -260 : rect.height + 8,
            width: 260,
            zIndex: 60,
            background: "#fff",
            border: "1px solid #e5e7eb",
            padding: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            borderRadius: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <strong style={{ fontSize: 13 }}>Style</strong>
            <button onClick={() => setShowInlineEditor(false)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
              ✕
            </button>
          </div>

          {typeof block.content === "string" && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Text</label>
              <textarea
                value={block.content}
                onChange={(e) => updateBlockContent(e.target.value)}
                rows={2}
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          )}

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12 }}>Background</label>
            <input
              type="color"
              value={currentStyle.backgroundColor || "#ffffff"}
              onChange={(e) => updateBlockStyle({ ...currentStyle, backgroundColor: e.target.value })}
              style={{ width: "100%", height: 30, border: "none", padding: 0 }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12 }}>Text color</label>
            <input type="color" value={currentStyle.color || "#000000"} onChange={(e) => updateBlockStyle({ ...currentStyle, color: e.target.value })} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <label style={{ display: "block", fontSize: 12 }}>Font size (px)</label>
            <input type="number" value={parsePx(currentStyle.fontSize) || 16} onChange={(e) => updateBlockStyle({ ...currentStyle, fontSize: `${e.target.value}px` })} style={{ width: "100%" }} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              style={{ flex: 1, background: "#fff", border: "1px solid #eee", cursor: "pointer" }}
            >
              Delete
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInlineEditor(false);
              }}
              style={{ flex: 1, background: "#4f46e5", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   BlocksRenderer: map blocks -> ResizableBlock
------------------------- */
function BlocksRenderer({
  blocks,
  moveBlock,
  selectedIds,
  onBlockClick,
  onDeleteBlock,
  selectedElementId,
  setSelectedElementId,
  selectedTarget,
  setSelectedTarget,
  updateElement,
  updateComponentChildren,
}) {
  return (
    <>
      {blocks.map((b) => (
        <ResizableBlock
          key={b.id}
          block={b}
          moveBlock={moveBlock}
          selected={selectedIds.has(b.id)}
          onClick={(e) => onBlockClick(e, b.id)}
          onDelete={() => onDeleteBlock(b.id)}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          updateElement={updateElement}
          updateComponentChildren={updateComponentChildren}
        />
      ))}
    </>
  );
}

/* -------------------------
   Right-hand StyleEditor (mirrors your previous editor)
   - Edits selected block or selected element
   - Calls back into updateElement functions
------------------------- */
function findElementById(elements = [], id) {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.elements) {
      const found = findElementById(el.elements, id);
      if (found) return found;
    }
  }
  return null;
}

function StyleEditorSidebar({ selectedTarget, blocks, onUpdateBlockContent, onUpdateElement, updateBlockStyle, onDeleteElement }) {
  const [styleValues, setStyleValues] = useState({});
  const [contentValue, setContentValue] = useState("");

  useEffect(() => {
    if (!selectedTarget?.blockId) {
      setStyleValues({});
      setContentValue("");
      return;
    }
    const blk = blocks.find((b) => b.id === selectedTarget.blockId);
    if (!blk) return;
    if (selectedTarget.type === "block") {
      setStyleValues(blk.style || {});
      setContentValue(typeof blk.content === "string" ? blk.content : "");
    } else if (selectedTarget.type === "element") {
      const el = findElementById(blk.elements || [], selectedTarget.elementId);
      if (!el) return;
      setStyleValues(el.style || {});
      setContentValue(el.content || "");
    }
  }, [selectedTarget, blocks]);

  const handleStyleChange = (key, value) => {
    setStyleValues((p) => ({ ...p, [key]: value }));
    if (!selectedTarget?.blockId) return;
    if (selectedTarget.type === "block") {
      updateBlockStyle(selectedTarget.blockId, { ...(styleValues || {}), [key]: value });
    } else {
      onUpdateElement(selectedTarget.blockId, selectedTarget.elementId, null, { ...(styleValues || {}), [key]: value });
    }
  };

  const handleContentChange = (v) => {
    setContentValue(v);
    if (!selectedTarget?.blockId) return;
    if (selectedTarget.type === "block") {
      onUpdateBlockContent(selectedTarget.blockId, v);
    } else {
      onUpdateElement(selectedTarget.blockId, selectedTarget.elementId, v, null);
    }
  };

  if (!selectedTarget?.blockId) {
    return (
      <div style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Style Editor</h3>
        <p style={{ color: "#666" }}>Select a block or element to edit styles.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Style Editor</h3>

      {(selectedTarget.type === "element" || typeof contentValue === "string") && (
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 12 }}>Text / Content</label>
          <textarea value={contentValue} onChange={(e) => handleContentChange(e.target.value)} rows={3} style={{ width: "100%" }} />
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>Background</label>
        <input type="color" value={styleValues.backgroundColor || "#ffffff"} onChange={(e) => handleStyleChange("backgroundColor", e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>Text Color</label>
        <input type="color" value={styleValues.color || "#000000"} onChange={(e) => handleStyleChange("color", e.target.value)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>Font Size (px)</label>
        <input type="number" value={parseInt(styleValues.fontSize || 16)} onChange={(e) => handleStyleChange("fontSize", `${e.target.value}px`)} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>Padding</label>
        <input type="text" value={styleValues.padding || ""} onChange={(e) => handleStyleChange("padding", e.target.value)} placeholder="e.g. 10px" />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: "block", fontSize: 12 }}>Border</label>
        <input type="text" value={styleValues.border || ""} onChange={(e) => handleStyleChange("border", e.target.value)} placeholder="e.g. 1px solid #000" />
      </div>

      {selectedTarget.type === "element" && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => onDeleteElement(selectedTarget.blockId, selectedTarget.elementId)}
            style={{ background: "#fff", border: "1px solid #eee", padding: "6px 10px", cursor: "pointer" }}
          >
            Delete element
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   Main SimpleDND component
   Props:
    - initialBlocks: array
    - onUpdateBlocks(newBlocks)
    - selectedBlockIds, setSelectedBlockIds
------------------------- */
export default function SimpleDND({ initialBlocks = [], onUpdateBlocks, selectedBlockIds, setSelectedBlockIds }) {
  const containerRef = useRef(null);
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState({ type: null, blockId: null, elementId: null });
  const [history, setHistory] = useState([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // sync with prop changes
  useEffect(() => {
    setBlocks(initialBlocks);
    setHistory([initialBlocks]);
    setHistoryIndex(0);
  }, [initialBlocks]);

  const pushHistory = useCallback(
    (newBlocks) => {
      setHistory((h) => {
        const next = h.slice(0, historyIndex + 1);
        next.push(newBlocks);
        return next;
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex]
  );

  const updateBlocks = useCallback(
    (newBlocks) => {
      setBlocks(newBlocks);
      pushHistory(newBlocks);
      if (onUpdateBlocks) onUpdateBlocks(newBlocks);
    },
    [onUpdateBlocks, pushHistory]
  );

  const moveBlock = useCallback(
    (id, newPos) => {
      const updated = blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              position: { left: newPos.left ?? b.position.left, top: newPos.top ?? b.position.top },
              width: newPos.width ?? b.width,
              height: newPos.height ?? b.height,
            }
          : b
      );
      updateBlocks(updated);
    },
    [blocks, updateBlocks]
  );

  // (blockId, elementId, newContentOrNull, newStyleOrNull)
  const updateElement = useCallback(
    (blockId, elementId, newContentOrNull, newStyleOrNull) => {
      const updateChildren = (elements) =>
        elements.map((el) => {
          if (el.id === elementId) {
            return {
              ...el,
              content: newContentOrNull !== null && newContentOrNull !== undefined ? newContentOrNull : el.content,
              style: newStyleOrNull ? { ...el.style, ...newStyleOrNull } : el.style,
            };
          }
          if (el.elements) return { ...el, elements: updateChildren(el.elements) };
          return el;
        });

      const newBlocks = blocks.map((b) => {
        if (b.id !== blockId) return b;

        // elementId falsy => update block-level content/style
        if (!elementId) {
          // if newContentOrNull is an object (adapter patch) and block.content is object, merge
          const contentToSet = newContentOrNull !== null && newContentOrNull !== undefined ? newContentOrNull : b.content;
          return {
            ...b,
            content: contentToSet,
            style: newStyleOrNull ? { ...b.style, ...newStyleOrNull } : b.style,
          };
        }

        if (b.elements) {
          return { ...b, elements: updateChildren(b.elements) };
        }
        return b;
      });

      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  // replace entire children array (useful for adapters)
  const updateComponentChildren = useCallback(
    (blockId, updatedElements) => {
      const newBlocks = blocks.map((b) => (b.id === blockId ? { ...b, elements: updatedElements } : b));
      updateBlocks(newBlocks);
    },
    [blocks, updateBlocks]
  );

  const deleteSelectedBlocks = useCallback(() => {
    if (!selectedBlockIds || selectedBlockIds.size === 0) return;
    const filtered = blocks.filter((b) => !selectedBlockIds.has(b.id));
    updateBlocks(filtered);
    setSelectedBlockIds(new Set());
    setSelectedElementId(null);
    setSelectedTarget({ type: null, blockId: null, elementId: null });
  }, [blocks, selectedBlockIds, setSelectedBlockIds, updateBlocks]);

  // delete single block
  const onDeleteBlock = useCallback(
    (id) => {
      const next = blocks.filter((b) => b.id !== id);
      updateBlocks(next);
      setSelectedBlockIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    },
    [blocks, updateBlocks, setSelectedBlockIds]
  );

  // delete nested element
  const deleteElement = useCallback(
    (blockId, elementId) => {
      const removeFrom = (elements) =>
        elements.filter((el) => {
          if (el.id === elementId) return false;
          if (el.elements) el.elements = removeFrom(el.elements);
          return true;
        });

      const newBlocks = blocks.map((b) => (b.id === blockId ? { ...b, elements: removeFrom(b.elements || []) } : b));
      updateBlocks(newBlocks);
      setSelectedTarget({ type: null, blockId: null, elementId: null });
    },
    [blocks, updateBlocks]
  );

  // Undo / Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prev = history[prevIndex];
      setBlocks(prev);
      setHistoryIndex(prevIndex);
      if (onUpdateBlocks) onUpdateBlocks(prev);
      setSelectedBlockIds(new Set());
      setSelectedElementId(null);
      setSelectedTarget({ type: null, blockId: null, elementId: null });
    }
  }, [history, historyIndex, onUpdateBlocks, setSelectedBlockIds]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const next = history[nextIndex];
      setBlocks(next);
      setHistoryIndex(nextIndex);
      if (onUpdateBlocks) onUpdateBlocks(next);
      setSelectedBlockIds(new Set());
      setSelectedElementId(null);
      setSelectedTarget({ type: null, blockId: null, elementId: null });
    }
  }, [history, historyIndex, onUpdateBlocks, setSelectedBlockIds]);

  // react-dnd drop
  const [, drop] = useDrop({
    accept: "NEW_BLOCK",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const left = clientOffset.x - containerRect.left + containerRef.current.scrollLeft;
      const top = clientOffset.y - containerRect.top + containerRef.current.scrollTop;

      const newBlock = {
        id: `block_${item.id}_${Date.now()}`,
        type: item.id,
        position: { left, top },
        width: item.width ?? 300,
        height: item.height ?? 100,
        content: item.defaultContent ?? "Edit me",
        elements: item.defaultElements || [],
      };

      updateBlocks([...blocks, newBlock]);
    },
  });

  const setRefs = (node) => {
    containerRef.current = node;
    drop(node);
  };

  // keyboard handlers
  useEffect(() => {
    const handler = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockIds && selectedBlockIds.size > 0) {
        e.preventDefault();
        deleteSelectedBlocks();
      } else if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (meta && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedBlockIds, deleteSelectedBlocks, undo, redo]);

  // canvas click clears selection
  const handleCanvasClick = () => {
    setSelectedBlockIds(new Set());
    setSelectedElementId(null);
    setSelectedTarget({ type: null, blockId: null, elementId: null });
  };

  // block click handler used by ResizableBlock
  const onBlockClick = (e, id) => {
    e.stopPropagation();
    const isMulti = e.ctrlKey || e.metaKey;
    setSelectedTarget({ type: "block", blockId: id, elementId: null });
    setSelectedBlockIds((prev) => {
      const next = new Set(prev);
      if (isMulti) {
        next.has(id) ? next.delete(id) : next.add(id);
      } else {
        next.clear();
        next.add(id);
      }
      return next;
    });
    setSelectedElementId(null);
  };

  // small Undo/Redo UI (top-left)
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <>
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 2000 }}>
        <button onClick={undo} disabled={!canUndo} style={{ marginRight: 6 }}>
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo}>
          Redo
        </button>
      </div>

      <div style={{ display: "flex", height: "100%" }}>
        <div
          ref={setRefs}
          style={{ position: "relative", flexGrow: 1, backgroundColor: "#f3f4f6", overflow: "auto", userSelect: "none" }}
          onClick={handleCanvasClick}
        >
          <BlocksRenderer
            blocks={blocks}
            moveBlock={moveBlock}
            selectedIds={selectedBlockIds}
            onBlockClick={onBlockClick}
            onDeleteBlock={onDeleteBlock}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            updateElement={updateElement}
            updateComponentChildren={updateComponentChildren}
          />
        </div>

        {/* right-side style editor */}
        <div style={{ width: 320, borderLeft: "1px solid #eee", background: "#fff" }}>
          <StyleEditorSidebar
            selectedTarget={selectedTarget}
            blocks={blocks}
            onUpdateBlockContent={(blockId, value) => updateElement(blockId, null, value, null)}
            onUpdateElement={updateElement}
            updateBlockStyle={(blockId, patch) => updateElement(blockId, null, null, patch)}
            onDeleteElement={deleteElement}
          />
        </div>
      </div>
    </>
  );
}

SimpleDND.propTypes = {
  initialBlocks: PropTypes.array,
  onUpdateBlocks: PropTypes.func,
  selectedBlockIds: PropTypes.instanceOf(Set),
  setSelectedBlockIds: PropTypes.func,
};
