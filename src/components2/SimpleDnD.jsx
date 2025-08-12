import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import UndoRedoWithShortcuts from "./UndoRedoWithShortcuts";
import SelectionManager from "./SelectionManager";
import BlocksRenderer from "./BlocksRenderer";
import RichElementModal from "./RichElementModal";
import SidebarMenu from "./SidebarMenu";
import { BLOCK_TEMPLATES } from "./index";

export default function SimpleDND() {
  const containerRef = useRef(null);

  const initialBlocks = [
    {
      id: "block_header_1",
      ...BLOCK_TEMPLATES.header,
      position: { left: 20, top: 20 },
      width: 600,
      height: 70,
      inserts: [], // initialize inserts
    },
    {
      id: "block_section_1",
      ...BLOCK_TEMPLATES.section,
      position: { left: 20, top: 120 },
      width: 500,
      height: 200,
      inserts: [],
    },
  ];

  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [history, setHistory] = useState([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateBlocks = useCallback(
    (newBlocks) => {
      setBlocks(newBlocks);
      setHistory((history) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newBlocks);
        return newHistory;
      });
      setHistoryIndex((prevIndex) => prevIndex + 1);
      // Note: don't clear selection here so UI stays consistent
    },
    [historyIndex]
  );

  const moveBlock = useCallback(
    (id, newPos) => {
      const updatedBlocks = blocks.map((b) =>
        b.id === id
          ? {
              ...b,
              position: {
                left: newPos.left !== undefined ? newPos.left : b.position.left,
                top: newPos.top !== undefined ? newPos.top : b.position.top,
              },
              width: newPos.width !== undefined ? newPos.width : b.width,
              height: newPos.height !== undefined ? newPos.height : b.height,
            }
          : b
      );
      updateBlocks(updatedBlocks);
    },
    [blocks, updateBlocks]
  );

  // Update inserted element content inside blocks
  const updateInsertedElementContent = useCallback(
    (blockId, elementId, newProps) => {
      const updatedBlocks = blocks.map((block) => {
        if (block.id !== blockId) return block;
        const updatedInserts = (block.inserts || []).map((el) =>
          el.id === elementId ? { ...el, ...newProps } : el
        );
        return { ...block, inserts: updatedInserts };
      });
      updateBlocks(updatedBlocks);
    },
    [blocks, updateBlocks]
  );

  const deleteSelectedBlocks = useCallback(() => {
    if (selectedIds.size === 0) return;
    const filtered = blocks.filter((b) => !selectedIds.has(b.id));
    updateBlocks(filtered);
    setSelectedIds(new Set());
    setSelectedElementId(null);
  }, [blocks, selectedIds, updateBlocks]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setBlocks(history[prevIndex]);
      setHistoryIndex(prevIndex);
      setSelectedIds(new Set());
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setBlocks(history[nextIndex]);
      setHistoryIndex(nextIndex);
      setSelectedIds(new Set());
      setSelectedElementId(null);
    }
  }, [history, historyIndex]);

  const [, drop] = useDrop({
    accept: "NEW_BLOCK",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const scrollLeft = containerRef.current.scrollLeft || 0;
      const scrollTop = containerRef.current.scrollTop || 0;

      const left = clientOffset.x - containerRect.left + scrollLeft;
      const top = clientOffset.y - containerRect.top + scrollTop;

      setBlocks((prevBlocks) => [
        ...prevBlocks,
        {
          id: `block_${Date.now()}`,
          type: item.block.type || "custom",
          tag: item.block.tag,
          content: item.block.content || "",
          style: item.block.style || {},
          position: { left, top },
          width: 150,
          height: 40,
          elements: item.block.elements || [],
          inserts: [],
        },
      ]);
    },
  });

  const setRefs = (node) => {
    containerRef.current = node;
    drop(node);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.size > 0) {
        deleteSelectedBlocks();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, deleteSelectedBlocks]);
  
  // Rich element editing states
  const [editingElement, setEditingElement] = useState(null);
  const [editingElementBlockId, setEditingElementBlockId] = useState(null);

  const onInsertRichElement = (blockId, type) => {
    setEditingElement({ id: null, type, text: "", url: "" });
    setEditingElementBlockId(blockId);
    setSelectedIds(new Set([blockId]));
  };
