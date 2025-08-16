import React, { useMemo, useRef, useState, useCallback } from "react";
import { Rnd } from "react-rnd";
import { createRoot } from "react-dom/client";
import { useUserTheme } from "../contexts/UserThemeContext";
import { componentMap, defaultPropsMap } from "./ComponentMap";
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";
import StyleEditor from "../components2/StyleEditor"; // <-- your style editor (unchanged)

const ItemTypes = { COMPONENT: "component" };

// Sidebar item (unchanged)
function SidebarItem({ compId }) {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { compId },
  }));
  return (
    <div
      ref={drag}
      style={{
        padding: "0.5rem",
        marginBottom: "0.5rem",
        border: "1px solid #aaa",
        borderRadius: 4,
        cursor: "grab",
        userSelect: "none",
        background: "#fff",
      }}
    >
      {compId}
    </div>
  );
}

// Helpers to convert between your grid item props.elements (object)
// and StyleEditor’s expected elements array shape.
function elementsObjToArray(elementsObj = {}) {
  // Flatten top-level keys to array items with an id and style
  // (StyleEditor cares about .id and .style; you can extend if needed)
  return Object.entries(elementsObj).map(([id, data]) => ({
    id,
    style: { ...(data?.style || {}) },
    // You can pass through other sub-styles if you later extend StyleEditor
    // e.g. textStyle, listStyle, itemStyle, etc., but StyleEditor currently
    // only reads/writes `.style`.
  }));
}

function elementsArrayToObj(elementsArr = [], prevObj = {}) {
  // Merge back into the original keyed object preserving other sub-styles
  const next = { ...prevObj };
  for (const el of elementsArr) {
    const prev = prevObj?.[el.id] || {};
    next[el.id] = {
      ...prev,
      style: { ...(prev.style || {}), ...(el.style || {}) },
    };
  }
  return next;
}

