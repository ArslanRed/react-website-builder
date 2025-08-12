import { useState, useEffect, useRef } from "react";

const MIN_WIDTH = 40;
const MIN_HEIGHT = 30;

export function useDragResize({
  initialRect,
  onDragEnd,
  onResizeEnd,
  enabled = true,
  minWidth = MIN_WIDTH,
  minHeight = MIN_HEIGHT,
}) {
  const [rect, setRect] = useState(initialRect);
  const [resizing, setResizing] = useState(null);
  const [dragging, setDragging] = useState(false);
  const startPos = useRef(null);
  const startRect = useRef(null);

  useEffect(() => {
    setRect(initialRect);
  }, [initialRect]);

  useEffect(() => {
    if (!enabled) return;

    function onMouseMove(e) {
      if (resizing) {
        e.preventDefault();
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;

        let newLeft = startRect.current.left;
        let newTop = startRect.current.top;
        let newWidth = startRect.current.width;
        let newHeight = startRect.current.height;

        if (resizing.includes("e")) {
          newWidth = Math.max(minWidth, startRect.current.width + deltaX);
        }
        if (resizing.includes("s")) {
          newHeight = Math.max(minHeight, startRect.current.height + deltaY);
        }
        if (resizing.includes("w")) {
          newWidth = Math.max(minWidth, startRect.current.width - deltaX);
          newLeft = startRect.current.left + (startRect.current.width - newWidth);
        }
        if (resizing.includes("n")) {
          newHeight = Math.max(minHeight, startRect.current.height - deltaY);
          newTop = startRect.current.top + (startRect.current.height - newHeight);
        }

        setRect({ left: newLeft, top: newTop, width: newWidth, height: newHeight });
      } else if (dragging) {
        e.preventDefault();
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;
        setRect((r) => ({
          ...r,
          left: startRect.current.left + deltaX,
          top: startRect.current.top + deltaY,
        }));
      }
    }

    function onMouseUp() {
      if (resizing) {
        setResizing(null);
        if (onResizeEnd) onResizeEnd(rect);
      }
      if (dragging) {
        setDragging(false);
        if (onDragEnd) onDragEnd(rect);
      }
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [resizing, dragging, rect, onDragEnd, onResizeEnd, enabled, minWidth, minHeight]);

  const onHandleMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    if (!enabled) return;
    setResizing(direction);
    startPos.current = { x: e.clientX, y: e.clientY };
    startRect.current = { ...rect };
  };

  const onDragMouseDown = (e) => {
    if (resizing) return; // prevent drag while resizing
    e.stopPropagation();
    e.preventDefault();
    if (!enabled) return;
    setDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startRect.current = { ...rect };
  };

  return {
    rect,
    onDragMouseDown,
    onHandleMouseDown,
    resizing,
    dragging,
  };
}
