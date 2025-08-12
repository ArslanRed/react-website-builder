import React, { useState, useEffect } from "react";
import DeleteButton from "./DeleteButton";

export default function AreaSelection({
  containerRef,
  onSelectionChange,
  onDeleteSelection,
  selectedCount,
}) {
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);

  const onMouseDown = (e) => {
    if (!containerRef.current || e.target !== containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    setSelecting(true);
    setSelectionStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setSelectionBox(null);
  };

  const onMouseMove = (e) => {
    if (!selecting || !selectionStart || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBox = {
      left: Math.min(x, selectionStart.x),
      top: Math.min(y, selectionStart.y),
      width: Math.abs(x - selectionStart.x),
      height: Math.abs(y - selectionStart.y),
    };

    setSelectionBox(newBox);
    onSelectionChange && onSelectionChange(newBox);
  };

  const onMouseUp = () => {
    if (selecting) {
      setSelecting(false);
      if (selectionBox && (selectionBox.width < 10 || selectionBox.height < 10)) {
        setSelectionBox(null);
        onSelectionChange && onSelectionChange(null);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      if (!container) return;
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selecting, selectionStart, selectionBox]);

  if (!selectionBox) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: selectionBox.left,
        top: selectionBox.top,
        width: selectionBox.width,
        height: selectionBox.height,
        border: "2px dashed #550c4bff",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        pointerEvents: "auto",
        userSelect: "none",
        zIndex: 9999,
      }}
    >
      {selectedCount > 0 && (
        <DeleteButton
          onClick={() => {
            
            onDeleteSelection && onDeleteSelection();
          }}
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            width: 24,
            height: 24,
            borderRadius: "50%",
            zIndex: 10000,
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
          title="Delete selected blocks"
        />
      )}
    </div>
  );
}
