import React, { useEffect } from "react";
import UndoRedoControls from "./UndoRedoControls";

export default function UndoRedoWithShortcuts({ onUndo, onRedo, canUndo, canRedo }) {
  useEffect(() => {
    function handleKeyDown(e) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      if (!ctrlKey) return;

      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) onUndo();
      }

      if (
        e.key.toLowerCase() === "y" ||
        (e.key.toLowerCase() === "z" && e.shiftKey)
      ) {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return <UndoRedoControls onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo} />;
}