export default function GridEditor() {
  const { setUserThemeConfig } = useUserTheme();
  const [gridItems, setGridItems] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null); // { blockId, type: 'block'|'element', elementId? }
  const dropRef = useRef(null);

  // fallback sizes (unchanged)
  const getDefaultSize = (type) => {
    const sizeMap = {
      header1: { width: 1000, height: 150 },
      header2: { width: 1000, height: 150 },
      hero: { width: 1000, height: 400 },
      footer1: { width: 1000, height: 100 },
    };
    return sizeMap[type] || { width: 300, height: 100 };
  };

  // measure rendered component size (unchanged)
  const measureComponentSize = (type, props) => {
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.pointerEvents = "none";
    document.body.appendChild(temp);

    const root = createRoot(temp);
    const Comp = componentMap[type];
    root.render(<Comp {...props} />);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const rect = temp.getBoundingClientRect();
        const width = rect.width || getDefaultSize(type).width;
        const height = rect.height || getDefaultSize(type).height;
        root.unmount();
        document.body.removeChild(temp);
        resolve({ width, height });
      });
    });
  };

  const addComponent = async (type, x, y) => {
    const props = { ...(defaultPropsMap[type] || {}) };
    const { width, height } = await measureComponentSize(type, props);

    const newItem = {
      id: uuidv4(),
      type,
      props,
      position: { x, y },
      size: { width, height },
      style: props.style || {}, // keep for convenience
      elements: props.elements || {},
    };

    setGridItems((prev) => [...prev, newItem]);

    setUserThemeConfig((prev) => ({
      ...prev,
      components: [...(prev.components || []), type],
    }));
  };

  // Drop target (unchanged)
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop: (item, monitor) => {
      if (!dropRef.current) return;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const rect = dropRef.current.getBoundingClientRect();
      const x = clientOffset.x - rect.left + dropRef.current.scrollLeft;
      const y = clientOffset.y - rect.top + dropRef.current.scrollTop;

      addComponent(item.compId, x, y);
    },
  }));

  const updatePosition = (id, x, y) => {
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, position: { x, y } } : item
      )
    );
  };

  const updateSize = (id, width, height, position) => {
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, size: { width, height }, position } : item
      )
    );
  };

  // Build a "blocks" VM for StyleEditor from gridItems
  const blocks = useMemo(() => {
    return gridItems.map((gi) => ({
      id: gi.id,
      style: gi.props?.style || {},
      elements: elementsObjToArray(gi.props?.elements || {}),
    }));
  }, [gridItems]);

  // updateBlocks implementation expected by StyleEditor.
  // It receives a full updated blocks array; we sync back into gridItems.
  const updateBlocks = useCallback(
    (nextBlocks) => {
      setGridItems((prev) =>
        prev.map((gi) => {
          const updated = nextBlocks.find((b) => b.id === gi.id);
          if (!updated) return gi;

          const nextStyle = updated.style || {};
          const nextElementsObj = elementsArrayToObj(
            updated.elements || [],
            gi.props?.elements || {}
          );

          const nextProps = {
            ...(gi.props || {}),
            style: nextStyle,
            elements: nextElementsObj,
          };

          return { ...gi, props: nextProps, style: nextStyle, elements: nextElementsObj };
        })
      );
    },
    [setGridItems]
  );

  // Click selection: determine if user clicked a block or an inner element
  const handleCanvasClick = useCallback(
    (e, itemId) => {
      // Find nearest element carrying data-element-id
      const el = e.target.closest("[data-element-id]");
      const elementId = el?.getAttribute("data-element-id");

      if (elementId && elementId !== "header") {
        // Select inner element
        setSelectedTarget({ blockId: itemId, type: "element", elementId });
      } else {
        // Select whole block
        setSelectedTarget({ blockId: itemId, type: "block" });
      }
    },
    [setSelectedTarget]
  );

  return (
    <div className="grid-editor-container" style={{ display: "flex", height: "100%" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          borderRight: "1px solid #ccc",
          padding: "1rem",
          boxSizing: "border-box",
          overflowY: "auto",
          background: "#fafafa",
          flexShrink: 0,
        }}
      >
        <h3>Components</h3>
        {Object.keys(componentMap).map((compId) => (
          <SidebarItem key={compId} compId={compId} />
        ))}
        <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
          Tip: drag a component into the canvas. Click inside a component to
          select the whole block, or click a labeled inner part (logo/nav/cta)
          to edit that element’s styles.
        </p>
      </aside>

      {/* Canvas */}
      <div
        ref={(node) => {
          drop(node);
          dropRef.current = node;
        }}
        style={{
          flexGrow: 1,
          position: "relative",
          overflow: "auto",
          background: "#f9f9f9",
        }}
      >
        {gridItems.map((item) => {
          const Comp = componentMap[item.type];
          if (!Comp) return null;

          const isSelectedBlock = selectedTarget?.blockId === item.id && selectedTarget?.type === "block";
          const isSelectedElement = selectedTarget?.blockId === item.id && selectedTarget?.type === "element";

          return (
            <Rnd
              key={item.id}
              size={item.size}
              position={item.position}
              onDragStop={(e, d) => updatePosition(item.id, d.x, d.y)}
              onResizeStop={(e, dir, ref, delta, position) =>
                updateSize(item.id, ref.offsetWidth, ref.offsetHeight, position)
              }
              bounds="parent"
              minWidth={50}
              minHeight={50}
              style={{
                border: isSelectedBlock || isSelectedElement ? "2px solid #1976d2" : "1px dashed #888",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
              onClick={(e) => handleCanvasClick(e, item.id)}
            >
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                <Comp
                  {...item.props}
                  style={{
                    ...(item.props?.style || {}),
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </Rnd>
          );
        })}
      </div>

      {/* Style Editor Panel (your component, unchanged) */}
      <div
        style={{
          width: 300,
          borderLeft: "1px solid #ccc",
          background: "#f7f7f7",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {selectedTarget ? (
          <StyleEditor
            selectedTarget={selectedTarget}
            blocks={blocks}
            updateBlocks={updateBlocks}
          />
        ) : (
          <div style={{ padding: 12, color: "#666" }}>Select a block or element to edit styles.</div>
        )}
      </div>
    </div>
  );
}
