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

export default function ResizableInsertedElement({
  element,
  selected,
  onSelect,
  onEdit,
  blockId,
  onMoveInsert,
  onResizeInsert,
  disablePointerEvents = false,
}) {
  const ref = useRef(null);

  const [localRect, setLocalRect] = useState({
    left: element.position.left,
    top: element.position.top,
    width: element.width || 100,
    height: element.height || 40,
  });

  const [resizing, setResizing] = useState(null);
  const resizingRef = useRef(null);
  const startPosRef = useRef(null);
  const startRectRef = useRef(null);

  useEffect(() => {
    resizingRef.current = resizing;
  }, [resizing]);

  useEffect(() => {
    if (!resizing) {
      setLocalRect({
        left: element.position.left,
        top: element.position.top,
        width: element.width || 100,
        height: element.height || 40,
      });
    }
  }, [element, resizing]);

  const [{ isDragging }, drag] = useDrag({
    type: "INSERTED_ELEMENT",
    item: {
      id: element.id,
      blockId,
      left: element.position?.left || 0,
      top: element.position?.top || 0,
      width: element.width || 100,
      height: element.height || 40,
    },
    canDrag: () => !resizing && !disablePointerEvents,
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

      left = Math.max(0, left);
      top = Math.max(0, top);

      if (left !== localRect.left || top !== localRect.top) {
        onMoveInsert?.(blockId, element.id, { left, top });
        item.left = left;
        item.top = top;
      }
    },
  });

  drag(drop(ref));

  const localRectRef = useRef(localRect);
  useEffect(() => {
    localRectRef.current = localRect;
  }, [localRect]);

  useEffect(() => {
    function onMouseMove(e) {
      if (!resizingRef.current) return;
      e.preventDefault();

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newLeft = startRectRef.current.left;
      let newTop = startRectRef.current.top;
      let newWidth = startRectRef.current.width;
      let newHeight = startRectRef.current.height;

      if (resizingRef.current.includes("e")) newWidth = Math.max(MIN_WIDTH, startRectRef.current.width + deltaX);
      if (resizingRef.current.includes("s")) newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height + deltaY);
      if (resizingRef.current.includes("w")) {
        newWidth = Math.max(MIN_WIDTH, startRectRef.current.width - deltaX);
        newLeft = startRectRef.current.left + (startRectRef.current.width - newWidth);
      }
      if (resizingRef.current.includes("n")) {
        newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height - deltaY);
        newTop = startRectRef.current.top + (startRectRef.current.height - newHeight);
      }

      setLocalRect({
        left: newLeft,
        top: newTop,
        width: newWidth,
        height: newHeight,
      });
    }

    function onMouseUp() {
      if (resizingRef.current) {
        onResizeInsert?.(blockId, element.id, localRectRef.current);
        setResizing(null);
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
  }, [blockId, element.id, onResizeInsert]);

  const onHandleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(direction);
    resizingRef.current = direction;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startRectRef.current = localRectRef.current;
  };

  return (
    <div
      ref={ref}
      className="inserted-element"
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit?.();
      }}
      style={{
        position: "absolute",
        left: localRect.left,
        top: localRect.top,
        width: localRect.width,
        height: localRect.height,
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.5 : 1,
        padding: 4,
        border: selected ? "2px solid #4f46e5" : "1px solid #ccc",
        borderRadius: 4,
        backgroundColor: "white",
        userSelect: "none",
        boxSizing: "border-box",
        overflow: "hidden",
        whiteSpace: "nowrap",
        zIndex: selected ? 100 : 1,
        pointerEvents: disablePointerEvents ? "none" : "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Render element content with explicit styles to fill container */}
      {element.type === "link" && (
        <a
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            pointerEvents: "none",
            display: "block",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            lineHeight: "normal",
            boxSizing: "border-box",
            padding: "4px",
          }}
        >
          {element.text}
        </a>
      )}

      {element.type === "button" && (
        <button
          style={{
            pointerEvents: "none",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "4px",
          }}
        >
          {element.text}
        </button>
      )}

      {element.type === "image" && (
        <img
          src={element.url}
          alt={element.text}
          style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
        />
      )}

      {element.type === "icon" && (
        <i
          className={element.text}
          style={{
            pointerEvents: "none",
            display: "inline-block",
            width: "100%",
            height: "100%",
            fontSize: "calc(100% - 8px)",
            textAlign: "center",
            lineHeight: "normal",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* Resize handles */}
      {["n", "s", "e", "w", "ne", "nw", "se", "sw"].map((dir) => {
        const styleMap = {
          n: { top: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2, cursor: cursors.n },
          s: { bottom: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2, cursor: cursors.s },
          e: { right: -HANDLE_SIZE / 2, top: "50%", marginTop: -HANDLE_SIZE / 2, cursor: cursors.e },
          w: { left: -HANDLE_SIZE / 2, top: "50%", marginTop: -HANDLE_SIZE / 2, cursor: cursors.w },
          ne: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: cursors.ne },
          nw: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: cursors.nw },
          se: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: cursors.se },
          sw: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: cursors.sw },
        };
        return (
          <div
            key={dir}
            onMouseDown={(e) => {
              e.stopPropagation();
              onHandleMouseDown(e, dir);
            }}
            style={{
              position: "absolute",
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 2,
              zIndex: 20,
              ...styleMap[dir],
            }}
          />
        );
      })}
    </div>
  );
}