const onMoveInsert = useCallback(
  (blockId, elementId, newPos) => {
    updateBlocks(
      blocks.map(block => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          inserts: (block.inserts || []).map(el =>
            el.id === elementId
              ? {
                  ...el,
                  position: {
                    ...el.position,
                    ...newPos,
                  },
                }
              : el
          ),
        };
      })
    );
  },
  [blocks, updateBlocks]
);

const onResizeInsert = useCallback(
  (blockId, elementId, newRect) => {
    updateBlocks(
      blocks.map(block => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          inserts: (block.inserts || []).map(el =>
            el.id === elementId
              ? {
                  ...el,
                  position: {
                    ...el.position,
                    left: newRect.left,
                    top: newRect.top,
                  },
                  width: newRect.width,
                  height: newRect.height,
                }
              : el
          ),
        };
      })
    );
  },
  [blocks, updateBlocks]
);




  const onSaveInsertedElement = (data) => {
    if (!editingElementBlockId) return;
    if (!editingElement) return;

    updateBlocks(
      blocks.map((block) => {
        if (block.id !== editingElementBlockId) return block;

        let newInserts = block.inserts ? [...block.inserts] : [];

        if (!editingElement.id) {
          // Insert new
          newInserts.push({
            id: `insert_${Date.now()}`,
            position: { left: 10, top: 10 }, // default position for inserted elements
            ...data,
          });
        } else {
          // Update existing
          newInserts = newInserts.map((el) =>
            el.id === editingElement.id ? { ...el, ...data } : el
          );
        }
        return { ...block, inserts: newInserts };
      })
    );

    setEditingElement(null);
    setEditingElementBlockId(null);
  };

  const onEditElement = (element, blockId) => {
    setEditingElement(element);
    setEditingElementBlockId(blockId);
    setSelectedIds(new Set([blockId]));
    setSelectedElementId(element.id);
  };

  return (
    <>
      <UndoRedoWithShortcuts
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div style={{ display: "flex", height: "100vh" }}>
        <SidebarMenu />

        <div
          ref={setRefs}
          style={{
            position: "relative",
            flexGrow: 1,
            backgroundColor: "#eee",
            overflow: "auto",
            userSelect: "none",
          }}
          onClick={() => {
            setSelectedIds(new Set());
            setSelectedElementId(null);
          }}
        >
          <BlocksRenderer
            blocks={blocks}
            moveBlock={moveBlock}
            selectedIds={selectedIds}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            onEditElement={onEditElement}
            onInsertRichElement={onInsertRichElement}
            onBlockClick={(e, id) => {
              e.stopPropagation();
              const isMultiSelect = e.ctrlKey || e.metaKey;
              setSelectedIds((prevSelected) => {
                const newSelected = new Set(prevSelected);
                if (isMultiSelect) {
                  if (newSelected.has(id)) {
                    newSelected.delete(id);
                  } else {
                    newSelected.add(id);
                  }
                } else {
                  if (newSelected.has(id) && newSelected.size === 1) {
                    newSelected.clear();
                  } else {
                    newSelected.clear();
                    newSelected.add(id);
                  }
                }
                return newSelected;
              });
              setSelectedElementId(null);
            }}
            onDeleteBlock={(id) => {
              const newBlocks = blocks.filter((b) => b.id !== id);
              updateBlocks(newBlocks);
            }}
            
            updateElementContent={updateInsertedElementContent}
              onMoveInsert={onMoveInsert}
              onResizeInsert={onResizeInsert}  
          />

          <SelectionManager
            containerRef={containerRef}
            blocks={blocks}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onDeleteSelection={deleteSelectedBlocks}
          />

          <RichElementModal
            element={editingElement}
            onSave={onSaveInsertedElement}
            onClose={() => {
              setEditingElement(null);
              setEditingElementBlockId(null);
            }}
          />
        </div>
      </div>
    </>
  );
}
