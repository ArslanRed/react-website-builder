import React, { useRef, useState, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import UndoRedoWithShortcuts from "./UndoRedoWithShortcuts";
import SelectionManager from "./SelectionManager";
import BlocksRenderer from "./BlocksRenderer";
import SidebarMenu from "./SidebarMenu";
import { BLOCK_TEMPLATES } from "./index";
import StyleEditor from "./StyleEditor";

export default function SimpleDND() {
  const containerRef = useRef(null);

  const initialBlocks = [
    {
      id: "block_full_header_1",
      ...BLOCK_TEMPLATES.fullHeader,
      position: { left: 10, top: 30 },
      width: 800,
      height: 'auto',
    },
    {
      id: "block_section_1",
      ...BLOCK_TEMPLATES.section,
      position: { left: 20, top: 180 },
      width: 500,
      height: 200,
    },
  ];

  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedElementId, setSelectedElementId] = useState(null);

  const [selectedTarget, setSelectedTarget] = useState({
    type: null,
    blockId: null,
    elementId: null,
  });

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
                left: newPos.left ?? b.position.left,
                top: newPos.top ?? b.position.top,
              },
              width: newPos.width ?? b.width,
              height: newPos.height ?? b.height,
            }
          : b
      );
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

      const template = item.block.type && BLOCK_TEMPLATES[item.block.type];

      setBlocks((prevBlocks) => [
        ...prevBlocks,
        {
          id: `block_${Date.now()}`,
          type: item.block.type || "custom",
          tag: item.block.tag,
          style: { ...item.block.style },
          position: { left, top },
          width:
            template?.type === "component" || template?.type === "text"
              ? "auto"
              : template?.width ?? "auto",
          height:
            template?.type === "component" || template?.type === "text"
              ? "auto"
              : template?.height ?? "auto",
          content: item.block.content || "",
          component: item.block.component,
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
            onBlockClick={(e, id) => {
              e.stopPropagation();
              const isMultiSelect = e.ctrlKey || e.metaKey;
              setSelectedTarget({ type: "block", blockId: id, elementId: null });
              setSelectedIds((prevSelected) => {
                const newSelected = new Set(prevSelected);
                if (isMultiSelect) {
                  newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
                } else {
                  newSelected.clear();
                  newSelected.add(id);
                }
                return newSelected;
              });
              setSelectedElementId(null);
            }}
            onDeleteBlock={(id) => {
              const newBlocks = blocks.filter((b) => b.id !== id);
              updateBlocks(newBlocks);
            }}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget} 
          />

          <SelectionManager
            containerRef={containerRef}
            blocks={blocks}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onDeleteSelection={deleteSelectedBlocks}
          />

          <StyleEditor
            selectedTarget={selectedTarget}
            blocks={blocks}
            updateBlocks={updateBlocks}
          />
        </div>
      </div>
    </>
  );
}
