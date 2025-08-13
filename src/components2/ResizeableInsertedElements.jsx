import React, { useRef, useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";

const HANDLE_SIZE = 8;
const MIN_WIDTH = 40;
const MIN_HEIGHT = 30;

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

export default function EditableElement({
  element,
  blockId,
  selectedTarget,
  setSelectedTarget,
  parentPath = [],
  disablePointerEvents = false,
}) {
  const ref = useRef(null);

  const [localRect, setLocalRect] = useState({
    left: element.position?.left || 0,
    top: element.position?.top || 0,
    width: element.width || 100,
    height: element.height || 40,
  });

  const [resizing, setResizing] = useState(null);
  const resizingRef = useRef(null);
  const startPosRef = useRef(null);
  const startRectRef = useRef(null);

  const isSelected = selectedTarget?.elementId === element.id;
  const scaleX = element.width ? localRect.width / element.width : 1;
  const scaleY = element.height ? localRect.height / element.height : 1;

  // Drag
  const [{ isDragging }, drag] = useDrag({
    type: "ELEMENT",
    item: { id: element.id, blockId, left: localRect.left, top: localRect.top, width: localRect.width, height: localRect.height, path: [...parentPath, element.id] },
    canDrag: () => !resizing && !disablePointerEvents,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  // Drop
  const [, drop] = useDrop({
    accept: "ELEMENT",
    hover(item, monitor) {
      if (!ref.current) return;
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;

      let left = Math.max(0, Math.round(item.left + delta.x));
      let top = Math.max(0, Math.round(item.top + delta.y));

      if (left !== localRect.left || top !== localRect.top) {
        setLocalRect((prev) => ({ ...prev, left, top }));
        item.left = left;
        item.top = top;
      }
    },
  });

  drag(drop(ref));

  // Resize logic
  const localRectRef = useRef(localRect);
  useEffect(() => { localRectRef.current = localRect; }, [localRect]);

  useEffect(() => {
    function onMouseMove(e) {
      if (!resizingRef.current) return;
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newLeft = startRectRef.current.left;
      let newTop = startRectRef.current.top;
      let newWidth = startRectRef.current.width;
      let newHeight = startRectRef.current.height;

      if (resizingRef.current.includes("e")) newWidth = Math.max(MIN_WIDTH, startRectRef.current.width + deltaX);
      if (resizingRef.current.includes("s")) newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height + deltaY);
      if (resizingRef.current.includes("w")) { newWidth = Math.max(MIN_WIDTH, startRectRef.current.width - deltaX); newLeft = startRectRef.current.left + (startRectRef.current.width - newWidth); }
      if (resizingRef.current.includes("n")) { newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height - deltaY); newTop = startRectRef.current.top + (startRectRef.current.height - newHeight); }

      setLocalRect({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
    }

    function onMouseUp() { if (resizingRef.current) setResizing(null); }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("blur", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("blur", onMouseUp);
    };
  }, []);

  const onHandleMouseDown = (e, dir) => {
    e.stopPropagation(); e.preventDefault();
    setResizing(dir);
    resizingRef.current = dir;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startRectRef.current = localRectRef.current;
  };

  // Recursive render for inner elements
  return (
    <div
      ref={ref}
      onClick={(e) => { e.stopPropagation(); setSelectedTarget({ type: "element", blockId, elementId: element.id, path: [...parentPath, element.id] }); }}
      style={{
        position: "absolute",
        left: localRect.left,
        top: localRect.top,
        width: localRect.width,
        height: localRect.height,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : 1,
        border: isSelected ? "2px solid #3b82f6" : "1px solid #ccc",
        borderRadius: 4,
        backgroundColor: element.style?.backgroundColor || "white",
        color: element.style?.color || "black",
        fontSize: element.style?.fontSize || "14px",
        fontWeight: element.style?.fontWeight || "normal",
        fontStyle: element.style?.fontStyle || "normal",
        fontFamily: element.style?.fontFamily || "inherit",
        margin: element.style?.margin || 0,
        padding: element.style?.padding || 4,
        outline: isSelected ? "2px solid #2563eb" : "none",
        userSelect: "none",
        boxSizing: "border-box",
        overflow: "hidden",
        whiteSpace: "nowrap",
        zIndex: isSelected ? 100 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: disablePointerEvents ? "none" : "auto",
      }}
    >
      {element.content}

      {element.elements?.map((child) => (
        <EditableElement
          key={child.id}
          element={{
            ...child,
            width: (child.width || 100) * scaleX,
            height: (child.height || 40) * scaleY,
            position: { left: (child.position?.left || 0) * scaleX, top: (child.position?.top || 0) * scaleY },
          }}
          blockId={blockId}
          selectedTarget={selectedTarget}
          setSelectedTarget={setSelectedTarget}
          parentPath={[...parentPath, element.id]}
          disablePointerEvents={disablePointerEvents}
        />
      ))}

      {/* Resize handles */}
      {["n","s","e","w","ne","nw","se","sw"].map(dir => (
        <div key={dir} onMouseDown={(e) => onHandleMouseDown(e, dir)}
          style={{ position: "absolute", width: HANDLE_SIZE, height: HANDLE_SIZE, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 2, zIndex: 20,
            ...({
              n: { top:-HANDLE_SIZE/2,left:"50%",marginLeft:-HANDLE_SIZE/2, cursor:cursors.n },
              s: { bottom:-HANDLE_SIZE/2,left:"50%",marginLeft:-HANDLE_SIZE/2, cursor:cursors.s },
              e: { right:-HANDLE_SIZE/2,top:"50%",marginTop:-HANDLE_SIZE/2, cursor:cursors.e },
              w: { left:-HANDLE_SIZE/2,top:"50%",marginTop:-HANDLE_SIZE/2, cursor:cursors.w },
              ne: { top:-HANDLE_SIZE/2,right:-HANDLE_SIZE/2, cursor:cursors.ne },
              nw: { top:-HANDLE_SIZE/2,left:-HANDLE_SIZE/2, cursor:cursors.nw },
              se: { bottom:-HANDLE_SIZE/2,right:-HANDLE_SIZE/2, cursor:cursors.se },
              sw: { bottom:-HANDLE_SIZE/2,left:-HANDLE_SIZE/2, cursor:cursors.sw }
            })[dir]
          }}
        />
      ))}
    </div>
  );
}
