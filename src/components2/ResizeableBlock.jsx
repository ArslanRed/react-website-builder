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
  const [resizing, setResizing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [startRect, setStartRect] = useState(null);
  const [rect, setRect] = useState({
    left: block.position.left,
    top: block.position.top,
    width: block.width || 150,
    height: block.height || 40,
  });

  const resizingRef = useRef(resizing);
  const draggingRef = useRef(dragging);
  const startPosRef = useRef(startPos);
  const startRectRef = useRef(startRect);
  const rectRef = useRef(rect);
  const blockIdRef = useRef(block.id);
  const moveBlockRef = useRef(moveBlock);

  useEffect(() => { resizingRef.current = resizing; }, [resizing]);
  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { startPosRef.current = startPos; }, [startPos]);
  useEffect(() => { startRectRef.current = startRect; }, [startRect]);
  useEffect(() => { rectRef.current = rect; }, [rect]);
  useEffect(() => { blockIdRef.current = block.id; }, [block.id]);
  useEffect(() => { moveBlockRef.current = moveBlock; }, [moveBlock]);

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

        setRect({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
      } else if (draggingRef.current) {
        e.preventDefault();
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;
        setRect(prev => ({ ...prev, left: startRectRef.current.left + deltaX, top: startRectRef.current.top + deltaY }));
      }
    }

    function onMouseUp() {
      if (resizingRef.current || draggingRef.current) {
        moveBlockRef.current(blockIdRef.current, {
          left: rectRef.current.left,
          top: rectRef.current.top,
          width: rectRef.current.width,
          height: rectRef.current.height,
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
  }, []);

  const onHandleMouseDown = (e, direction) => {
    e.stopPropagation(); e.preventDefault();
    if (selectedElementId) return;
    setResizing(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  const onDragMouseDown = (e) => {
    if (resizing) return;
    if (e.target.closest && e.target.closest(".inserted-element")) return;
    if (selectedElementId) return;
    e.stopPropagation(); e.preventDefault();
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartRect({ ...rect });
  };

  return (
    <div
      ref={ref}
      onMouseDown={onDragMouseDown}
      onClick={(e) => { e.stopPropagation(); onClick?.(e); setSelectedElementId(null); }}
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
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Dynamically scale inserted elements */}
       {(block.inserts || []).map(el => {
  const scaleX = block.type === "component" ? 1 : rect.width / (block.width || 150);
  const scaleY = block.type === "component" ? 1 : rect.height / (block.height || 40);
  return (
    <ResizableInsertedElement
      key={el.id}
      element={{
        ...el,
        width: (el.width || 100) * scaleX,
        height: (el.height || 40) * scaleY,
      }}
      selected={selectedElementId === el.id}
      onSelect={() => setSelectedElementId(el.id)}
      onEdit={() => onEditElement?.(el, block.id)}
      blockId={block.id}
      onMoveInsert={onMoveInsert}
      onResizeInsert={onResizeInsert}
      disablePointerEvents={!!(resizing || dragging)}
            />
          );
        })}

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
            { dir: "ne", style: { top: 0, right: 0 } },
            { dir: "nw", style: { top: 0, left: 0 } },
            { dir: "se", style: { bottom: 0, right: 0 } },
            { dir: "sw", style: { bottom: 0, left: 0 } },
            { dir: "n", style: { top: 0, left: "50%", transform: "translateX(-50%)" } },
            { dir: "s", style: { bottom: 0, left: "50%", transform: "translateX(-50%)" } },
            { dir: "e", style: { right: 0, top: "50%", transform: "translateY(-50%)" } },
            { dir: "w", style: { left: 0, top: "50%", transform: "translateY(-50%)" } },
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
