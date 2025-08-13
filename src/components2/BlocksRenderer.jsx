import React from "react";
import ResizableBlock from "./ResizeableBlock";

export default function BlocksRenderer({
  blocks,
  moveBlock,
  selectedIds,
  onBlockClick,
  onDeleteBlock,
  selectedElementId,
  setSelectedElementId,
  onEditElement,
  onInsertRichElement,
  onMoveInsert,
  onResizeInsert,
}) {
  return (
    <>
      {blocks.map((block) => (
        <ResizableBlock
          key={block.id}
          block={block}
          moveBlock={moveBlock}
          selected={selectedIds.has(block.id)}
          onClick={(e) => onBlockClick(e, block.id)}
          onDelete={() => onDeleteBlock(block.id)}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          onEditElement={onEditElement}
          onInsertRichElement={onInsertRichElement}
          onMoveInsert={onMoveInsert}
          onResizeInsert={onResizeInsert}
        />
      ))}
    </>
  );
}
