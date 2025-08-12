import React from "react";
import AreaSelection from "./AreaSelection";

export default function SelectionManager({
  containerRef,
  blocks,
  selectedIds,
  setSelectedIds,
   onDeleteSelection,
  onSelectionChange,

}) {
  const handleSelectionBoxChange = (box) => {
    if (!box) {
      setSelectedIds(new Set());
      onSelectionChange && onSelectionChange(new Set());
      return;
    }

    const newlySelected = new Set();

    blocks.forEach((b) => {
      const left = b.position.left;
      const top = b.position.top;
      const right = left + (b.width || 150);
      const bottom = top + (b.height || 40);

      if (
        left >= box.left &&
        right <= box.left + box.width &&
        top >= box.top &&
        bottom <= box.top + box.height
      ) {
        newlySelected.add(b.id);
      }
    });

    setSelectedIds(newlySelected);
    onSelectionChange && onSelectionChange(newlySelected);
  };

  return (
    <>
     <AreaSelection
  containerRef={containerRef}
  onSelectionChange={handleSelectionBoxChange}
  selectedCount={selectedIds.size}
  onDeleteSelection={onDeleteSelection}
/>
    </>
  );
}
