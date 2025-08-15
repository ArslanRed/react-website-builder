import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { useUserTheme } from "../contexts/UserThemeContext";
import { componentMap, defaultPropsMap } from "./ComponentMap";
import { v4 as uuidv4 } from "uuid";
import { useDrag, useDrop } from "react-dnd";

const ItemTypes = { COMPONENT: "component" };
import '../styles/EditorPageContent.css'
// Sidebar item (drag only)
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
      }}
    >
      {compId}
    </div>
  );
}

export default function GridEditor() {
  const { setUserThemeConfig } = useUserTheme();
  const [gridItems, setGridItems] = useState([]);
  const dropRef = useRef(null);

  // Reusable method to get default size based on component type
  const getDefaultSize = (type) => {
    const sizeMap = {
      header1: { width: 1000, height: 150 },
      header2: { width: 1000, height: 150 },
      hero: { width: 1000, height: 400 },
      footer1: { width: 1000, height: 100 },
      // Add more component-specific defaults here if needed
    };
    return sizeMap[type] || { width: 300, height: 100 };
  };

  // Add a new component to the grid
  const addComponent = (type, x, y) => {
    const newItem = {
      id: uuidv4(),
      type,
      props: { ...(defaultPropsMap[type] || {}) }, // automatically use default props
      position: { x, y },
      size: getDefaultSize(type), // automatically use default size
    };

    setGridItems((prev) => [...prev, newItem]);

    setUserThemeConfig((prev) => ({
      ...prev,
      components: [...prev.components, type],
    }));
  };

  // Drop target
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

  const renderComponent = (item) => {
    const DynamicComponent = componentMap[item.type];
    if (!DynamicComponent) return null;
    return <DynamicComponent {...item.props} />;
  };

  return (
    <div className="grid-editor-container" style={{ display: "flex", height: "100%" }}>
      {/* Sidebar */}
      <aside
        className="grid-sidebar"
        style={{
          width: 220,
          borderRight: "1px solid #ccc",
          padding: "1rem",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <h3>Components</h3>
        {Object.keys(componentMap).map((compId) => (
          <SidebarItem key={compId} compId={compId} />
        ))}
      </aside>

      {/* Grid Area */}
      <div
        ref={(node) => {
          drop(node);
          dropRef.current = node;
        }}
        className="grid-area"
        style={{
          flexGrow: 1,
          position: "relative",
          overflow: "auto",
          background: "#f9f9f9",
        }}
      >
        {gridItems.map((item) => (
          <Rnd
            key={item.id}
            size={{ width: item.size.width, height: item.size.height }}
            position={{ x: item.position.x, y: item.position.y }}
            onDragStop={(e, d) => updatePosition(item.id, d.x, d.y)}
            onResizeStop={(e, dir, ref, delta, position) =>
              updateSize(item.id, ref.offsetWidth, ref.offsetHeight, position)
            }
            bounds="parent"
            minWidth={50}
            minHeight={50}
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
            style={{
              border: "1px dashed #888",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {renderComponent(item)}
          </Rnd>
        ))}
      </div>
    </div>
  );
}
