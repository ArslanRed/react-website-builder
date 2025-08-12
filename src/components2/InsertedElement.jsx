import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

export default function InsertedElement({
  element,
  selected,
  onSelect,
  onEdit,
  blockId,
  onMoveInsert,
  onResizeInsert,  
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: "INSERTED_ELEMENT",
    item: {
      id: element.id,
      blockId,
      left: element.position?.left || 0,
      top: element.position?.top || 0,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "INSERTED_ELEMENT",
    hover(item, monitor) {
      if (!ref.current) return;

      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      let left = Math.round(item.left + delta.x);
      let top = Math.round(item.top + delta.y);

      // Optional: clamp positions to >= 0 to stay inside block
      left = left < 0 ? 0 : left;
      top = top < 0 ? 0 : top;

      // Update position while dragging
      onMoveInsert(blockId, element.id, { left, top });

      // Update drag item's position so the movement is smooth
      item.left = left;
      item.top = top;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
      style={{
        position: "absolute",
        left: element.position?.left || 0,
        top: element.position?.top || 0,
        cursor: "move",
        opacity: isDragging ? 0.5 : 1,
        padding: "4px 8px",
        border: selected ? "2px solid #4f46e5" : "1px solid #ccc",
        borderRadius: 4,
        backgroundColor: "white",
        userSelect: "none",
        zIndex: selected ? 100 : 1,
        minWidth: 40,
        whiteSpace: "nowrap",
      }}
    >
      {element.type === "link" && (
        <a href={element.url} target="_blank" rel="noopener noreferrer">
          {element.text}
        </a>
      )}
      {element.type === "button" && <button>{element.text}</button>}
      {element.type === "image" && (
        <img
          src={element.url}
          alt={element.text}
          style={{ maxWidth: 100, maxHeight: 50 }}
        />
      )}
      {element.type === "icon" && <i className={element.text}></i>}
    </div>
  );
}
