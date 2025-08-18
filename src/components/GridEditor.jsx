import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { createRoot } from "react-dom/client";
import { useUserTheme } from "../contexts/UserThemeContext";
import { componentMap, defaultPropsMap } from "./componentMap";
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";
import StyleEditor from "../components2/StyleEditor";

const ItemTypes = { COMPONENT: "component" };
const VIRTUAL_GRID_WIDTH = window.innerWidth;

function SidebarItem({ compId }) {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { compId },
  }));
  return <div ref={drag} className="sidebar-item">{compId}</div>;
}

function elementsObjToArray(elementsObj = {}) {
  return Object.entries(elementsObj).map(([id, data]) => ({
    id,
    style: { ...(data?.style || {}) },
    textStyle: { ...(data?.textStyle || {}) },
  }));
}

function elementsArrayToObj(elementsArr = [], prevObj = {}) {
  const next = { ...prevObj };
  for (const el of elementsArr) {
    const prev = prevObj?.[el.id] || {};
    next[el.id] = {
      ...prev,
      style: { ...(prev.style || {}), ...(el.style || {}) },
      textStyle: { ...(prev.textStyle || {}), ...(el.textStyle || {}) },
    };
  }
  return next;
}

export default function GridEditor({ gridItems, setGridItems }) {
  const { setUserThemeConfig } = useUserTheme();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const dropRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const pushHistory = (newState) => {
    setHistory((prev) => [...prev, newState]);
    setFuture([]);
  };

  const undo = () => {
    if (!history.length) return;
    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [gridItems, ...prev]);
    setGridItems(lastState);
  };

  const redo = () => {
    if (!future.length) return;
    const nextState = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, gridItems]);
    setGridItems(nextState);
  };

  const getDefaultSize = (type) => {
    const sizeMap = {
      header1: { width: 1000, height: 150 },
      header2: { width: 1000, height: 150 },
      hero: { width: 1000, height: 400 },
      footer1: { width: 1000, height: 100 },
      card1: { width: 300, height: 400 },
      aside1: { width: 250, height: 400 },
      section1: { width: 1000, height: 300 },
      about1: { width: 600, height: 400 },
    };
    return sizeMap[type] || { width: 300, height: 100 };
  };

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
      position: {
        x: (x / dropRef.current.clientWidth) * VIRTUAL_GRID_WIDTH,
        y,
      },
      size: {
        width: (width / dropRef.current.clientWidth) * VIRTUAL_GRID_WIDTH,
        height,
      },
    };
    pushHistory([...gridItems]);
    setGridItems((prev) => [...prev, newItem]);
    setUserThemeConfig((prev) => ({
      ...prev,
      components: [...(prev.components || []), type],
    }));
  };

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
    pushHistory([...gridItems]);
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, position: { x: (x / dropRef.current.clientWidth) * VIRTUAL_GRID_WIDTH, y } }
          : item
      )
    );
  };

  const updateSize = (id, width, height, position) => {
    pushHistory([...gridItems]);
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              size: { width: (width / dropRef.current.clientWidth) * VIRTUAL_GRID_WIDTH, height },
              position: { x: (position.x / dropRef.current.clientWidth) * VIRTUAL_GRID_WIDTH, y: position.y },
            }
          : item
      )
    );
  };

  const deleteComponent = (id) => {
    pushHistory([...gridItems]);
    setGridItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedTarget?.blockId === id) setSelectedTarget(null);
  };

  const blocks = useMemo(
    () =>
      gridItems.map((gi) => ({
        id: gi.id,
        style: gi.props?.style || {},
        elements: elementsObjToArray(gi.props?.elements || {}),
      })),
    [gridItems]
  );

  const updateBlocks = useCallback(
    (nextBlocks) => {
      pushHistory([...gridItems]);
      setGridItems((prev) =>
        prev.map((gi) => {
          const updated = nextBlocks.find((b) => b.id === gi.id);
          if (!updated) return gi;
          const nextStyle = updated.style || {};
          const nextElementsObj = elementsArrayToObj(updated.elements || [], gi.props?.elements || {});
          const nextProps = { ...(gi.props || {}), style: nextStyle, elements: nextElementsObj };
          return { ...gi, props: nextProps };
        })
      );
    },
    [gridItems]
  );

  // New: handlers for editable fields
  const handleChange = (blockId, key) => (value) => {
    pushHistory([...gridItems]);
    setGridItems((prev) =>
      prev.map((item) =>
        item.id === blockId ? { ...item, props: { ...item.props, [key]: value } } : item
      )
    );
  };

  const handleCanvasClick = useCallback((e, itemId) => {
    e.stopPropagation();
    const el = e.target.closest("[data-element-id]");
    const elementId = el?.getAttribute("data-element-id");
    if (elementId && elementId !== "header") {
      setSelectedTarget({ blockId: itemId, type: "element", elementId });
    } else {
      setSelectedTarget({ blockId: itemId, type: "block" });
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isEditable = e.target.isContentEditable || tag === "input" || tag === "textarea";
      if (isEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) redo();
      else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedTarget?.blockId) deleteComponent(selectedTarget.blockId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTarget, history, future, gridItems]);

  const [gridHeight, setGridHeight] = useState(0);

  useEffect(() => {
    const maxHeight = gridItems.reduce((max, item) => {
      const bottom = item.position.y + item.size.height;
      return bottom > max ? bottom : max;
    }, 0);
    setGridHeight(maxHeight + 20);
  }, [gridItems]);

  return (
    <div className="theme-container">
      <div className="grid-editor-container">
        <aside className="grid-sidebar">
          <h3>Components</h3>
          {Object.keys(componentMap).map((compId) => (
            <SidebarItem key={compId} compId={compId} />
          ))}
          <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
            Tip: drag a component into the canvas. Click inside a component to select the whole block, or click a labeled inner part to edit.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
            <button onClick={undo} disabled={!history.length}>Undo</button>
            <button onClick={redo} disabled={!future.length}>Redo</button>
            <button
              onClick={() => selectedTarget && deleteComponent(selectedTarget.blockId)}
              disabled={!selectedTarget}
            >
              Delete
            </button>
          </div>
        </aside>

        <div
          ref={(node) => { drop(node); dropRef.current = node; }}
          className="grid-area"
          style={{ height: gridHeight }}
        >
          {gridItems.map((item) => {
            const Comp = componentMap[item.type];
            if (!Comp) return null;

            const isSelectedBlock = selectedTarget?.blockId === item.id && selectedTarget?.type === "block";
            const isSelectedElement = selectedTarget?.blockId === item.id && selectedTarget?.type === "element";

            const scale = dropRef.current ? dropRef.current.clientWidth / VIRTUAL_GRID_WIDTH : 1;

            // Inject handlers for editable fields
            const propsWithHandlers = {
              ...item.props,
              backgroundImage: item.props?.backgroundImage || "",
              onHeadingChange: handleChange(item.id, "heading"),
              onTextChange: handleChange(item.id, "text"),
              onImageChange: handleChange(item.id, "imageSrc"),
              onBackgroundChange: handleChange(item.id, "backgroundImage"),
            };

            return (
              <Rnd
                key={item.id}
                size={{ width: item.size.width * scale, height: item.size.height }}
                position={{ x: item.position.x * scale, y: item.position.y }}
                onDragStop={(e, d) => updatePosition(item.id, d.x, d.y)}
                onResizeStop={(e, dir, ref, delta, position) => updateSize(item.id, ref.offsetWidth, ref.offsetHeight, position)}
                bounds="parent"
                minWidth={50}
                minHeight={50}
                className="grid-item"
                style={{ border: isSelectedBlock || isSelectedElement ? "2px solid #1976d2" : undefined }}
                onClick={(e) => handleCanvasClick(e, item.id)}
              >
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                  <Comp {...propsWithHandlers} style={{ ...(item.props?.style || {}), width: "100%", height: "100%" }} />
                </div>
              </Rnd>
            );
          })}
        </div>

        <div className="style-editor-container">
          {selectedTarget ? (
            <StyleEditor selectedTarget={selectedTarget} blocks={blocks} updateBlocks={updateBlocks} />
          ) : (
            <div style={{ padding: 12, color: "#666" }}>Select a block or element to edit styles.</div>
          )}
        </div>
      </div>
    </div>
  );
}
