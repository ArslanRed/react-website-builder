import React, { useRef, useState, useEffect } from "react";
import SimpleDNDBlock from "./SimpleDndBlock";
import DeleteButton from "./DeleteButton";
import ResizableInsertedElement from "./ResizeableInsertedElements";

const HANDLE_SIZE = 10;
const MIN_WIDTH = 50;
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

export default function ResizableBlock({
  block,
  moveBlock,
  selected,
  onClick,
  onDelete,
  selectedElementId,
  setSelectedElementId,
  onEditElement,
  onInsertRichElement,
  onMoveInsert,
  onResizeInsert,
}) {
  const ref = useRef(null);

  // States
  const [resizing, setResizing] = useState(null); // direction string or null
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [startRect, setStartRect] = useState(null);
  const [rect, setRect] = useState({
    left: block.position.left,
    top: block.position.top,
    width: block.width || 150,
    height: block.height || 40,
  });

  // Refs for latest values to use in window handlers without reattaching
  const resizingRef = useRef(resizing);
  const draggingRef = useRef(dragging);
  const startPosRef = useRef(startPos);
  const startRectRef = useRef(startRect);
  const rectRef = useRef(rect);
  const blockIdRef = useRef(block.id);
  const moveBlockRef = useRef(moveBlock);

  useEffect(() => {
    resizingRef.current = resizing;
  }, [resizing]);

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    startPosRef.current = startPos;
  }, [startPos]);

  useEffect(() => {
    startRectRef.current = startRect;
  }, [startRect]);

  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  useEffect(() => {
    blockIdRef.current = block.id;
  }, [block.id]);

  useEffect(() => {
    moveBlockRef.current = moveBlock;
  }, [moveBlock]);

  // Keep rect in sync with props when not dragging/resizing
  useEffect(() => {
    if (!dragging && !resizing) {
      setRect({
        left: block.position.left,
        top: block.position.top,
        width: block.width || 150,
        height: block.height || 40,
      });
    }
  }, [block, dragging, resizing]);

  // Toggle document.body styles while interacting
  useEffect(() => {
    if (dragging || resizing) {
      document.body.style.userSelect = "none";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.touchAction = "";
    };
  }, [dragging, resizing]);

  // Attach global window mousemove and mouseup once with stable handlers
  useEffect(() => {
    function onMouseMove(e) {
      if (resizingRef.current) {
        e.preventDefault();
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;

        let newLeft = startRectRef.current.left;
        let newTop = startRectRef.current.top;
        let newWidth = startRectRef.current.width;
        let newHeight = startRectRef.current.height;

        if (resizingRef.current.includes("e")) {
          newWidth = Math.max(MIN_WIDTH, startRectRef.current.width + deltaX);
        }
        if (resizingRef.current.includes("s")) {
          newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height + deltaY);
        }
        if (resizingRef.current.includes("w")) {
          newWidth = Math.max(MIN_WIDTH, startRectRef.current.width - deltaX);
          newLeft = startRectRef.current.left + (startRectRef.current.width - newWidth);
        }
        if (resizingRef.current.includes("n")) {
          newHeight = Math.max(MIN_HEIGHT, startRectRef.current.height - deltaY);
          newTop = startRectRef.current.top + (startRectRef.current.height - newHeight);
        }

        setRect({
          left: newLeft,
          top: newTop,
          width: newWidth,
          height: newHeight,
        });
      } else if (draggingRef.current) {
        e.preventDefault();
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;

        setRect((prev) => ({
          ...prev,
          left: startRectRef.current.left + deltaX,
          top: startRectRef.current.top + deltaY,
        }));
      }
    }

    function onMouseUp() {
      if (resizingRef.current) {
        moveBlockRef.current(blockIdRef.current, {
          left: rectRef.current.left,
          top: rectRef.current.top,
          width: rectRef.current.width,
          height: rectRef.current.height,
        });
        setResizing(null);
      }
      if (draggingRef.current) {
        moveBlockRef.current(blockIdRef.current, {
          left: rectRef.current.left,
          top: rectRef.current.top,
          width: rectRef.current.width,
          height: rectRef.current.height,
        });
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
  }, []); // empty deps to attach once on mount

  // Start resizing on handle mouse down
  const onHandleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();

    // don't start resizing if an inner element is selected
    if (selectedElementId) return;

    setResizing(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  // Start dragging on outer block mouse down
  const onDragMouseDown = (e) => {
    if (resizing) return;
    if (e.target.closest && e.target.closest(".inserted-element")) return;
    if (selectedElementId) return;

    e.stopPropagation();
    e.preventDefault();

    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  return (
    <div
      ref={ref}
      onMouseDown={onDragMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        setSelectedElementId(null);
      }}
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        boxSizing: "border-box",
        border: selected && !selectedElementId ? "2px solid #4f46e5" : "1px solid #666",
        backgroundColor: "white",
        userSelect: resizing || dragging ? "none" : "auto",
        touchAction: "none",
        cursor: dragging ? "grabbing" : "grab",
        overflow: "visible",
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {(block.inserts || []).map((el) => (
          <ResizableInsertedElement
            key={el.id}
            element={el}
            selected={selectedElementId === el.id}
            onSelect={() => setSelectedElementId(el.id)}
            onEdit={() => onEditElement?.(el, block.id)}
            blockId={block.id}
            onMoveInsert={onMoveInsert}
            onResizeInsert={onResizeInsert}
            disablePointerEvents={!!(resizing || dragging)}
          />
        ))}

        {selected && !selectedElementId && (
          <div
            style={{
              position: "absolute",
              top: "-40px",
              left: 0,
              display: "flex",
              gap: 8,
              zIndex: 1000,
              backgroundColor: "#fff",
              padding: "4px",
              borderRadius: 4,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {["link", "button", "image", "icon"].map((type) => (
              <button
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  onInsertRichElement?.(block.id, type);
                }}
                style={{
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: 14,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Insert {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        <SimpleDNDBlock
          block={{
            ...block,
            position: { left: 0, top: 0 },
            width: rect.width,
            height: rect.height,
          }}
        />

        <DeleteButton onClick={onDelete} />

        {!selectedElementId &&
          [
            { dir: "n", style: { top: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
            { dir: "s", style: { bottom: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
            { dir: "e", style: { right: -HANDLE_SIZE / 2, top: "50%", marginTop: -HANDLE_SIZE / 2 } },
            { dir: "w", style: { left: -HANDLE_SIZE / 2, top: "50%", marginTop: -HANDLE_SIZE / 2 } },
            { dir: "ne", style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
            { dir: "nw", style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
            { dir: "se", style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
            { dir: "sw", style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
          ].map(({ dir, style }) => (
            <div
              key={dir}
              onMouseDown={(e) => onHandleMouseDown(e, dir)}
              style={{
                position: "absolute",
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                backgroundColor: "rgba(0,0,0,0.3)",
                cursor: cursors[dir],
                ...style,
                zIndex: 10,
                borderRadius: 2,
              }}
            />
          ))}
      </div>
    </div>
  );
}
