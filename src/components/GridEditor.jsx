import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { createRoot } from "react-dom/client";
import { useUserTheme } from "../contexts/UserThemeContext";
import { componentMap, defaultPropsMap } from './componentMap';
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";
import StyleEditor from "../components2/StyleEditor";

const ItemTypes = { COMPONENT: "component" };
const VIRTUAL_GRID_WIDTH = 1200;
const HISTORY_LIMIT = 50;

const SidebarItem = React.memo(({ compId }) => {
  const [, drag] = useDrag(() => ({
    type: ItemTypes.COMPONENT,
    item: { compId },
  }), [compId]);
  
  return <div ref={drag} className="sidebar-item">{compId}</div>;
});

const DEFAULT_SIZES = {
  header1: { width: 1000, height: 150 },
  header2: { width: 1000, height: 150 },
  hero: { width: 1000, height: 400 },
  footer1: { width: 1000, height: 100 },
  card1: { width: 300, height: 400 },
  aside1: { width: 250, height: 400 },
  section1: { width: 1000, height: 300 },
  about1: { width: 600, height: 400 },
};

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

export default function GridEditor({ gridItems, setGridItems }) {
  const { setUserTheme } = useUserTheme();
  const [selectedTarget, setSelectedTarget] = useState(null);
  const dropRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  const pushHistory = useCallback((newState) => {
    setHistory((prev) => {
      const newHistory = [...prev, newState];
      return newHistory.length > HISTORY_LIMIT 
        ? newHistory.slice(-HISTORY_LIMIT) 
        : newHistory;
    });
    setFuture([]);
  }, []);

  const debouncedPushHistory = useMemo(
    () => debounce((state) => pushHistory([...state]), 300),
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (!history.length || isOperationInProgress) return;
    const lastState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [gridItems, ...prev]);
    setGridItems(lastState);
  }, [history.length, isOperationInProgress, gridItems]);

  const redo = useCallback(() => {
    if (!future.length || isOperationInProgress) return;
    const nextState = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, gridItems]);
    setGridItems(nextState);
  }, [future.length, isOperationInProgress, gridItems]);

  const getDefaultSize = useCallback((type) => DEFAULT_SIZES[type] || { width: 300, height: 100 }, []);

  const measureComponentSize = useCallback(async (type, props) => {
    try {
      const defaultSize = getDefaultSize(type);
      const Comp = componentMap[type];
      if (!Comp) return defaultSize;

      const container = document.createElement("div");
      container.style.cssText = `
        position: absolute; visibility: hidden; pointer-events: none; 
        top: -9999px; left: -9999px; width: auto; height: auto;
      `;
      document.body.appendChild(container);
      const root = createRoot(container);

      return new Promise((resolve) => {
        root.render(<Comp {...props} />);
        requestAnimationFrame(() => {
          const rect = container.getBoundingClientRect();
          const width = Math.max(rect.width || defaultSize.width, 50);
          const height = Math.max(rect.height || defaultSize.height, 30);
          root.unmount();
          document.body.removeChild(container);
          resolve({ width, height });
        });
      });
    } catch (error) {
      console.warn(`Failed to measure component ${type}:`, error);
      return getDefaultSize(type);
    }
  }, [getDefaultSize]);

  const addComponent = useCallback(async (type, x, y) => {
    if (isOperationInProgress) return;
    setIsOperationInProgress(true);
    try {
      const props = { ...(defaultPropsMap[type] || {}) };
      const { width, height } = await measureComponentSize(type, props);
      const scale = dropRef.current ? dropRef.current.clientWidth / VIRTUAL_GRID_WIDTH : 1;
      
      const newItem = {
        id: uuidv4(),
        type,
        props,
        position: { x: x / scale, y },
        size: { width: width / scale, height },
      };

      pushHistory(gridItems);
      setGridItems((prev) => [...prev, newItem]);
      setUserTheme?.((prev) => ({
        ...prev,
        components: Array.from(new Set([...(prev.components || []), type])),
      }));
    } catch (error) {
      console.error('Failed to add component:', error);
    } finally {
      setIsOperationInProgress(false);
    }
  }, [gridItems, isOperationInProgress, measureComponentSize, pushHistory, setUserTheme]);

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.COMPONENT,
    drop: (item, monitor) => {
      if (!dropRef.current) return;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const rect = dropRef.current.getBoundingClientRect();
      addComponent(item.compId, clientOffset.x - rect.left + dropRef.current.scrollLeft, clientOffset.y - rect.top + dropRef.current.scrollTop);
    },
  }), [addComponent]);

  const updatePosition = useCallback((id, x, y) => {
    const scale = dropRef.current ? dropRef.current.clientWidth / VIRTUAL_GRID_WIDTH : 1;
    setGridItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, position: { x: x / scale, y } } : item
      );
      debouncedPushHistory(prev);
      return updated;
    });
  }, [debouncedPushHistory]);

  const updateSize = useCallback((id, width, height, position) => {
    const scale = dropRef.current ? dropRef.current.clientWidth / VIRTUAL_GRID_WIDTH : 1;
    setGridItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, size: { width: width / scale, height }, position: { x: position.x / scale, y: position.y } } : item
      );
      debouncedPushHistory(prev);
      return updated;
    });
  }, [debouncedPushHistory]);

  const deleteComponent = useCallback((id) => {
    pushHistory(gridItems);
    setGridItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedTarget?.blockId === id) setSelectedTarget(null);
  }, [gridItems, pushHistory, selectedTarget?.blockId]);

  const createChangeHandler = useCallback((blockId, key) => (value) => {
    setGridItems((prev) => {
      const updated = prev.map((item) =>
        item.id === blockId ? { ...item, props: { ...item.props, [key]: value } } : item
      );
      debouncedPushHistory(prev);
      return updated;
    });
  }, [debouncedPushHistory]);

  const createArrayChangeHandler = useCallback((blockId, arrayKey) => (index, value) => {
    setGridItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== blockId) return item;
        const currentArray = item.props[arrayKey] || [];
        const newArray = [...currentArray];
        if (newArray[index]) newArray[index] = { ...newArray[index], content: value };
        return { ...item, props: { ...item.props, [arrayKey]: newArray } };
      });
      debouncedPushHistory(prev);
      return updated;
    });
  }, [debouncedPushHistory]);

  const handleCanvasClick = useCallback((e, itemId) => {
    e.stopPropagation();
    let current = e.target;
    let elementId = null;
    while (current && current !== e.currentTarget) {
      const dataId = current.getAttribute("data-element-id");
      if (dataId) { elementId = dataId; break; }
      current = current.parentElement;
    }
    setSelectedTarget({ blockId: itemId, type: elementId ? "element" : "block", elementId });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isEditable = e.target.isContentEditable || ['input', 'textarea', 'select'].includes(tag);
      if (isEditable) return;

      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) { e.preventDefault(); redo(); }
      } else if (['Delete', 'Backspace'].includes(e.key)) {
        if (selectedTarget?.blockId) { e.preventDefault(); deleteComponent(selectedTarget.blockId); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTarget?.blockId, undo, redo, deleteComponent]);

  const gridHeight = useMemo(() => {
    const maxHeight = gridItems.reduce((max, item) => Math.max(max, item.position.y + item.size.height), 600);
    return maxHeight + 100;
  }, [gridItems]);

  const componentList = useMemo(() => Object.keys(componentMap), [componentMap]);

  // --- KEY FIX: Memoized props map for all components ---
  const memoizedPropsMap = useMemo(() => {
    const map = {};
    gridItems.forEach((item) => {
      map[item.id] = {
        ...item.props,
        elements: item.props.elements || {},
        onHeadingChange: createChangeHandler(item.id, "heading"),
        onTextChange: createChangeHandler(item.id, "text"),
        onTitleChange: createChangeHandler(item.id, "title"),
        onSubheadingChange: createChangeHandler(item.id, "subheading"),
        onCtaTextChange: createChangeHandler(item.id, "ctaText"),
        onCopyrightChange: createChangeHandler(item.id, "copyright"),
        onImageChange: createChangeHandler(item.id, "imageSrc"),
        onBackgroundChange: createChangeHandler(item.id, "backgroundImage"),
        onNavItemChange: createArrayChangeHandler(item.id, "navItems"),
        onCtaChange: createArrayChangeHandler(item.id, "ctaItems"),
        onItemChange: createArrayChangeHandler(item.id, "items"),
        style: { ...(item.props?.style || {}), width: "100%", height: "100%" }
      };
    });
    return map;
  }, [gridItems, createChangeHandler, createArrayChangeHandler]);

  // Prepare blocks for StyleEditor
  const blocks = useMemo(() => 
    gridItems.map((gi) => ({ id: gi.id, type: gi.type, style: gi.props?.style || {}, elements: gi.props?.elements || {}, ...gi.props })), 
    [gridItems]
  );

  const updateBlocks = useCallback((nextBlocks) => {
    pushHistory(gridItems);
    setGridItems((prev) =>
      prev.map((gi) => {
        const updated = nextBlocks.find((b) => b.id === gi.id);
        if (!updated) return gi;
        const { id, type, ...restProps } = updated;
        return { ...gi, props: { ...gi.props, ...restProps } };
      })
    );
  }, [gridItems, pushHistory]);

  return (
    <div className="theme-container">
      <div className="grid-editor-container">
        <aside className="grid-sidebar">
          <h3>Components</h3>
          {componentList.map((compId) => <SidebarItem key={compId} compId={compId} />)}
          <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
            Drag components to canvas. Click to select blocks or elements.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={undo} disabled={!history.length || isOperationInProgress} title={`Undo (${history.length} available)`}>Undo</button>
            <button onClick={redo} disabled={!future.length || isOperationInProgress} title={`Redo (${future.length} available)`}>Redo</button>
            <button onClick={() => selectedTarget?.blockId && deleteComponent(selectedTarget.blockId)} disabled={!selectedTarget?.blockId} title="Delete selected component">Delete</button>
          </div>
        </aside>

        <div ref={(node) => { drop(node); dropRef.current = node; }} className="grid-area" style={{ height: gridHeight, minHeight: 600, position: 'relative' }}>
          {gridItems.map((item) => {
            const Comp = componentMap[item.type];
            if (!Comp) return null;
            const isSelected = selectedTarget?.blockId === item.id;
            const scale = dropRef.current ? dropRef.current.clientWidth / VIRTUAL_GRID_WIDTH : 1;

            return (
              <Rnd
                key={item.id}
                size={{ width: Math.max(item.size.width * scale, 50), height: Math.max(item.size.height, 30) }}
                position={{ x: item.position.x * scale, y: item.position.y }}
                onDragStop={(e, d) => updatePosition(item.id, d.x, d.y)}
                onResizeStop={(e, dir, ref, delta, position) => updateSize(item.id, ref.offsetWidth, ref.offsetHeight, position)}
                bounds="parent"
                minWidth={50}
                minHeight={30}
                className="grid-item"
                style={{ border: isSelected ? "2px solid #1976d2" : "1px solid #e0e0e0", background: isSelected ? "rgba(25, 118, 210, 0.05)" : "transparent", borderRadius: 4, overflow: 'hidden' }}
                onClick={(e) => handleCanvasClick(e, item.id)}
              >
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: 'hidden' }}>
                  <Comp {...memoizedPropsMap[item.id]} />
                </div>
              </Rnd>
            );
          })}
        </div>

        <div className="style-editor-container">
          <StyleEditor selectedTarget={selectedTarget} blocks={blocks} updateBlocks={updateBlocks} />
        </div>
      </div>
    </div>
  );
}
