import React, { useRef, useState, useEffect } from "react";
import SimpleDNDBlock from "./SimpleDndBlock";
import DeleteButton from "./DeleteButton";

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
  selectedTarget,
  setSelectedTarget,
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

  const refs = useRef({ resizing, dragging, startPos, startRect, rect, blockId: block.id, moveBlock });

  useEffect(() => {
    refs.current = { resizing, dragging, startPos, startRect, rect, blockId: block.id, moveBlock };
  }, [resizing, dragging, startPos, startRect, rect, block.id, moveBlock]);

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
        setRect(prev => ({ ...prev, left: refs.current.startRect.left + deltaX, top: refs.current.startRect.top + deltaY }));
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
    if (selectedElementId) return;
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

  return (
    <div
      ref={ref}
      onMouseDown={onDragMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        setSelectedElementId(null);
        setSelectedTarget({ blockId: block.id, type: "block" });
      }}
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
  );
}
